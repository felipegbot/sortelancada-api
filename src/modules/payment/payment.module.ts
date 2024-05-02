import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './payment.entity';
import { CommonUserModule } from '../common-user/common-user.module';
import { RaffleModule } from '../raffles/raffle.module';
import { PaymentController } from './controllers/payment.controller';
import { CreatePaymentService } from './services/create-payment.service';
import { PaymentRepository } from './repositories/payment.repository';

@Module({
  controllers: [PaymentController],
  imports: [
    TypeOrmModule.forFeature([Payment]),
    CommonUserModule,
    RaffleModule,
  ],
  providers: [CreatePaymentService, PaymentRepository],
})
export class PaymentModule {}
