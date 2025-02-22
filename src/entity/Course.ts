// src/entities/Course.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
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

  @OneToMany(() => Student, (student) => student.course)
  students!: Student[];

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
