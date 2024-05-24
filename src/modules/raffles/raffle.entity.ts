import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RaffleStatus } from './enum/raffle-status.enum';
import { AdminUser } from '../admin-user/admin-user.entity';
import { CommonUser } from '../common-user/common-user.entity';
import { UsersRaffleNumber } from '../users-raffle-number/users-raffle-number.entity';

@Entity('raffles')
export class Raffle {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  date_description: string;

  @Column({ type: 'simple-array', default: '' })
  medias_url: string[];

  @Column({ nullable: true })
  cover_url: string;

  @Column()
  prize_name: string;

  @Column({ type: 'enum', enum: RaffleStatus })
  status: RaffleStatus;

  @Column({ nullable: true })
  prize_number: number;

  @Column({ type: 'simple-array', nullable: true, default: '' })
  gift_numbers: number[];

  @Column({ type: 'simple-json', nullable: true })
  gift_numbers_winners: string;

  @Column({ type: 'simple-array', default: [], select: false })
  available_numbers: number[];

  @Column({ select: false })
  available_numbers_qtd: number;

  @Column()
  initial_numbers_qtd: number;

  @Column()
  min_quantity: number;

  @Column({ type: 'float' })
  price_number: number;

  // Relations

  @Column()
  admin_user_id: string;

  @Column({ nullable: true })
  winner_common_user_id: string;

  @OneToMany(() => UsersRaffleNumber, (urn) => urn.raffle)
  users_raffle_number: UsersRaffleNumber[];

  @ManyToOne(() => AdminUser, (adminUser) => adminUser.raffles)
  @JoinColumn({ name: 'admin_user_id' })
  adminUser: AdminUser;

  @ManyToOne(() => CommonUser, (commonUser) => commonUser.raffles_winned)
  @JoinColumn({ name: 'winner_common_user_id' })
  winner_common_user: CommonUser;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', select: false })
  deleted_at: Date;
}
