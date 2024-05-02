import { IsNotEmpty, IsNumber, Validate } from 'class-validator';
import isValidPhone from '@brazilian-utils/is-valid-phone';

export class GeneratePaymentDto {
  @IsNotEmpty({
    context: {
      userMessage: 'missing-phone',
      message: 'Telefone não informado',
    },
  })
  @Validate((obj: GeneratePaymentDto) => isValidPhone(obj.phone))
  phone: string;

  @IsNotEmpty({
    context: {
      userMessage: 'missing-amount',
      message: 'Quantidade não informada',
    },
  })
  @IsNumber(
    {},
    {
      context: {
        userMessage: 'invalid-amount',
        message: 'Quantidade inválida',
      },
    },
  )
  amount: number;

  @IsNotEmpty({
    context: {
      userMessage: 'missing-raffle_id',
      message: 'Rifa não informada',
    },
  })
  @IsNumber(
    {},
    {
      context: {
        userMessage: 'invalid-raffle_id',
        message: 'Rifa inválida',
      },
    },
  )
  raffle_id: number;
}
