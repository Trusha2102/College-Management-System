// src/entities/Semester.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Course } from './Course';
import { Result } from './Result';
import { Student } from './Student';

@Entity()
export class Semester {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  semester!: string;

  @ManyToOne(() => Course, (course) => course.semesters, {
    onDelete: 'CASCADE',
  })
  course!: Course;

  @OneToMany(() => Result, (result) => result.semester)
  result!: Result[];

  @OneToMany(() => Student, (student) => student.semester)
  students!: Student[];
}
