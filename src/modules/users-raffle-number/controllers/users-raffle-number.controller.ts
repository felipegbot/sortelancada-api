import { Controller, Get, Param } from '@nestjs/common';
import { QueryRaffleService } from '@/modules/raffles/services';
import { FindOneCommonUserService } from '@/modules/common-user/services';

@Controller('user-raffle-number')
export class UsersRaffleNumberController {
  constructor(
    private readonly queryRaffleService: QueryRaffleService,
    private readonly findOneCommonUserService: FindOneCommonUserService,
  ) {}

  @Get('raffles-numbers-from-raffle/:raffleId/:userPhone')
  async getAllRafflesNumbers(
    @Param() { raffleId, userPhone }: { raffleId: string; userPhone: string },
  ) {
    const formattedPhone = userPhone.replace(/\D/g, '');
    const user = await this.findOneCommonUserService.findOne({
      where: [{ phone: formattedPhone }],
      relations: ['raffles_numbers_bought'],
    });
    user.raffles_numbers_bought = user.raffles_numbers_bought.filter(
      (raffleNumber) => raffleNumber.raffle_id == raffleId,
    );

    return {
      ok: true,
      raffles: user.raffles_numbers_bought.map(
        (raffleNumber) => raffleNumber.number,
      ),
    };
  }

  @Get('get-raffles-numbers-by-raffle-id/raffleId')
  async getRafflesNumbersByRaffleId() {}
}
