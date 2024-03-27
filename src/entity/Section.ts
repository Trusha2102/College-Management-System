import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Class } from './Class';
import { Student } from './Student';

@Entity()
export class Section {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Class, (cls) => cls.sections)
  @JoinColumn({ name: 'class_id' }) // Specify the join column here
  class!: Class;

  @Column()
  section!: string;

  @OneToMany(() => Student, (student) => student.section)
  students!: Student[];
}
