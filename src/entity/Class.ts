// src/entities/Class.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Section } from './Section';
import { Student } from './Student';

@Entity()
export class Class {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  class_name: string;

  @Column()
  is_active: boolean;

  @OneToMany(() => Section, (section) => section.class)
  sections: Section[];

  @OneToMany(() => Student, (student) => student.class)
  students: Student[];
}
