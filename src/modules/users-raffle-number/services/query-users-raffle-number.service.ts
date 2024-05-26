import { Injectable } from '@nestjs/common';
import { UsersRaffleNumberRepository } from '../repositories/users-raffle-number-repository';
import { ListOptions } from '@/common/types/list-options.type';
import { UsersRaffleNumber } from '../users-raffle-number.entity';

@Injectable()
export class QueryUsersRaffleNumberService {
  constructor(
    private readonly usersRaffleNumberRepository: UsersRaffleNumberRepository,
  ) {}

  async listUsersRaffleNumber(options: ListOptions<UsersRaffleNumber>) {
    return this.usersRaffleNumberRepository.list(options);
  }

  async getTopBuyers(raffleId: string) {
    return this.usersRaffleNumberRepository.getTopBuyers(raffleId);
  }
}
