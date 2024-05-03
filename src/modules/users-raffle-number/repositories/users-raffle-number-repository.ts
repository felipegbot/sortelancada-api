import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersRaffleNumber } from '../users-raffle-number.entity';
import { DataSource, Repository } from 'typeorm';
import { CommonUser } from '@/modules/common-user/common-user.entity';
import { RaffleRepository } from '@/modules/raffles/repositories/raffle.repository';
import {
  CreateRaffleService,
  QueryRaffleService,
} from '@/modules/raffles/services';
import ApiError from '@/common/error/entities/api-error.entity';

@Injectable()
export class UsersRaffleNumberRepository {
  constructor(
    @InjectRepository(UsersRaffleNumber)
    private readonly usersRaffleNumberRepository: Repository<UsersRaffleNumber>,
    private readonly createRaffleService: CreateRaffleService,
    private readonly queryRaffleService: QueryRaffleService,
    private dataSource: DataSource,
  ) {}
  logger = new Logger(UsersRaffleNumberRepository.name);

  async buyRandomRaffleNumber(
    raffleId: string,
    amount: number,
    paymentId: string,
    commonUser: CommonUser,
  ): Promise<{ ok: boolean; count: number }> {
    // while the user didn't bought the numbers
    // we keep generating random numbers and trying to save them to the database

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    let boughtNumbers: UsersRaffleNumber[] = [];

    const raffle = await this.queryRaffleService.findOneRaffle({
      where: [{ id: raffleId }],
    });

    let { available_numbers } = raffle;
    for (let i = 0; i < amount; i++) {
      // first we generate a random index
      const randomIndex = Math.round(
        Math.random() * (available_numbers.length - 1),
      );
      // then we push the number to the boughtNumbers array
      const raffleNumber = new UsersRaffleNumber();
      raffleNumber.number = available_numbers[randomIndex];
      raffleNumber.raffle_id = raffleId;
      raffleNumber.common_user_id = commonUser.id;
      raffleNumber.payment_id = paymentId;
      boughtNumbers.push(raffleNumber);
      // then we remove the number from the available_numbers array
      available_numbers.splice(randomIndex, 1);

      // repeat
    }

    // save the bought numbers to the database using transaction, if one fails, rollback
    try {
      await queryRunner.startTransaction();
      await queryRunner.manager.save(boughtNumbers, { chunk: 10000 });
      await queryRunner.commitTransaction();
      await this.createRaffleService.updateRaffle(raffleId, {
        available_numbers,
      });
      await queryRunner.release();
      return { ok: true, count: boughtNumbers.length };
    } catch (error) {
      this.logger.error(
        `error buying number for user ${commonUser.id} with payment ${paymentId} in raffle ${raffleId}`,
      );
      this.logger.error(error);
      await queryRunner.rollbackTransaction();
      throw new ApiError(
        'error',
        'Erro ao salvar os números, por favor entre em contato com o suporte',
        500,
      );
    }
  }
}
