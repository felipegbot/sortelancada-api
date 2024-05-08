import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class GeneratePaymentDto {
  @IsNotEmpty({
    context: {
      userMessage: 'missing-phone',
      message: 'Telefone não informado',
    },
  })
  @IsString({
    context: { userMessage: 'invalid-phone', message: 'Telefone inválido' },
  })
  @IsPhoneNumber('BR')
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
