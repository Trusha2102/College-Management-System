import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FeesPayment } from './FeesPayment';

@Entity()
export class BankPayment {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => FeesPayment, { eager: true })
  feesPayment!: FeesPayment;

  @Column({ default: 'Pending' })
  status!: string;

  @Column({ nullable: true })
  status_date!: Date;

  @Column({ type: 'text', nullable: true })
  comment!: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: false,
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    nullable: false,
  })
  updatedAt!: Date;
}
