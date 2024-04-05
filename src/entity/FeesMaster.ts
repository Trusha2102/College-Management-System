import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import { Student } from './Student';
import { FeesGroup } from './FeesGroup';
import { FeesPayment } from './FeesPayment';
import { Fine } from './Fine';

@Entity()
export class FeesMaster {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Student, (student) => student.fees_master)
  student!: Student;

  @ManyToMany(() => FeesGroup)
  @JoinTable()
  feesGroups!: FeesGroup[];

  @Column({ type: 'date' })
  due_date!: Date;

  @ManyToOne(() => Fine)
  @JoinColumn({ name: 'fine_type_id' })
  fineType!: Fine;

  @Column()
  fine_type_id!: number;

  @Column()
  discount_name!: string;

  @Column()
  discount_amount!: number;

  @Column()
  net_amount!: number;

  @OneToMany(() => FeesPayment, (feesPayment) => feesPayment.feesMaster)
  fees_payment!: FeesPayment[];
}
