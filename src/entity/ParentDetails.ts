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

  @Column({ nullable: true })
  father_name!: string;

  @Column({ nullable: true })
  mother_name!: string;

  @Column({ nullable: true })
  father_occupation!: string;

  @Column({ nullable: true })
  mother_occupation!: string;

  @Column({ nullable: true })
  father_phone!: string;

  @Column({ nullable: true })
  mother_phone!: string;

  @Column({ nullable: true })
  guardian_name!: string;

  @Column({ nullable: true })
  guardian_phone!: string;

  @Column({ nullable: true })
  guardian_relation!: string;

  @ManyToOne(() => Student, (student) => student.parent_details, {
    onDelete: 'CASCADE',
  })
  student!: Student;

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
