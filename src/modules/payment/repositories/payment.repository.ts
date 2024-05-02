import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from '../payment.entity';
import { Repository } from 'typeorm';
import { PaymentStatus } from '../enums/payment-status.enum';
import ApiError from '@/common/error/entities/api-error.entity';
import { FindOneOptions } from '@/common/types/find-one-options.type';

@Injectable()
export class PaymentRepository {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async createPayment(payment: Payment): Promise<Payment> {
    const paymentDb = await this.paymentRepository.save(payment);
    return paymentDb;
  }

  async findOne(options: FindOneOptions<Payment>): Promise<Payment> {
    const qb = this.paymentRepository.createQueryBuilder('payments');
    if (options.relations) {
      options.relations.forEach((relation) =>
        qb.leftJoinAndSelect(`payments.${relation}`, relation),
      );
    }
    if (options.where) {
      for (const where of options.where) {
        for (const [key, value] of Object.entries(where)) {
          qb.andWhere(`payments.${key} = :${key}`, { [key]: value });
        }
      }
    }
    return qb.getOne();
  }

  async updatePaymentStatus(
    id: string,
    status: PaymentStatus,
  ): Promise<Payment> {
    const payment = await this.findOne({ where: [{ id }] });
    if (!payment) {
      throw new ApiError('payment-not-found', 'Pagamento não encontrado', 404);
    }
    payment.status = status;
    const paymentDb = await this.paymentRepository.save(payment);
    return paymentDb;
  }
}