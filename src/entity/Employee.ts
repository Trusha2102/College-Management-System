import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { User } from './User';
import { Designation } from './Designation';
import { Department } from './Department';
import { Attendance } from './Attendance';
import { Payroll } from './Payroll';
import { StaffLoan } from './StaffLoan';
import { BankAccount } from './BankAccount';

@Entity()
export class Employee {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.id)
  user!: User;

  @Column({ unique: true })
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

  @Column({ nullable: true })
  contract_type!: string;

  @Column({ type: 'date', nullable: true })
  doj!: Date;

  @Column({
    type: 'date',
    nullable: true,
    transformer: {
      to: (value: Date | string) => {
        if (value instanceof Date) {
          return value;
        } else if (value === '') {
          return null;
        } else {
          return new Date(value);
        }
      },
      from: (value: Date | null) => {
        return value;
      },
    },
  })
  dol!: Date | null;

  @Column({ nullable: true })
  work_shift!: string;

  @Column({ default: true })
  is_active!: boolean;

  @Column({ nullable: true })
  work_location!: string;

  @OneToMany(() => Attendance, (attendance) => attendance.employee)
  attendance!: Attendance[];

  @OneToMany(() => Payroll, (payroll) => payroll.employee)
  payroll!: Payroll[];

  @OneToMany(() => StaffLoan, (staffLoan) => staffLoan.employee)
  staff_loan!: StaffLoan[];

  @OneToOne(() => BankAccount)
  @JoinColumn()
  bank_details!: BankAccount;

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
