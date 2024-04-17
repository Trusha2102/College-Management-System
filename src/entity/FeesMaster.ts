import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Student } from './Student';
import { FeesGroup } from './FeesGroup';
import { FeesPayment } from './FeesPayment';
import { Fine } from './Fine';

@Entity()
export class FeesMaster {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Student, (student) => student.feesMaster)
  @JoinColumn({ name: 'student_id' })
  student!: Student;

  @Column({ nullable: true })
  student_id!: number;

  @ManyToMany(() => FeesGroup)
  @JoinTable()
  feesGroups!: FeesGroup[];

  @ManyToMany(() => Fine)
  @JoinTable()
  fineTypes!: Fine[];

  @Column({ nullable: true })
  discount_id!: string;

  @Column({ nullable: true })
  discount_amount!: number;

  @Column({ nullable: true })
  net_amount!: number;

  @Column({ nullable: true, default: 0 })
  paid_amount!: number;

  @Column({ default: 'Unpaid' })
  status!: string;

  @OneToMany(() => FeesPayment, (feesPayment) => feesPayment.feesMaster)
  feesPayments!: FeesPayment[];

  @Column({ nullable: true, unique: false })
  fineTypeId!: number;

  @Column({ nullable: true })
  fine_amount!: number;

  @Column('simple-array', { nullable: true })
  fees_group_ids?: number[];

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
