import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Student } from './Student';

@Entity()
export class ParentDetails {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  relation_type!: string;

  @Column()
  name!: string;

  @Column()
  occupation!: string;

  @Column()
  phone!: string;

  @Column()
  qualification!: string;

  @Column()
  email!: string;

  @ManyToOne(() => Student, (student) => student.parent_details, {
    onDelete: 'CASCADE',
  })
  student!: Student;

  @Column({ nullable: true })
  student_id!: number;

  @Column({ nullable: true })
  photo!: string;
}
