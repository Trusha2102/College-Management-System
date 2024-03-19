import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Employee } from './Employee';

@Entity()
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  department: string;

  @OneToMany(() => Employee, (employee) => employee.department)
  employees: Employee[];
}
