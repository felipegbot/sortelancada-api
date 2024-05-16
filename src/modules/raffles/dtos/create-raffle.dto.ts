import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRaffleDto {
  @IsNotEmpty()
  @IsString({
    context: { message: 'invalid-name', userMessage: 'Nome inválido' },
  })
  name: string;

  @IsOptional()
  @IsString({
    context: {
      message: 'invalid-description',
      userMessage: 'Descrição inválida',
    },
  })
  description: string;

  @IsNotEmpty()
  @IsString({
    context: { message: 'invalid-prize_name', userMessage: 'Prêmio inválido' },
  })
  prize_name: string;

  @IsNotEmpty()
  @IsNumber(
    {},
    {
      context: {
        message: 'invalid-start_number',
        userMessage: 'Número inicial inválido',
      },
    },
  )
  start_number: number;

  @IsNotEmpty()
  @IsNumber(
    {},
    {
      context: {
        message: 'invalid-end_number',
        userMessage: 'Número final inválido',
      },
    },
  )
  end_number: number;

  @IsNotEmpty()
  @IsNumber(
    {},
    {
      context: {
        message: 'invalid-min_quantity',
        userMessage: 'Quantidade mínima inválida',
      },
    },
  )
  min_quantity: number;

  @IsNotEmpty()
  @IsNumber(
    {},
    {
      context: {
        message: 'invalid-price_number',
        userMessage: 'Preço por número inválido',
      },
    },
  )
  price_number: number;
}
