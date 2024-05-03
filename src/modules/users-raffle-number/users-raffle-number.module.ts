import { Module } from '@nestjs/common';
import { CreateUsersRaffleNumberService } from './services/create-users-raffle-number.service';
import { UsersRaffleNumber } from './users-raffle-number.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRaffleNumberController } from './controllers/users-raffle-number.controller';
import { UsersRaffleNumberRepository } from './repositories/users-raffle-number-repository';
import { RaffleModule } from '../raffles/raffle.module';
import { CommonUserModule } from '../common-user/common-user.module';

@Module({
  controllers: [UsersRaffleNumberController],
  imports: [
    TypeOrmModule.forFeature([UsersRaffleNumber]),
    CommonUserModule,
    RaffleModule,
  ],
  providers: [CreateUsersRaffleNumberService, UsersRaffleNumberRepository],
  exports: [CreateUsersRaffleNumberService],
})
export class UsersRaffleNumberModule {}
