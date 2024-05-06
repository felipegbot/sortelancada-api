import { TypeOrmModule } from '@nestjs/typeorm';
import { Raffle } from './raffle.entity';
import { Module, forwardRef } from '@nestjs/common';
import { RaffleRepository } from './repositories/raffle.repository';
import { RaffleController } from './controllers/raffle.controller';
import { CreateRaffleService, QueryRaffleService } from './services';
import { UsersRaffleNumberModule } from '../users-raffle-number/users-raffle-number.module';
import { UploadRaffleMediaService } from './services/upload-raffle-photos.service';

@Module({
  controllers: [RaffleController],
  imports: [
    TypeOrmModule.forFeature([Raffle]),
    forwardRef(() => UsersRaffleNumberModule),
  ],
  providers: [
    RaffleRepository,
    CreateRaffleService,
    QueryRaffleService,
    UploadRaffleMediaService,
  ],
  exports: [QueryRaffleService, CreateRaffleService],
})
export class RaffleModule {}
