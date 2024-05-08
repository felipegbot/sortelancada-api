import { TypeOrmModule } from '@nestjs/typeorm';
import { Raffle } from './raffle.entity';
import { Module, forwardRef } from '@nestjs/common';
import { RaffleRepository } from './repositories/raffle.repository';
import { RaffleController } from './controllers/raffle.controller';
import { CreateRaffleService, QueryRaffleService } from './services';
import { UsersRaffleNumberModule } from '../users-raffle-number/users-raffle-number.module';
import { UploadRaffleMediaService } from './services/upload-raffle-photos.service';
import { OldUsersRaffleNumberModule } from '../old-users-raffle-number/old-users-raffle-number.module';

@Module({
  controllers: [RaffleController],
  imports: [
    TypeOrmModule.forFeature([Raffle]),
    forwardRef(() => UsersRaffleNumberModule),
    OldUsersRaffleNumberModule,
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
