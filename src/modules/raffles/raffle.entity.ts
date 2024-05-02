import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RaffleStatus } from './enum/raffle-status.enum';
import { AdminUser } from '../admin-user/admin-user.entity';
import { CommonUser } from '../common-user/common-user.entity';

@Entity('raffles')
export class Raffle {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'simple-array', default: [] })
  photos_url: string[];

  @Column()
  prize_name: string;

  @Column({ type: 'enum', enum: RaffleStatus })
  status: RaffleStatus;

  @Index()
  @Column({ nullable: true })
  prize_number: number;

  @Column({ type: 'simple-array', default: [] })
  available_numbers: number[];

  @Column()
  available_numbers_qtd: number;

  @Column()
  initial_numbers_qtd: number;

  @Column({ type: 'float' })
  price_number: number;

  // Relations

  @Column()
  admin_user_id: string;

  @Column({ nullable: true })
  winner_common_user_id: string;

  @ManyToOne(() => AdminUser, (adminUser) => adminUser.raffles)
  @JoinColumn({ name: 'admin_user_id' })
  adminUser: AdminUser;

  @ManyToOne(() => CommonUser, (commonUser) => commonUser.raffles_winned)
  @JoinColumn({ name: 'winner_common_user_id' })
  winner_common_user: CommonUser;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({ select: false })
  deleted_at: Date;
}
