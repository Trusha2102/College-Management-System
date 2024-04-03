import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Student } from './Student';

@Entity()
export class Section {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  section!: string;

  @OneToMany(() => Student, (student) => student.section)
  students!: Student[];
}
