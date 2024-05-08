import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OldUsersRaffleNumber } from './old-users-raffle-number.entity';
import { CreateOldUsersRaffleNumberService } from './services/create-old-users-raffle-number.service';
import { OldUsersRaffleNumberRepository } from './repositories/old-users-raffle-number.repository';

@Module({
  imports: [TypeOrmModule.forFeature([OldUsersRaffleNumber])],
  providers: [
    CreateOldUsersRaffleNumberService,
    OldUsersRaffleNumberRepository,
  ],
  exports: [CreateOldUsersRaffleNumberService],
})
export class OldUsersRaffleNumberModule {}
