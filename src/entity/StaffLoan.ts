// StaffLoan.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from './Employee';
import { Installment } from './Installment';

@Entity()
export class StaffLoan {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Employee, (employee) => employee.id)
  employee!: Employee;

  @Column()
  loan_amount!: number;

  @Column()
  no_of_installments!: number;

  @Column()
  installment_amount!: number;

  @Column()
  status!: String;

  @Column({ nullable: true })
  action_by!: number;

  @Column({ nullable: true })
  collected_on_date!: Date;

  @OneToMany(() => Installment, (installment) => installment.staff_loan)
  installments!: Installment[];

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
