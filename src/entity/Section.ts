// src/entities/Section.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Class } from './Class';
import { Student } from './Student';

@Entity()
export class Section {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Class, (cls) => cls.sections)
  class!: Class;

  @Column()
  class_id!: number;

  @Column()
  section!: string;

  @OneToMany(() => Student, (student) => student.section)
  students!: Student[];
}
