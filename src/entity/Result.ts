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
