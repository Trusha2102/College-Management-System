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
  @Column({ name: 'class_id', type: 'int' }) // Specify the column name and type explicitly
  class!: Class;

  @Column()
  section!: string;

  @OneToMany(() => Student, (student) => student.section)
  students!: Student[];
}
