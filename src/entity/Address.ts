import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Student } from './Student';
import { User } from './User';

@Entity()
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address_type: string;

  @Column()
  house_no: string;

  @Column()
  address_line_1: string;

  @Column()
  address_line_2: string;

  @ManyToOne(() => Student, (student) => student.address, { nullable: true })
  student: Student;

  @Column({ nullable: true, unique: true })
  student_id: number;

  @ManyToOne(() => User, (user) => user.address, { nullable: true })
  user: User;

  @Column({ nullable: true, unique: true })
  user_id: number;
}
