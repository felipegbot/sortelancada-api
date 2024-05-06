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
import { ValidateWebhookService } from './services/validate-payment-webhook.service';

@Module({
  controllers: [PaymentController],
  imports: [
    TypeOrmModule.forFeature([Payment]),
    CommonUserModule,
    RaffleModule,
    UsersRaffleNumberModule,
  ],
  providers: [
    CreatePaymentService,
    QueryPaymentService,
    PaymentRepository,
    ValidateWebhookService,
  ],
})
export class PaymentModule {}
