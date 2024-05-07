import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Payment } from '../payment/payment.entity';
import { CommonUser } from '../common-user/common-user.entity';
import { Raffle } from '../raffles/raffle.entity';

@Unique(['raffle_id', 'number'])
@Entity('users_raffle_number')
export class UsersRaffleNumber {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  @Index('common_user_id_index')
  common_user_id: string;

  @Column()
  raffle_id: string;

  @Column()
  number: number;

  @Column()
  payment_id: string;

  @ManyToOne(
    () => CommonUser,
    (commonUser) => commonUser.raffles_numbers_bought,
  )
  @JoinColumn({ name: 'common_user_id' })
  common_user: CommonUser;

  @ManyToOne(() => Raffle, (raffle) => raffle.users_raffle_number)
  @JoinColumn({ name: 'raffle_id' })
  raffle: Raffle;

  @ManyToOne(() => Payment, (payment) => payment.users_raffle_number)
  @JoinColumn({ name: 'payment_id' })
  payment: Payment;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
