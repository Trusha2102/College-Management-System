import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Student } from './Student';
import { FeesMaster } from './FeesMaster';

@Entity()
export class FeesPayment {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Student, (student) => student.fees_payment)
  student!: Student;

  @ManyToOne(() => FeesMaster, (feesMaster) => feesMaster.feesPayments)
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
