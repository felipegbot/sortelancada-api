import { Injectable } from '@nestjs/common';
import { CommonUser } from '../common-user.entity';
import { CommonUserRepository } from '../repositories/common-user.repository';

@Injectable()
export class CreateCommonUserService {
  constructor(private readonly commonUserRepository: CommonUserRepository) {}

  async createUser(createCommonUserDto: CommonUser): Promise<CommonUser> {
    return await this.commonUserRepository.create(createCommonUserDto);
  }
}
