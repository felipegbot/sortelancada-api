import { Injectable } from '@nestjs/common';
import { UsersRaffleNumberRepository } from '../repositories/users-raffle-number-repository';

@Injectable()
export class QueryUsersRaffleNumberService {
  constructor(
    private readonly usersRaffleNumberRepository: UsersRaffleNumberRepository,
  ) {}
  async getTopBuyers(raffleId: string) {
    return this.usersRaffleNumberRepository.getTopBuyers(+raffleId);
  }
}
