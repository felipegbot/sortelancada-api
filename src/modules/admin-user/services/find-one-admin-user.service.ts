import { Injectable } from '@nestjs/common';
import { AdminUser } from '../admin-user.entity';
import { FindOneAdminUserOptions } from '../interfaces/find-one-admin-user.interface';
import { AdminUserRepository } from '../repositories/admin-user.repository';

@Injectable()
export class FindOneAdminUserService {
  constructor(private readonly adminUserRepository: AdminUserRepository) {}

  async findOne(options: FindOneAdminUserOptions): Promise<AdminUser> {
    return await this.adminUserRepository.findOne(options);
  }
}
