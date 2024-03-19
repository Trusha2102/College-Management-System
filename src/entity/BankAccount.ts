// src/entities/BankAccount.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Student } from './Student';
import { User } from './User';

@Entity()
export class BankAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  bank_name: string;

  @Column({ nullable: true })
  pan_number: string;

  @Column()
  ifsc: string;

  @Column()
  branch: string;

  @Column()
  account_no: string;

  @ManyToOne(() => Student, (student) => student.bank_details, { nullable: true })
  student: Student;

  @Column({ nullable: true, unique: true })
  student_id: number;

  @ManyToOne(() => User, (user) => user.bank_details, { nullable: true })
  user: User;

  @Column({ nullable: true, unique: true })
  user_id: number;
}
