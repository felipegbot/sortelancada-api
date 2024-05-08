import { Injectable } from '@nestjs/common';
import { OldUsersRaffleNumberRepository } from '../repositories/old-users-raffle-number.repository';
import { OldUsersRaffleNumber } from '../old-users-raffle-number.entity';

@Injectable()
export class CreateOldUsersRaffleNumberService {
  constructor(
    private readonly oldUsersRaffleNumberRepository: OldUsersRaffleNumberRepository,
  ) {}
  async insertAll(oldUsersRaffleNumber: OldUsersRaffleNumber[]) {
    return await this.oldUsersRaffleNumberRepository.insertAll(
      oldUsersRaffleNumber,
    );
  }
}
