// src/entities/FeesMaster.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Student } from './Student';
import { FeesType } from './FeesType';
import { FeesPayment } from './FeesPayment';

@Entity()
export class FeesMaster {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Student, (student) => student.fees_master)
  student!: Student;

  @ManyToOne(() => FeesType, (feesType) => feesType.fees_master)
  feesType!: FeesType;

  @Column()
  student_id!: number;

  @Column()
  fees_type_id!: number;

  @Column()
  fine_name!: string;

  @Column()
  fine_amount!: number;

  @Column()
  discount_name!: string;

  @Column()
  discount_amount!: number;

  @Column()
  net_amount!: number;

  @OneToMany(() => FeesPayment, (feesPayment) => feesPayment.feesMaster)
  fees_payment!: FeesPayment[];
}
