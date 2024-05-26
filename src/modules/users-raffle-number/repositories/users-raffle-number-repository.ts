import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersRaffleNumber } from '../users-raffle-number.entity';
import { DataSource, Repository } from 'typeorm';
import { CommonUser } from '@/modules/common-user/common-user.entity';
import {
  CreateRaffleService,
  QueryRaffleService,
} from '@/modules/raffles/services';
import ApiError from '@/common/error/entities/api-error.entity';
import { ListOptions } from '@/common/types/list-options.type';

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
      additionalSelects: ['available_numbers', 'available_numbers_qtd'],
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

  async deleteUsersRaffleNumberByRaffleId(
    raffleId: string,
  ): Promise<{ ok: boolean }> {
    await this.usersRaffleNumberRepository.delete({ raffle_id: raffleId });
    return { ok: true };
  }

  async list(
    options: ListOptions<UsersRaffleNumber>,
  ): Promise<{ urns: UsersRaffleNumber[]; count: number }> {
    const qb = this.usersRaffleNumberRepository.createQueryBuilder('urn');
    if (options.where) {
      for (const where of options.where) {
        for (const [key, value] of Object.entries(where)) {
          qb.andWhere(`urn.${key} = :${key}`, { [key]: value });
        }
      }
    }

    if (options.relations) {
      options.relations.forEach((relation) =>
        qb.leftJoinAndSelect(`urn.${relation}`, relation),
      );
    }

    const [urns, count] = await qb.getManyAndCount();

    return { urns, count };
  }

  async getTopBuyers(raffleId: string): Promise<
    {
      common_user_name: string;
      count: number;
    }[]
  > {
    const qb = this.usersRaffleNumberRepository.createQueryBuilder('urn');
    qb.where('urn.raffle_id = :raffleId', { raffleId });

    qb.select('COUNT(urn.common_user_id) as count');

    qb.leftJoinAndSelect('urn.common_user', 'common_user');
    qb.addGroupBy('common_user.id');

    qb.orderBy('count', 'DESC');
    qb.take(3);
    const result = await qb.getRawMany();
    const formattedResult = result.map((obj) => {
      return {
        common_user_name: obj.common_user_name as string,
        count: obj.count as number,
      };
    });
    //should get only the top 3
    const finalResult = formattedResult.slice(0, 3);
    return finalResult;
  }
}
