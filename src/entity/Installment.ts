import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
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

  @Column()
  status!: boolean;
}
