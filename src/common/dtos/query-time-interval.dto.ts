import { IsDateString, IsOptional } from 'class-validator';

export class QueryTimeIntervalDto {
  @IsOptional()
  @IsDateString(
    { strict: true },
    {
      context: {
        message: 'invalid-start_date',
        userMessage: 'Data de início inválida',
      },
    },
  )
  start_date?: string;

  @IsOptional()
  @IsDateString(
    { strict: true },
    {
      context: {
        message: 'invalid-end_date',
        userMessage: 'Data de fim inválida',
      },
    },
  )
  end_date?: string;
}
