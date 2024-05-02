import { Injectable } from '@nestjs/common';
import { CommonUser } from '../common-user.entity';
import { CommonUserRepository } from '../repositories/common-user.repository';
import { FindOneOptions } from '@/common/types/find-one-options.type';

@Injectable()
export class FindOneCommonUserService {
  constructor(private readonly commonUserRepository: CommonUserRepository) {}

  async findOne(options: FindOneOptions<CommonUser>): Promise<CommonUser> {
    return await this.commonUserRepository.findOne(options);
  }
}
