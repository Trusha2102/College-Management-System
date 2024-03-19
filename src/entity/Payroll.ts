// Payroll.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Employee } from './Employee';

@Entity()
export class Payroll {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Employee, (employee) => employee.id)
  employee: Employee;

  @Column()
  month: string;

  @Column()
  year: string;

  @Column()
  status: string;

  @Column()
  earning: number;

  @Column()
  deduction: number;

  @Column()
  net_amount: number;

  @Column()
  is_staff_loan: boolean;

  @Column()
  loan_deduction_amount: number;
}
