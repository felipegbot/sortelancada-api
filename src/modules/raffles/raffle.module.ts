import { TypeOrmModule } from '@nestjs/typeorm';
import { Raffle } from './raffle.entity';
import { Module } from '@nestjs/common';
import { RaffleRepository } from './repositories/raffle.repository';
import { RaffleController } from './controllers/raffle.controller';
import { CreateRaffleService, QueryRaffleService } from './services';

@Module({
  controllers: [RaffleController],
  imports: [TypeOrmModule.forFeature([Raffle])],
  providers: [RaffleRepository, CreateRaffleService, QueryRaffleService],
})
export class RaffleModule {}
