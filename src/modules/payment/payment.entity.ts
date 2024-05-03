import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PaymentStatus } from './enums/payment-status.enum';
import { UsersRaffleNumber } from '../users-raffle-number/users-raffle-number.entity';
import { CommonUser } from '../common-user/common-user.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  value: number;

  @Column()
  raffles_quantity: number;

  @Column({ type: 'enum', enum: PaymentStatus })
  status: PaymentStatus;

  @Column({ nullable: true })
  pix_code: string;

  @Column()
  raffle_id: string;

  @Column()
  common_user_id: string;

  @Column({ type: 'timestamp', nullable: true })
  paid_at: Date;

  @OneToMany(() => UsersRaffleNumber, (urNumber) => urNumber.payment)
  users_raffle_number: UsersRaffleNumber[];

  @ManyToOne(() => CommonUser, (commonUser) => commonUser.payments)
  @JoinColumn({ name: 'common_user_id' })
  commonUser: CommonUser;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
