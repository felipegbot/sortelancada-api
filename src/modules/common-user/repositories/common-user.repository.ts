import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { DeepPartial, Repository } from 'typeorm';
import ApiError from '@/common/error/entities/api-error.entity';
import { CommonUser } from '../common-user.entity';
import { FindOneOptions } from '@/common/types/find-one-options.type';

@Injectable()
export class CommonUserRepository {
  constructor(
    @InjectRepository(CommonUser)
    private readonly userRepository: Repository<CommonUser>,
  ) {}

  async create(commonUser: CommonUser): Promise<CommonUser> {
    const dbUser = await this.userRepository.save(commonUser);
    return dbUser;
  }

  async findOne(options: FindOneOptions<CommonUser>): Promise<CommonUser> {
    const qb = this.userRepository.createQueryBuilder('common_users');

    if (options.relations) {
      options.relations.forEach((relation) => {
        qb.leftJoinAndSelect(`common_users.${relation}`, relation);
      });
    }

    if (options.where) {
      for (const where of options.where) {
        for (const [key, value] of Object.entries(where)) {
          qb.andWhere(`common_users.${key} = :${key}`, { [key]: value });
        }
      }
    }

    if (options.with_users_raffle_number) {
      if (!options.relations.includes('payments')) {
        qb.leftJoinAndSelect('common_users.payments', 'payments');
      }
      qb.leftJoinAndSelect(
        'payments.users_raffle_number',
        'users_raffle_number',
      );
    }

    const commonUser = await qb.getOne();
    return commonUser;
  }

  async update(
    id: string,
    userData: DeepPartial<CommonUser>,
  ): Promise<CommonUser> {
    const user = await this.userRepository.findOne({ where: [{ id }] });
    if (!user)
      throw new ApiError('user-not-found', 'Usuário comum não encontrado', 404);
    Object.assign(user, userData);
    return await this.userRepository.save(user);
  }
}
