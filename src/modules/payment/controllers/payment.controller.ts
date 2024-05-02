import { Body, Controller, Post } from '@nestjs/common';
import { GeneratePaymentDto } from '../dtos/generate-payment.dto';
import { FindOneCommonUserService } from '@/modules/common-user/services';
import { CreatePaymentService } from '../services/create-payment.service';
import ApiError from '@/common/error/entities/api-error.entity';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly findOneCommonUserService: FindOneCommonUserService,
    private readonly createPaymentService: CreatePaymentService,
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
    return { ok: true, payment };
  }

  @Post('/confirm-payment/:payment_id')
  async confirmPayment() {
    //TODO: Implementar confirmação de pagamento via webhook
    console.log('confirmPayment');
  }
}
