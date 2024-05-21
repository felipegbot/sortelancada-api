import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from '../payment.entity';
import { DeepPartial, Repository } from 'typeorm';
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
    if (options.additionalSelects) {
      options.additionalSelects.forEach((select) => {
        qb.addSelect(`payments.${select}`);
      });
    }
    return qb.getOne();
  }

  async getUnvalidatedPayments(): Promise<Payment[]> {
    const qb = this.paymentRepository.createQueryBuilder('payments');
    qb.where('payments.expires_at < :now', { now: new Date() });
    qb.andWhere('payments.status = :status', { status: PaymentStatus.PENDING });

    return qb.getMany();
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

  async updatePaymentData(
    id: string,
    data: DeepPartial<Payment>,
  ): Promise<Payment> {
    const payment = await this.findOne({ where: [{ id }] });
    if (!payment) {
      throw new ApiError('payment-not-found', 'Pagamento não encontrado', 404);
    }
    Object.assign(payment, data);
    const paymentDb = await this.paymentRepository.save(payment);
    return paymentDb;
  }

  async removePayments(payments: Payment[]) {
    return this.paymentRepository.remove(payments);
  }
}
