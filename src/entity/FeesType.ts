import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Course } from './Course';
import { FeesMaster } from './FeesMaster';

@Entity()
export class FeesType {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Course, (course) => course.fees_type)
  course: Course;

  @Column()
  course_id: number;

  @Column()
  semester: string;

  @Column()
  amount: number;

  @Column()
  extra_fees_type: string;

  @Column()
  extra_amount: string;

  @Column()
  due_date: Date;

  @OneToMany(() => FeesMaster, (feesMaster) => feesMaster.feesType)
  fees_master: FeesMaster[];
}
