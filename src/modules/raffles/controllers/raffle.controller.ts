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
import { QueryUsersRaffleNumberService } from '@/modules/users-raffle-number/services/query-users-raffle-number.service';
import ApiError from '@/common/error/entities/api-error.entity';
import { UpdateRaffleDto } from '../dtos/update-raffle.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { RaffleStatus } from '../enum/raffle-status.enum';
import { UploadRaffleMediaService } from '../services/upload-raffle-photos.service';
import { CreateUsersRaffleNumberService } from '@/modules/users-raffle-number/services/create-users-raffle-number.service';
import { CreateOldUsersRaffleNumberService } from '@/modules/old-users-raffle-number/services/create-old-users-raffle-number.service';
import { ListRaffleDto } from '../dtos/list-raffle.dto';
import { ListOptions } from '@/common/types/list-options.type';
import { Raffle } from '../raffle.entity';

@Controller('raffles')
export class RaffleController {
  constructor(
    private readonly createRaffleService: CreateRaffleService,
    private readonly queryUsersRaffleNumberService: QueryUsersRaffleNumberService,
    private readonly createUsersRaffleNumberService: CreateUsersRaffleNumberService,
    private readonly queryRaffleService: QueryRaffleService,
    private readonly uploadRaffleMediaService: UploadRaffleMediaService,
    private readonly createOldUsersRaffleNumberService: CreateOldUsersRaffleNumberService,
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
  async listRaffle(@Query() query: ListRaffleDto) {
    const queryOptions: ListOptions<Raffle> = {
      ...query,
      relations: ['winner_common_user'],
    };

    if (query.status) queryOptions.where = [{ status: query.status }];

    const { raffles, count } =
      await this.queryRaffleService.queryRaffle(queryOptions);
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

  @Post('update-cover/:raffleId')
  @UseInterceptors(FilesInterceptor('cover'))
  @UseGuards(JwtAuthGuard)
  async updateCover(
    @UploadedFiles() cover: Express.Multer.File[],
    @Param('raffleId') raffleId: string,
  ) {
    const raffle = await this.queryRaffleService.findOneRaffle({
      where: [{ id: raffleId }],
    });
    if (!raffle) {
      throw new ApiError('raffle-not-found', 'Rifa não encontrada', 404);
    }
    if (!cover[0]) {
      throw new ApiError('invalid-cover', 'Capa inválida', 400);
    }

    const cover_url = await this.uploadRaffleMediaService.uploadMedia([
      cover[0],
    ]);

    if (raffle.cover_url)
      await this.uploadRaffleMediaService.deleteMedia(raffle.cover_url);

    const updatedRaffle = await this.createRaffleService.updateRaffle(
      raffleId,
      { cover_url: cover_url[0] },
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
    const { urns } =
      await this.queryUsersRaffleNumberService.listUsersRaffleNumber({
        where: [{ raffle_id: raffleId }],
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
        gift_numbers_winners: JSON.stringify(
          giftWinners.map((urn) => {
            return { ...urn.common_user, number: urn.number };
          }),
        ),
      },
    );

    await this.createOldUsersRaffleNumberService.insertAll(urns);

    await this.createUsersRaffleNumberService.deleteUsersRaffleNumberByRaffleId(
      raffleId,
    );

    return { ok: true, raffle: updatedRaffle };
  }

  @Get(':raffleId')
  async findOneRaffle(@Param('raffleId') raffleId: string) {
    const raffle = await this.queryRaffleService.findOneRaffle({
      where: [{ id: raffleId }],
      relations: ['winner_common_user'],
    });
    const { initial_numbers_qtd, available_numbers_qtd } = raffle;
    const percentage = (available_numbers_qtd / initial_numbers_qtd) * 100;
    delete raffle.available_numbers_qtd;
    return { ok: true, raffle, percentage };
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
