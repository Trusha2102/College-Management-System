import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne, // Import ManyToOne decorator
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Student } from './Student';
import { Semester } from './Semester'; // Import Semester entity

@Entity()
export class Section {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  section!: string;

  @ManyToOne(() => Semester, (semester) => semester.section)
  semester!: Semester;

  @OneToMany(() => Student, (student) => student.section)
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
