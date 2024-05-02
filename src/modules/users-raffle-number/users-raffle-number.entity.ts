import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Payment } from '../payment/payment.entity';

@Unique(['raffle_id', 'number'])
@Entity('users_raffle_number')
export class UsersRaffleNumber {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  raffle_id: number;

  @Column()
  number: number;

  @Column()
  payment_id: string;

  @ManyToOne(() => Payment, (payment) => payment.users_raffle_number)
  @JoinColumn({ name: 'payment_id' })
  payment: Payment;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
