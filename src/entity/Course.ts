// src/entities/Course.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Session } from './Session';
import { Semester } from './Semester';
import { Result } from './Result';
import { FeesType } from './FeesType';
import { Student } from './Student';

@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @ManyToOne(() => Session, (session) => session.courses)
  session!: Session;

  @Column()
  session_id!: number;

  @OneToMany(() => Semester, (semester) => semester.course)
  semesters!: Semester[];

  @OneToMany(() => Result, (result) => result.course)
  result!: Result[];

  @OneToMany(() => FeesType, (feesType) => feesType.course)
  fees_type!: FeesType[];

  @OneToMany(() => Student, (student) => student.course)
  students!: Student[];
}
