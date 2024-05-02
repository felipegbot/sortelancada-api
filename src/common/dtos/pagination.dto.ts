import { Transform } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  name?: string;

  @IsInt({
    context: {
      message: 'invalid-page',
      userMessage: 'Página inválida',
    },
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number;

  @IsInt({
    context: {
      message: 'invalid-per_page',
      userMessage: 'Resultados por página inválido',
    },
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  per_page?: number;
}
