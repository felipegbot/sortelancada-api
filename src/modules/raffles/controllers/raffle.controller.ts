import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateRaffleService } from '../services';
import { CreateRaffleDto } from '../dtos/create-raffle.dto';
import { Request } from 'express';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { AdminUser } from '@/modules/admin-user/admin-user.entity';
import { QueryRaffleService } from '../services/query-raffle.service';
import { PaginationDto } from '@/common/dtos/pagination.dto';
import { QueryUsersRaffleNumberService } from '@/modules/users-raffle-number/services/query-users-raffle-number.service';

@Controller('raffles')
export class RaffleController {
  constructor(
    private readonly createRaffleService: CreateRaffleService,
    private readonly queryUsersRaffleNumberService: QueryUsersRaffleNumberService,
    private readonly queryRaffleService: QueryRaffleService,
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
