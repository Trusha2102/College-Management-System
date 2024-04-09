import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
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
