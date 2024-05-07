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

@Entity('admin_users')
export class AdminUser {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password_hash: string;

  @OneToMany(() => Raffle, (raffle) => raffle.adminUser)
  raffles: Raffle[];

  @CreateDateColumn({ type: 'timestamptz', select: false })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', select: false })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', select: false })
  deleted_at: Date;
}
