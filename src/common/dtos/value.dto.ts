import { IsNotEmpty, IsNumber } from 'class-validator';

export class ValueDto {
  @IsNotEmpty({
    context: {
      message: 'missing-value',
      userMessage: 'Valor obrigatório',
    },
  })
  @IsNumber(
    {},
    {
      context: {
        message: 'invalid-value',
        userMessage: 'Valor inválido',
      },
    },
  )
  value: number;
}
