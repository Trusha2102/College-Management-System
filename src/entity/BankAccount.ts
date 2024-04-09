// src/entities/BankAccount.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Student } from './Student';
import { User } from './User';

@Entity()
export class BankAccount {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  bank_name!: string;

  @Column({ nullable: true })
  pan_number!: string;

  @Column()
  ifsc!: string;

  @Column()
  branch!: string;

  @Column()
  account_no!: string;

  @ManyToOne(() => Student, (student) => student.bank_details, {
    nullable: true,
  })
  student!: Student;

  @Column({ nullable: true, unique: true })
  student_id!: number;

  @ManyToOne(() => User, (user) => user.bank_details, { nullable: true })
  user!: User;

  @Column({ nullable: true, unique: true })
  user_id!: number;

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
