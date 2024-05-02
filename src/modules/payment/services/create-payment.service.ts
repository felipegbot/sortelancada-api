import { Injectable } from '@nestjs/common';
import { PaymentRepository } from '../repositories/payment.repository';
import { GeneratePaymentDto } from '../dtos/generate-payment.dto';
import { Payment } from '../payment.entity';
import { CommonUser } from '@/modules/common-user/common-user.entity';
import { QueryRaffleService } from '@/modules/raffles/services';
import ApiError from '@/common/error/entities/api-error.entity';
import { PaymentStatus } from '../enums/payment-status.enum';

@Injectable()
export class CreatePaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly queryRaffleService: QueryRaffleService,
  ) {}

  async createPayment(
    generatePaymentDto: GeneratePaymentDto,
    user: CommonUser,
  ): Promise<Payment> {
    const raffle = await this.queryRaffleService.findOneRaffle({
      where: [{ id: generatePaymentDto.raffle_id }],
    });
    if (!raffle)
      throw new ApiError('raffle-not-found', 'Rifa não encontrada', 404);

    const payment = new Payment();
    payment.raffles_quantity = generatePaymentDto.amount;
    payment.raffle_id = `${generatePaymentDto.raffle_id}`;
    payment.commonUser = user;
    payment.status = PaymentStatus.PENDING;
    // TODO: Implementar cálculo de descontos customizados
    payment.value = raffle.price_number * generatePaymentDto.amount;
    // TODO: Implementar geração do código de cobrança via PIX
    const paymentDb = await this.paymentRepository.createPayment(payment);
    return paymentDb;
  }
}
