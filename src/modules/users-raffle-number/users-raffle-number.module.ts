import { Module, forwardRef } from '@nestjs/common';
import { CreateUsersRaffleNumberService } from './services/create-users-raffle-number.service';
import { UsersRaffleNumber } from './users-raffle-number.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRaffleNumberController } from './controllers/users-raffle-number.controller';
import { UsersRaffleNumberRepository } from './repositories/users-raffle-number-repository';
import { RaffleModule } from '../raffles/raffle.module';
import { CommonUserModule } from '../common-user/common-user.module';
import { QueryUsersRaffleNumberService } from './services/query-users-raffle-number.service';

@Module({
  controllers: [UsersRaffleNumberController],
  imports: [
    TypeOrmModule.forFeature([UsersRaffleNumber]),
    CommonUserModule,
    forwardRef(() => RaffleModule),
  ],
  providers: [
    CreateUsersRaffleNumberService,
    UsersRaffleNumberRepository,
    QueryUsersRaffleNumberService,
  ],
  exports: [CreateUsersRaffleNumberService, QueryUsersRaffleNumberService],
})
export class UsersRaffleNumberModule {}
