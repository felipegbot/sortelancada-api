import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Raffle } from '../raffle.entity';
import ApiError from '@/common/error/entities/api-error.entity';
import { ListOptions } from '@/common/types/list-options.type';
import { FindOneOptions } from '@/common/types/find-one-options.type';
import { UsersRaffleNumber } from '@/modules/users-raffle-number/users-raffle-number.entity';

@Injectable()
export class RaffleRepository {
  constructor(
    @InjectRepository(Raffle)
    private readonly raffleRepository: Repository<Raffle>,
  ) {}

  async createRaffle(raffle: Raffle): Promise<Raffle> {
    const raffleDb = await this.raffleRepository.save(raffle);
    return raffleDb;
  }

  async listRaffle(options: ListOptions<Raffle>): Promise<{
    raffles: Raffle[];
    count: number;
  }> {
    const qb = this.raffleRepository.createQueryBuilder('raffles');
    const { page = 1, per_page = 10 } = options;

    if (options.name) {
      qb.where('raffles.name ILIKE :name', { name: `%${options.name}%` });
    }

    if (options.where) {
      for (const where of options.where) {
        for (const [key, value] of Object.entries(where)) {
          qb.andWhere(`raffles.${key} = :${key}`, { [key]: value });
        }
      }
    }

    if (options.ids) {
      qb.andWhereInIds(options.ids);
    }
    if (options.additionalSelects) {
      for (const additionalSelect of options.additionalSelects) {
        qb.addSelect(`raffles.${additionalSelect}`);
      }
    }
    if (options.relations) {
      options.relations.forEach((relation) =>
        qb.leftJoinAndSelect(`raffles.${relation}`, relation),
      );
    }

    qb.orderBy('raffles.created_at', 'DESC');

    qb.skip((page - 1) * per_page);
    qb.take(per_page);

    const [raffles, count] = await qb.getManyAndCount();
    return { raffles, count };
  }

  async findOne(
    options: FindOneOptions<Raffle>,
  ): Promise<Raffle & { winners?: UsersRaffleNumber[] }> {
    const qb = this.raffleRepository.createQueryBuilder('raffles');
    if (options.where) {
      for (const where of options.where) {
        for (const [key, value] of Object.entries(where)) {
          qb.andWhere(`raffles.${key} = :${key}`, { [key]: value });
        }
      }
    }
    if (options.additionalSelects) {
      for (const additionalSelect of options.additionalSelects) {
        qb.addSelect(`raffles.${additionalSelect}`);
      }
    }
    if (options.relations) {
      options.relations.forEach((relation) =>
        qb.leftJoinAndSelect(`raffles.${relation}`, relation),
      );
    }
    qb.addSelect('raffles.available_numbers_qtd');
    const raffle = await qb.getOne();

    if (options.raffle_with_gift_winners && raffle.gift_numbers.length > 0) {
      try {
        const newQb = this.raffleRepository.createQueryBuilder('raffles');
        newQb.where('raffles.id = :id', { id: raffle.id });
        newQb.leftJoinAndSelect(
          'raffles.users_raffle_number',
          'users_raffle_number',
        );
        newQb.leftJoinAndSelect(
          'users_raffle_number.common_user',
          'common_user',
        );
        // the winner is the user that has the prize number or one of the gift numbers
        newQb.andWhere('users_raffle_number.number IN (:...numbers)', {
          numbers: raffle.gift_numbers,
        });

        const raffleWithGiftNumbers = await newQb.getOne();
        return {
          ...raffle,
          winners: raffleWithGiftNumbers.users_raffle_number,
        };
      } catch (error) {}
    }

    return raffle;
  }

  async getWinners(raffleId: string): Promise<{
    winner: UsersRaffleNumber;
    giftWinners: UsersRaffleNumber[];
  }> {
    const qb = this.raffleRepository.createQueryBuilder('raffles');
    qb.where('raffles.id = :id', { id: raffleId });

    const rawRaffle = await qb
      .select(['raffles.prize_number', 'raffles.gift_numbers'])
      .getRawOne();

    // this is a simple array of numbers as string, so we need to split it and convert it to numbers
    const preFormattedGiftNumber = rawRaffle.raffles_gift_numbers.replace(
      /\[|\]/g,
      '',
    );

    const giftNumbers =
      preFormattedGiftNumber === ''
        ? []
        : preFormattedGiftNumber.split(',').map((n: string) => parseInt(n)) ??
          [];
    if (!rawRaffle.raffles_prize_number)
      throw new ApiError(
        'raffle-didnt-has-prize-number',
        'Rifa não possui número premiado',
        400,
      );
    const flattenedNumbers = [rawRaffle.raffles_prize_number, ...giftNumbers];

    qb.leftJoinAndSelect('raffles.users_raffle_number', 'users_raffle_number');
    qb.leftJoinAndSelect('users_raffle_number.common_user', 'common_user');
    // the winner is the user that has the prize number or one of the gift numbers
    qb.andWhere('users_raffle_number.number IN (:...numbers)', {
      numbers: flattenedNumbers,
    });

    const raffle = await qb.getOne();

    return {
      winner: raffle?.users_raffle_number?.find(
        (urn) => urn.number == raffle.prize_number,
      ),
      giftWinners: raffle?.users_raffle_number?.filter((urn) =>
        giftNumbers.includes(urn.number),
      ),
    };
  }

  async update(
    raffleId: string,
    raffleData: DeepPartial<Raffle>,
  ): Promise<Raffle> {
    const raffle = await this.raffleRepository.findOne({
      where: { id: raffleId },
    });
    if (!raffle) {
      throw new ApiError('raffle-not-found', 'Rifa não encontrada', 404);
    }
    Object.assign(raffle, raffleData);
    return this.raffleRepository.save(raffle);
  }
}
