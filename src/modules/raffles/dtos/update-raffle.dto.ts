import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateRaffleDto {
  @IsOptional()
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

  @IsOptional()
  @IsString({
    context: {
      message: 'invalid-date_description',
      userMessage: 'Descrição da data inválida',
    },
  })
  date_description: string;

  @IsOptional()
  @IsString({
    context: { message: 'invalid-prize_name', userMessage: 'Prêmio inválido' },
  })
  prize_name: string;

  @IsOptional()
  @IsNumber(
    {},
    {
      context: {
        message: 'invalid-prize_number',
        userMessage: 'Número do prêmio inválido',
      },
    },
  )
  prize_number: number;

  @IsOptional()
  @IsArray({
    context: {
      message: 'invalid-gift_numbers',
      userMessage: 'Números premiados com brinde inválidos',
    },
  })
  gift_numbers: number[];
}
