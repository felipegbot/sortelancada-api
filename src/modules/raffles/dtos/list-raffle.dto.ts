import { PaginationDto } from '@/common/dtos/pagination.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { RaffleStatus } from '../enum/raffle-status.enum';

export class ListRaffleDto extends PaginationDto {
  @IsOptional()
  @IsEnum(RaffleStatus, {
    context: {
      message: 'invalid-status',
      userMessage: 'Status de rifa inválido',
    },
  })
  status: RaffleStatus;
}
