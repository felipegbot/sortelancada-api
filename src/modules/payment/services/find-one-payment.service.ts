import { Injectable } from '@nestjs/common';
import { PaymentRepository } from '../repositories/payment.repository';
import { FindOneOptions } from '@/common/types/find-one-options.type';
import { Payment } from '../payment.entity';

@Injectable()
export class QueryPaymentService {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async findOne(options: FindOneOptions<Payment>): Promise<Payment> {
    return this.paymentRepository.findOne(options);
  }

  async getUnvalidatedPayments(): Promise<Payment[]> {
    return await this.paymentRepository.getUnvalidatedPayments();
  }
}
