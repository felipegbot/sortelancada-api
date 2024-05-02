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

  @CreateDateColumn({ select: false })
  created_at: Date;

  @UpdateDateColumn({ select: false })
  updated_at: Date;

  @DeleteDateColumn({ select: false })
  deleted_at: Date;
}
