import { Injectable } from '@nestjs/common';
import { UsersRaffleNumberRepository } from '../repositories/users-raffle-number-repository';
import { FindOneCommonUserService } from '@/modules/common-user/services';
import ApiError from '@/common/error/entities/api-error.entity';
import { QueryRaffleService } from '@/modules/raffles/services';
import { UsersRaffleNumber } from '../users-raffle-number.entity';

@Injectable()
export class CreateUsersRaffleNumberService {
  constructor(
    private readonly usersRaffleNumberRepository: UsersRaffleNumberRepository,
    private readonly findOneCommonUserService: FindOneCommonUserService,
    private readonly queryRaffleService: QueryRaffleService,
  ) {}

  async generateRaffleNumber(
    raffleId: string,
    amount: number,
    paymentId: string,
    commonUserId: string,
  ): Promise<{ ok: boolean; count: number }> {
    const commonUser = await this.findOneCommonUserService.findOne({
      where: [{ id: commonUserId }],
    });
    const raffle = await this.queryRaffleService.findOneRaffle({
      where: [{ id: raffleId }],
    });

    if (!raffle)
      throw new ApiError('raffle-not-found', 'Sorteio não encontrado', 404);
    if (!commonUser)
      throw new ApiError(
        'common-user-not-found',
        'Usuário não encontrado para este telefone',
        404,
      );

    return this.usersRaffleNumberRepository.buyRandomRaffleNumber(
      raffleId,
      amount,
      paymentId,
      commonUser,
    );
  }

  async deleteUsersRaffleNumberByRaffleId(raffleId: string) {
    return await this.usersRaffleNumberRepository.deleteUsersRaffleNumberByRaffleId(
      raffleId,
    );
  }
}
