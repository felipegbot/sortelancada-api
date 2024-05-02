import { Injectable } from '@nestjs/common';
import { AdminUser } from '../admin-user.entity';
import { AdminUserRepository } from '../repositories/admin-user.repository';
import { FindOneOptions } from '@/common/types/find-one-options.type';

@Injectable()
export class FindOneAdminUserService {
  constructor(private readonly adminUserRepository: AdminUserRepository) {}

  async findOne(options: FindOneOptions<AdminUser>): Promise<AdminUser> {
    return await this.adminUserRepository.findOne(options);
  }
}
