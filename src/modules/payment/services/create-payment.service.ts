import { Injectable } from '@nestjs/common';
import { PaymentRepository } from '../repositories/payment.repository';
import { GeneratePaymentDto } from '../dtos/generate-payment.dto';
import { Payment } from '../payment.entity';
import { CommonUser } from '@/modules/common-user/common-user.entity';
import { QueryRaffleService } from '@/modules/raffles/services';
import ApiError from '@/common/error/entities/api-error.entity';
import { PaymentStatus } from '../enums/payment-status.enum';
import { createPixPayment } from '@/common/mercadopago/api';
import moment from '@/common/libs/moment';

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

    // TODO: Implementar cálculo de descontos customizados
    try {
      const date_of_expiration = moment().add(30, 'minutes');
      console.log(date_of_expiration.toISOString());
      const payment = new Payment();
      payment.raffles_quantity = generatePaymentDto.amount;
      payment.raffle_id = `${generatePaymentDto.raffle_id}`;
      payment.common_user_id = user.id;
      payment.status = PaymentStatus.PENDING;
      payment.expires_at = date_of_expiration.toDate();
      payment.value = raffle.price_number * generatePaymentDto.amount;
      const paymentDb = await this.paymentRepository.createPayment(payment);

      const { id, point_of_interaction } = await createPixPayment({
        transaction_amount: paymentDb.value,
        email: generatePaymentDto.email,
        internal_payment_id: paymentDb.id,
        date_of_expiration: date_of_expiration.toISOString(),
      });
      const { qr_code: pix_code, qr_code_base64: pix_qr_code } =
        point_of_interaction.transaction_data;

      const finalPayment = await this.paymentRepository.updatePaymentData(
        paymentDb.id,
        {
          mercadopago_id: `${id}`,
          pix_code,
          pix_qr_code,
        },
      );
      return finalPayment;
    } catch (error) {
      console.log(error);
      throw new ApiError(
        'payment-error',
        'Erro ao criar pagamento, tente novamente mais tarde',
        400,
      );
    }
  }

  async updatePaymentStatus(
    id: string,
    status: PaymentStatus,
  ): Promise<Payment> {
    return this.paymentRepository.updatePaymentStatus(id, status);
  }
}
