import { Injectable } from '@nestjs/common';
import { CommonUser } from '../common-user.entity';
import { FindOneCommonUserOptions } from '../interfaces/find-one-common-user-options.interface';
import { CommonUserRepository } from '../repositories/common-user.repository';

@Injectable()
export class FindOneCommonUserService {
  constructor(private readonly commonUserRepository: CommonUserRepository) {}

  async findOne(options: FindOneCommonUserOptions): Promise<CommonUser> {
    return await this.commonUserRepository.findOne(options);
  }
}
