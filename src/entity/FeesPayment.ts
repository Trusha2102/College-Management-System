// src/entities/FeesPayment.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Student } from './Student';
import { FeesMaster } from './FeesMaster';

@Entity()
export class FeesPayment {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Student, (student) => student.fees_payment)
  student!: Student;

  @ManyToOne(() => FeesMaster, (feesMaster) => feesMaster.fees_payment)
  feesMaster!: FeesMaster;

  @Column()
  dos!: Date;

  @Column({ nullable: true })
  approved_or_rejected_date!: Date;

  @Column()
  status!: string;

  @Column()
  amount!: number;

  @Column()
  payment_from!: string;

  @Column()
  payment_mode!: string;

  @Column()
  payment_proof!: string;

  @Column({ nullable: true })
  comment!: string;
}
