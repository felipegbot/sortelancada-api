import { TypeOrmModule } from '@nestjs/typeorm';
import { Raffle } from './raffle.entity';
import { Module, forwardRef } from '@nestjs/common';
import { RaffleRepository } from './repositories/raffle.repository';
import { RaffleController } from './controllers/raffle.controller';
import { CreateRaffleService, QueryRaffleService } from './services';
import { UsersRaffleNumberModule } from '../users-raffle-number/users-raffle-number.module';
import { UploadRafflePhotosService } from './services/upload-raffle-photos.service';

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
    UploadRafflePhotosService,
  ],
  exports: [QueryRaffleService, CreateRaffleService],
})
export class RaffleModule {}
