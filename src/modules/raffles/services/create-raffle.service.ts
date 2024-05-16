import { Injectable } from '@nestjs/common';
import { RaffleRepository } from '../repositories/raffle.repository';
import { Raffle } from '../raffle.entity';
import { CreateRaffleDto } from '../dtos/create-raffle.dto';
import { AdminUser } from '@/modules/admin-user/admin-user.entity';
import { RaffleStatus } from '../enum/raffle-status.enum';
import { DeepPartial } from 'typeorm';

@Injectable()
export class CreateRaffleService {
  constructor(private readonly raffleRepository: RaffleRepository) {}

  async createRaffle(
    createRaffleDto: CreateRaffleDto,
    adminUser: AdminUser,
  ): Promise<Raffle> {
    const raffle = new Raffle();

    raffle.name = createRaffleDto.name;
    raffle.description = createRaffleDto.description;
    raffle.prize_name = createRaffleDto.prize_name;
    raffle.price_number = createRaffleDto.price_number;
    raffle.min_quantity = createRaffleDto.min_quantity;
    raffle.status = RaffleStatus.OPEN;
    raffle.admin_user_id = adminUser.id;

    const raffleNumbersLength =
      createRaffleDto.end_number - createRaffleDto.start_number + 1;
    raffle.available_numbers = Array.from(
      { length: raffleNumbersLength },
      (_, i) => i + createRaffleDto.start_number,
    );
    raffle.initial_numbers_qtd = raffleNumbersLength;
    raffle.available_numbers_qtd = raffleNumbersLength;

    const raffleDb = await this.raffleRepository.createRaffle(raffle);

    // here we only return to the user the initial and end numbers
    raffleDb.available_numbers = [
      createRaffleDto.start_number,
      createRaffleDto.end_number,
    ];
    return raffleDb;
  }

  async updateRaffle(
    id: string,
    raffleData: DeepPartial<Raffle>,
  ): Promise<Raffle> {
    return await this.raffleRepository.update(id, raffleData);
  }
}
