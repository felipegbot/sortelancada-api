import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersRaffleNumber } from '../users-raffle-number.entity';
import { DataSource, Repository } from 'typeorm';
import { CommonUser } from '@/modules/common-user/common-user.entity';
import { RaffleRepository } from '@/modules/raffles/repositories/raffle.repository';

@Injectable()
export class UsersRaffleNumberRepository {
  constructor(
    @InjectRepository(UsersRaffleNumber)
    private readonly usersRaffleNumberRepository: Repository<UsersRaffleNumber>,
    private readonly raffleRepository: RaffleRepository,
    private dataSource: DataSource,
  ) {}

  async buyRandomRaffleNumber(
    raffleId: string,
    amount: number,
    paymentId: string,
    commonUser: CommonUser,
  ): Promise<any> {
    let didBought = false;

    // while the user didn't bought the numbers
    // we keep generating random numbers and trying to save them to the database
    while (!didBought) {
      const raffle = await this.raffleRepository.findOne({
        where: [{ id: raffleId }],
      });

      let { available_numbers } = raffle;
      let boughtNumbers: UsersRaffleNumber[] = [];

      for (let i = 0; i < amount; i++) {
        // first we generate a random index
        const randomIndex = Math.round(
          Math.random() * available_numbers.length,
        );
        // then we push the number to the boughtNumbers array
        const raffleNumber = new UsersRaffleNumber();
        raffleNumber.number = available_numbers[randomIndex];
        raffleNumber.raffle_id = raffleId;
        raffleNumber.user_id = commonUser.id;
        raffleNumber.payment_id = paymentId;

        boughtNumbers.push(raffleNumber);
        // then we remove the number from the available_numbers array
        available_numbers = available_numbers.slice(randomIndex, 1);

        // repeat
      }

      // save the bought numbers to the database using transaction, if one fails, rollback
      const queryRunner = this.dataSource.createQueryRunner();
      queryRunner.connect();
      queryRunner.startTransaction();
      try {
        queryRunner.manager.save(boughtNumbers);
        queryRunner.commitTransaction();
        await queryRunner.release();
        await this.raffleRepository.update(raffleId, {
          available_numbers,
        });
        didBought = true;
        return boughtNumbers;
      } catch (error) {
        queryRunner.rollbackTransaction();
      }
    }
  }
}
