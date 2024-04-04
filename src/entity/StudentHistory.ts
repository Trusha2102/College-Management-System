import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Student } from './Student';
import { Course } from './Course';
import { Semester } from './Semester';
import { Session } from './Session';
import { Result } from './Result';
import { FeesPayment } from './FeesPayment';

@Entity()
export class StudentHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Student)
  student!: Student;

  @ManyToOne(() => Course)
  course!: Course;

  @ManyToOne(() => Semester)
  semester!: Semester;

  @ManyToOne(() => Session)
  session!: Session;

  @ManyToOne(() => Result)
  result!: Result;

  @ManyToOne(() => FeesPayment)
  payment!: FeesPayment;

  @Column({ enum: ['continue', 'leave'], nullable: true })
  next_course_status!: 'continue' | 'leave';
}
