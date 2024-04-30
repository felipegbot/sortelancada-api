import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { CreateRaffleService } from '../services';
import { CreateRaffleDto } from '../dtos/create-raffle.dto';
import { Request } from 'express';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { AdminUser } from '@/modules/admin-user/admin-user.entity';

@Controller('raffles')
export class RaffleController {
  constructor(private readonly createRaffleService: CreateRaffleService) {}

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
}
