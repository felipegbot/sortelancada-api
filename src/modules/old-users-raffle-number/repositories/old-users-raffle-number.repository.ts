import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { OldUsersRaffleNumber } from '../old-users-raffle-number.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class OldUsersRaffleNumberRepository {
  constructor(
    @InjectRepository(OldUsersRaffleNumber)
    private readonly oldRafflesRepositories: Repository<OldUsersRaffleNumber>,
  ) {}

  async insertAll(oldUsersRaffleNumber: OldUsersRaffleNumber[]) {
    return await this.oldRafflesRepositories.save(oldUsersRaffleNumber, {
      chunk: 5000,
    });
  }
}
