import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import ApiError from '@/common/error/entities/api-error.entity';
import { CommonUser } from '../common-user.entity';
import { FindOneCommonUserOptions } from '../interfaces/find-one-common-user-options.interface';

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

  async findOne(options: FindOneCommonUserOptions): Promise<CommonUser> {
    const qb = this.userRepository.createQueryBuilder('common_users');

    if (options.relations) {
      options.relations.forEach((relation) => {
        qb.leftJoinAndSelect(`common_users.${relation}`, relation);
      });
    }

    if (options.key && options.value)
      qb.where(`common_users.${options.key} = :value`, {
        value: options.value,
      });

    const commonUser = await qb.getOne();
    return commonUser;
  }

  async updateUserPassword(id: string, password_hash: string) {
    try {
      const commonUser = await this.findOne({ key: 'id', value: id });
      return await this.userRepository.save({ ...commonUser, password_hash });
    } catch (error) {}
    throw new ApiError(
      'error-updating-commonUser-password',
      'Erro ao atualizar a senha, contate o suporte',
      500,
    );
  }
}
