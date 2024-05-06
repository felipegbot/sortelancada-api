import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateRaffleService } from '../services';
import { CreateRaffleDto } from '../dtos/create-raffle.dto';
import { Request } from 'express';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { AdminUser } from '@/modules/admin-user/admin-user.entity';
import { QueryRaffleService } from '../services/query-raffle.service';
import { PaginationDto } from '@/common/dtos/pagination.dto';
import { QueryUsersRaffleNumberService } from '@/modules/users-raffle-number/services/query-users-raffle-number.service';
import ApiError from '@/common/error/entities/api-error.entity';
import { UpdateRaffleDto } from '../dtos/update-raffle.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import ParseImagesPipe from '@/common/pipes/parse-image.pipe';
import { ProcessedImage, SharpPipe } from '@/common/pipes/sharp.pipe';
import { RaffleStatus } from '../enum/raffle-status.enum';
import { UploadRaffleMediaService } from '../services/upload-raffle-photos.service';
import { CreateUsersRaffleNumberService } from '@/modules/users-raffle-number/services/create-users-raffle-number.service';

@Controller('raffles')
export class RaffleController {
  constructor(
    private readonly createRaffleService: CreateRaffleService,
    private readonly queryUsersRaffleNumberService: QueryUsersRaffleNumberService,
    private readonly createUsersRaffleNumberService: CreateUsersRaffleNumberService,
    private readonly queryRaffleService: QueryRaffleService,
    private readonly uploadRaffleMediaService: UploadRaffleMediaService,
  ) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createRaffle(
    @Req() req: Request,
    @Body() createRaffleDto: CreateRaffleDto,
  ) {
    const adminUser = req.user as AdminUser;
    const raffle = await this.createRaffleService.createRaffle(
      createRaffleDto,
      adminUser,
    );

    return { ok: true, raffle };
  }

  @Get('list')
  async listRaffle(@Query() query: PaginationDto) {
    const { raffles, count } = await this.queryRaffleService.queryRaffle(query);
    raffles.forEach((raffle) => {
      delete raffle.available_numbers;
    });
    return { ok: true, raffles, total: count };
  }

  @Post('update/:raffleId')
  @UseGuards(JwtAuthGuard)
  async updateRaffle(
    @Param('raffleId') raffleId: string,
    @Body() updateRaffleDto: UpdateRaffleDto,
  ) {
    const raffle = await this.queryRaffleService.findOneRaffle({
      where: [{ id: raffleId }],
    });

    if (!raffle) {
      throw new ApiError('raffle-not-found', 'Rifa não encontrada', 404);
    }

    const updatedRaffle = await this.createRaffleService.updateRaffle(
      raffleId,
      updateRaffleDto,
    );
    return { ok: true, raffle: updatedRaffle };
  }

  @Post('upload-photo/:raffleId')
  @UseInterceptors(FilesInterceptor('medias'))
  @UseGuards(JwtAuthGuard)
  async uploadPhoto(
    @UploadedFiles()
    media: Express.Multer.File[],
    @Param('raffleId') raffleId: string,
  ) {
    const raffle = await this.queryRaffleService.findOneRaffle({
      where: [{ id: raffleId }],
    });

    if (!raffle) {
      throw new ApiError('raffle-not-found', 'Rifa não encontrada', 404);
    }

    const medias_url = await this.uploadRaffleMediaService.uploadMedia(media);

    const updatedRaffle = await this.createRaffleService.updateRaffle(
      raffleId,
      { medias_url: [...raffle.medias_url, ...medias_url] },
    );
    return { ok: true, raffle: updatedRaffle };
  }

  @Delete('delete-photo/:raffleId')
  async updatePhoto(
    @Param('raffleId') raffleId: string,
    @Body() { mediaUrl }: { mediaUrl: string },
  ) {
    const raffle = await this.queryRaffleService.findOneRaffle({
      where: [{ id: raffleId }],
    });

    if (!raffle) {
      throw new ApiError('raffle-not-found', 'Rifa não encontrada', 404);
    }

    const filteredPhotos = raffle.medias_url.filter(
      (photo) => photo !== mediaUrl,
    );

    const updatedRaffle = await this.createRaffleService.updateRaffle(
      raffleId,
      { medias_url: filteredPhotos },
    );

    await this.uploadRaffleMediaService.deleteMedia(mediaUrl);
    return { ok: true, raffle: updatedRaffle };
  }

  @Post('finish/:raffleId')
  async finishRaffle(@Param('raffleId') raffleId: string) {
    const raffle = await this.queryRaffleService.findOneRaffle({
      where: [{ id: raffleId }],
    });
    if (!raffle) {
      throw new ApiError('raffle-not-found', 'Rifa não encontrada', 404);
    }
    const { winner: winnerRaffleNumber, giftWinners } =
      await this.queryRaffleService.getWinners(raffleId);

    if (!winnerRaffleNumber)
      throw new ApiError('winner-not-found', 'Vencedor não encontrado', 404);

    const updatedRaffle = await this.createRaffleService.updateRaffle(
      raffleId,
      {
        status: RaffleStatus.FINISHED,
        winner_common_user_id: winnerRaffleNumber?.common_user_id,
        gift_numbers_winners: giftWinners.map((urn) => {
          return { ...urn.common_user, number: urn.number };
        }),
      },
    );

    await this.createUsersRaffleNumberService.eraseUserNumbersByRaffleId(
      raffleId,
    );

    return { ok: true, raffle: updatedRaffle };
  }

  @Get(':raffleId')
  async findOneRaffle(@Param('raffleId') raffleId: string) {
    const raffle = await this.queryRaffleService.findOneRaffle({
      where: [{ id: raffleId }],
    });
    return { ok: true, raffle };
  }

  @Get('winners/:raffleId')
  @UseGuards(JwtAuthGuard)
  async getWinners(@Param('raffleId') raffleId: string) {
    const { winner, giftWinners } =
      await this.queryRaffleService.getWinners(raffleId);
    return { ok: true, winner, giftWinners };
  }

  @Get('top-buyers/:raffleId')
  async getTopBuyers(@Param('raffleId') raffleId: string) {
    const topBuyers =
      await this.queryUsersRaffleNumberService.getTopBuyers(raffleId);
    return { ok: true, topBuyers };
  }
}
