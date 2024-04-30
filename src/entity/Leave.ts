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
export class Leave {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => LeaveType)
  leaveType!: LeaveType;

  @ManyToOne(() => Employee)
  employee!: Employee;

  @Column({ type: 'date' })
  apply_date!: Date;

  @Column({ type: 'date' })
  leave_from!: Date;

  @Column({ type: 'date' })
  leave_to!: Date;

  @Column({ type: 'text', nullable: true })
  reason!: string | null;

  @Column({ type: 'text', nullable: true })
  attachment!: string | null;

  @Column({ type: 'text' })
  status!: string;

  @Column({ type: 'int' })
  no_of_leave_days!: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;
}
