import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Student } from './Student';
import { Course } from './Course';

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

  @Column()
  result!: string;

  @Column({ nullable: true })
  current_session_id!: string;

  @Column({ nullable: true })
  promote_session_id!: string;

  @Column({ nullable: true })
  current_semester_id!: string;

  @Column({ nullable: true })
  promote_semester_id!: string;

  @Column({ nullable: true })
  next_course_status!: string;

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
