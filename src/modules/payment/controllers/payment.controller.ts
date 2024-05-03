import { Body, Controller, Param, Post } from '@nestjs/common';
import { GeneratePaymentDto } from '../dtos/generate-payment.dto';
import { FindOneCommonUserService } from '@/modules/common-user/services';
import { CreatePaymentService } from '../services/create-payment.service';
import ApiError from '@/common/error/entities/api-error.entity';
import {
  CreateRaffleService,
  QueryRaffleService,
} from '@/modules/raffles/services';
import { CreateUsersRaffleNumberService } from '@/modules/users-raffle-number/services/create-users-raffle-number.service';
import { QueryPaymentService } from '../services/find-one-payment.service';
import { PaymentStatus } from '../enums/payment-status.enum';
import * as AsyncLock from 'async-lock';

@Controller('payment')
export class PaymentController {
  private lock: AsyncLock;

  constructor(
    private readonly findOneCommonUserService: FindOneCommonUserService,
    private readonly createPaymentService: CreatePaymentService,
    private readonly createRaffleService: CreateRaffleService,
    private readonly queryPaymentService: QueryPaymentService,
    private readonly queryRaffleService: QueryRaffleService,
    private readonly createUsersRaffleNumberService: CreateUsersRaffleNumberService,
  ) {
    this.lock = new AsyncLock();
  }

  @Post('/generate-payment')
  async generatePayment(@Body() generatePaymentDto: GeneratePaymentDto) {
    const { phone } = generatePaymentDto;
    const formattedPhone = phone.replace(/\D/g, '');
    generatePaymentDto.phone = formattedPhone;
    const commonUser = await this.findOneCommonUserService.findOne({
      where: [{ phone: formattedPhone }],
    });
    if (!commonUser)
      throw new ApiError(
        'common-user-not-found',
        'Usuário não encontrado com esse telefone',
        404,
      );
    const raffle = await this.queryRaffleService.findOneRaffle({
      where: [{ id: generatePaymentDto.raffle_id }],
    });
    if (!raffle)
      throw new ApiError('raffle-not-found', 'Rifa não encontrada', 404);
    if (raffle.available_numbers_qtd < generatePaymentDto.amount) {
      throw new ApiError(
        'invalid-amount',
        'Quantidade de números indisponível',
        400,
      );
    }

    const payment = await this.createPaymentService.createPayment(
      generatePaymentDto,
      commonUser,
    );

    await this.createRaffleService.updateRaffle(raffle.id, {
      available_numbers_qtd:
        raffle.available_numbers_qtd - generatePaymentDto.amount,
    });
    return { ok: true, payment };
  }

  @Post('/cancel-payment/:payment_id')
  async cancelPayment() {
    // TODO: implementar cancelamento de pagamento via webhook, e atualizar a quantidade de números disponíveis
    console.log('cancelPayment');
  }

  @Post('/confirm-payment/:payment_id')
  async confirmPayment(@Param('payment_id') paymentId: string) {
    const payment = await this.queryPaymentService.findOne({
      where: [{ id: paymentId }],
    });

    if (!payment || payment.status !== PaymentStatus.PENDING)
      throw new ApiError(
        'payment-not-found',
        'Pagamento pendente não encontrado',
        404,
      );
    const { ok, count } = await this.lock.acquire(
      'generateRaffleNumber',
      async () => {
        const { count } =
          await this.createUsersRaffleNumberService.generateRaffleNumber(
            payment.raffle_id,
            payment.raffles_quantity,
            payment.id,
            payment.common_user_id,
          );

        await this.createPaymentService.updatePaymentStatus(
          payment.id,
          PaymentStatus.SUCCESS,
        );
        //TODO: Implementar confirmação de pagamento via webhook

        return { ok: true, count };
      },
    );
    return { ok, count };
  }
}
