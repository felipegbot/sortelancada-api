import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonUser } from './common-user.entity';
import { CommonUserController } from './controllers/common-user.controller';
import { CommonUserRepository } from './repositories/common-user.repository';
import { FindOneCommonUserService, CreateCommonUserService } from './services';

@Module({
  controllers: [CommonUserController],
  imports: [TypeOrmModule.forFeature([CommonUser])],
  providers: [
    CreateCommonUserService,
    FindOneCommonUserService,
    CommonUserRepository,
  ],
  exports: [CreateCommonUserService, FindOneCommonUserService],
})
export class CommonUserModule {}
