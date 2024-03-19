import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Employee } from './Employee';

@Entity()
export class Designation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  designation: string;

  @OneToMany(() => Employee, (employee) => employee.designation)
  employees: Employee[];
}
