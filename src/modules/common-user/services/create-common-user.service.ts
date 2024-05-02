import { Injectable } from '@nestjs/common';
import { CommonUser } from '../common-user.entity';
import { CommonUserRepository } from '../repositories/common-user.repository';
import { DeepPartial } from 'typeorm';
import { CreateCommonUserDto } from '../dtos/create-common-user.dto';

@Injectable()
export class CreateCommonUserService {
  constructor(private readonly commonUserRepository: CommonUserRepository) {}

  async createUser(
    createCommonUserDto: CreateCommonUserDto,
  ): Promise<CommonUser> {
    const commonUser = new CommonUser();
    Object.assign(commonUser, createCommonUserDto);
    return await this.commonUserRepository.create(commonUser);
  }

  async updateUser(
    id: string,
    updateUser: DeepPartial<CommonUser>,
  ): Promise<CommonUser> {
    return await this.commonUserRepository.update(id, updateUser);
  }
}
