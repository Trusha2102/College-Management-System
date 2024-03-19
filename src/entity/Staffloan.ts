// StaffLoan.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Employee } from './Employee';

@Entity()
export class StaffLoan {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Employee, (employee) => employee.id)
  employee: Employee;

  @Column()
  loan_amount: number;

  @Column()
  no_of_installments: number;

  @Column()
  installment_amount: number;

  @Column()
  status: string;

  @Column()
  action_by: number;
}
