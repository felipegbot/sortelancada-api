import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './payment.entity';
import { CommonUserModule } from '../common-user/common-user.module';
import { RaffleModule } from '../raffles/raffle.module';
import { PaymentController } from './controllers/payment.controller';
import { CreatePaymentService } from './services/create-payment.service';
import { PaymentRepository } from './repositories/payment.repository';
import { QueryPaymentService } from './services/find-one-payment.service';
import { UsersRaffleNumberModule } from '../users-raffle-number/users-raffle-number.module';

@Module({
  controllers: [PaymentController],
  imports: [
    TypeOrmModule.forFeature([Payment]),
    CommonUserModule,
    RaffleModule,
    UsersRaffleNumberModule,
  ],
  providers: [CreatePaymentService, QueryPaymentService, PaymentRepository],
})
export class PaymentModule {}
