import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Student } from './Student';
import { Course } from './Course';
import { Semester } from './Semester';

@Entity()
export class Result {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Student, (student) => student.result, {
    onDelete: 'CASCADE',
  })
  student!: Student;

  @ManyToOne(() => Course, (course) => course.result, { onDelete: 'CASCADE' })
  course!: Course;

  @ManyToOne(() => Semester, (semester) => semester.result, {
    onDelete: 'CASCADE',
  })
  semester!: Semester;

  @Column()
  result!: string;
}
