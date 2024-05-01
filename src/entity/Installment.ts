import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StaffLoan } from './StaffLoan';

@Entity()
export class Installment {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => StaffLoan, (staffLoan) => staffLoan.installments)
  staff_loan!: StaffLoan;

  @Column({ nullable: true })
  pay_date!: Date;

  @Column()
  amount!: number;

  @Column()
  month!: string;

  @Column()
  year!: string;

  @Column({ default: false })
  status!: boolean;

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
