import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('old_users_raffle_number')
export class OldUsersRaffleNumber {
  @PrimaryGeneratedColumn()
  mockId?: string;

  @Column()
  id: string;

  @Column({ nullable: true })
  common_user_id: string;

  @Column({ nullable: true })
  raffle_id: string;

  @Column({ nullable: true })
  number: number;

  @Column({ nullable: true })
  payment_id: string;

  @Column({ type: 'timestamptz' })
  created_at: Date;

  @Column({ type: 'timestamptz' })
  updated_at: Date;
}
