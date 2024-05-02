import { Body, Controller, Post } from '@nestjs/common';
import { GeneratePaymentDto } from '../dtos/generate-payment.dto';
import { FindOneCommonUserService } from '@/modules/common-user/services';
import { CreatePaymentService } from '../services/create-payment.service';
import ApiError from '@/common/error/entities/api-error.entity';
import {
  CreateRaffleService,
  QueryRaffleService,
} from '@/modules/raffles/services';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly findOneCommonUserService: FindOneCommonUserService,
    private readonly createPaymentService: CreatePaymentService,
    private readonly createRaffleService: CreateRaffleService,
    private readonly queryRaffleService: QueryRaffleService,
  ) {}

  @Post('/generate-payment')
  async generatePayment(@Body() generatePaymentDto: GeneratePaymentDto) {
    const commonUser = await this.findOneCommonUserService.findOne({
      where: [{ phone: generatePaymentDto.phone }],
    });
    if (!commonUser)
      throw new ApiError(
        'common-user-not-found',
        'Usuário não encontrado com esse telefone',
        404,
      );
    const payment = await this.createPaymentService.createPayment(
      generatePaymentDto,
      commonUser,
    );

    const raffle = await this.queryRaffleService.findOneRaffle({
      where: [{ id: generatePaymentDto.raffle_id }],
    });

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
  async confirmPayment() {
    //TODO: Implementar confirmação de pagamento via webhook
    console.log('confirmPayment');
  }
}