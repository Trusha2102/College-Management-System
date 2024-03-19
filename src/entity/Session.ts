// src/entities/Session.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Course } from './Course';
import { Student } from './Student';

@Entity()
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  session: string;

  @Column()
  is_active: boolean;

  @OneToMany(() => Course, (course) => course.session)
  courses: Course[];

  @OneToMany(() => Student, (student) => student.student_session)
  students: Student[];
}
