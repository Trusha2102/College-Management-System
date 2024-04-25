import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from './Course';
import { Student } from './Student';
import { Section } from './Section'; // Import Section entity

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

  @OneToMany(() => Student, (student) => student.semester)
  students!: Student[];

  @OneToMany(() => Section, (section) => section.semester)
  section!: Section[];

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
