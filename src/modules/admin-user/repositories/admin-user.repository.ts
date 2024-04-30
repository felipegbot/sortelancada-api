import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminUser } from '../admin-user.entity';
import { Repository } from 'typeorm';
import { FindOneAdminUserOptions } from '../interfaces/find-one-admin-user.interface';

@Injectable()
export class AdminUserRepository {
  constructor(
    @InjectRepository(AdminUser)
    private readonly adminUserRepository: Repository<AdminUser>,
  ) {}

  async findOne(options: FindOneAdminUserOptions): Promise<AdminUser> {
    const qb = this.adminUserRepository.createQueryBuilder('admin_users');
    if (options.relations) {
      options.relations.forEach((relation) =>
        qb.leftJoinAndSelect(`admin_users.${relation}`, relation),
      );
    }
    if (options.withPasswordHash) qb.addSelect('admin_users.password_hash');

    if (options.key && options.value)
      qb.where(`admin_users.${options.key} = :value`, {
        value: options.value,
      });

    const adminUser = await qb.getOne();
    return adminUser;
  }
}
