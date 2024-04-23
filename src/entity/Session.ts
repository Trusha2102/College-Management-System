// src/entities/Session.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from './Course';
import { Student } from './Student';

@Entity()
export class Session {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  session!: string;

  @Column()
  is_active!: boolean;

  @OneToMany(() => Course, (course) => course.session)
  courses!: Course[];

  @OneToMany(() => Student, (student) => student.session)
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
