// Employee.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './User';
import { Designation } from './Designation';
import { Department } from './Department';
import { Attendance } from './Attendance';
import { Payroll } from './Payroll';
import { StaffLoan } from './StaffLoan';

@Entity()
export class Employee {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.id)
  user!: User;

  @Column()
  staff_id!: number;

  @ManyToOne(() => Designation, (designation) => designation.id)
  designation!: Designation;

  @Column()
  designation_id!: number;

  @ManyToOne(() => Department, (department) => department.id)
  department!: Department;

  @Column()
  department_id!: number;

  @Column()
  salary!: number;

  @Column()
  deduction!: number;

  @Column()
  contract_type!: string;

  @Column()
  DOJ!: Date;

  @Column({ nullable: true })
  DOL!: Date;

  @Column()
  work_shift!: string;

  @Column()
  work_location!: string;

  @OneToMany(() => Attendance, (attendance) => attendance.staff)
  attendance!: Attendance[];

  @OneToMany(() => Payroll, (payroll) => payroll.employee)
  payroll!: Payroll[];

  @OneToMany(() => StaffLoan, (staffLoan) => staffLoan.employee)
  staff_loan!: StaffLoan[];
}
