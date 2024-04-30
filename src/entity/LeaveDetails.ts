import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LeaveType } from './LeaveType';
import { Employee } from './Employee';

@Entity()
export class LeaveDetail {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => LeaveType)
  leaveType!: LeaveType;

  @ManyToOne(() => Employee)
  employee!: Employee;

  @Column({ type: 'int' })
  totalLeaves!: number;

  @Column({ type: 'int' })
  availableLeaves!: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;
}
