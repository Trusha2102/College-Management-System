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

  @OneToOne(() => Student, (student) => student.feesMaster)
  @JoinColumn({ name: 'student_id' })
  student!: Student;

  @ManyToMany(() => FeesGroup)
  @JoinTable()
  feesGroups!: FeesGroup[];

  @Column({ type: 'date' })
  due_date!: Date;

  @ManyToOne(() => Fine)
  @JoinColumn({ name: 'fine_type_id' })
  fineType?: Fine;

  @OneToMany(() => Fine, (fine) => fine.feesMaster)
  fines!: Fine[];

  @Column({ nullable: true })
  discount_name?: string;

  @Column({ nullable: true })
  discount_amount?: number;

  @Column({ nullable: true })
  net_amount?: number;

  @OneToMany(() => FeesPayment, (feesPayment) => feesPayment.feesMaster)
  feesPayments!: FeesPayment[];

  @Column({ nullable: true })
  student_id?: number;

  @ManyToMany(() => FeesGroup)
  @JoinTable()
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
