import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Raffle } from '../raffles/raffle.entity';
import { Payment } from '../payment/payment.entity';
import { UsersRaffleNumber } from '../users-raffle-number/users-raffle-number.entity';

@Entity('common_users')
export class CommonUser {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  phone: string;

  @OneToMany(() => Raffle, (raffle) => raffle.winner_common_user)
  raffles_winned: Raffle[];

  @OneToMany(() => Payment, (payment) => payment.commonUser)
  payments: Payment[];

  @OneToMany(
    () => UsersRaffleNumber,
    (usersRaffleNumber) => usersRaffleNumber.common_user,
  )
  raffles_numbers_bought: UsersRaffleNumber[];

  @CreateDateColumn({ type: 'timestamptz', select: false })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', select: false })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', select: false })
  deleted_at: Date;
}
