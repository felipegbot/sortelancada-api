import { Injectable } from '@nestjs/common';
import { RaffleRepository } from '../repositories/raffle.repository';
import { ListOptions } from '@/common/types/list-options.type';
import { Raffle } from '../raffle.entity';
import { FindOneOptions } from '@/common/types/find-one-options.type';

@Injectable()
export class QueryRaffleService {
  constructor(private readonly raffleRepository: RaffleRepository) {}

  async queryRaffle(options: ListOptions<Raffle>) {
    return this.raffleRepository.listRaffle(options);
  }

  async findOneRaffle(options: FindOneOptions<Raffle>) {
    return this.raffleRepository.findOne(options);
  }

  async getWinners(raffleId: string) {
    return this.raffleRepository.getWinners(raffleId);
  }
}
