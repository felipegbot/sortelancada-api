import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Raffle } from '../raffle.entity';
import ApiError from '@/common/error/entities/api-error.entity';
import { ListOptions } from '@/common/types/list-options.type';
import { FindOneOptions } from '@/common/types/find-one-options.type';

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

    if (options.relations) {
      options.relations.forEach((relation) =>
        qb.leftJoinAndSelect(`raffles.${relation}`, relation),
      );
    }

    qb.skip((page - 1) * per_page);
    qb.take(per_page);

    const [raffles, count] = await qb.getManyAndCount();
    return { raffles, count };
  }

  async findOne(options: FindOneOptions<Raffle>): Promise<Raffle> {
    const qb = this.raffleRepository.createQueryBuilder('raffles');
    if (options.relations) {
      options.relations.forEach((relation) =>
        qb.leftJoinAndSelect(`raffles.${relation}`, relation),
      );
    }
    if (options.where) {
      for (const where of options.where) {
        for (const [key, value] of Object.entries(where)) {
          qb.andWhere(`raffles.${key} = :${key}`, { [key]: value });
        }
      }
    }

    const raffle = await qb.getOne();
    return raffle;
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
