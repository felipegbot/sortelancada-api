import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonUser } from './common-user.entity';
import { UserController } from './controllers/common-user.controller';
import { CommonUserRepository } from './repositories/common-user.repository';
import { CreateCommonUserService } from './services/create-common-user.service';
import { FindOneCommonUserService } from './services/find-one-common-user.service';

@Module({
  controllers: [UserController],
  imports: [TypeOrmModule.forFeature([CommonUser])],
  providers: [
    CreateCommonUserService,
    FindOneCommonUserService,
    CommonUserRepository,
  ],
  exports: [CreateCommonUserService, FindOneCommonUserService],
})
export class UserModule {}
