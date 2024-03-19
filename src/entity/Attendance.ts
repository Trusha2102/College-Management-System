// Attendance.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Employee } from './Employee';

@Entity()
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Employee, (employee) => employee.id)
  staff: Employee;

  @Column()
  date: Date;

  @Column()
  attendance: string;
}
