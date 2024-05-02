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

@Controller('raffles')
export class RaffleController {
  constructor(
    private readonly createRaffleService: CreateRaffleService,
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
    return { ok: true, raffles, total: count };
  }

  @Get(':raffleId')
  async findOneRaffle(@Param('raffleId') raffleId: string) {
    const raffle = await this.queryRaffleService.findOneRaffle({
      where: [{ id: raffleId }],
    });
    return { ok: true, raffle };
  }
}
