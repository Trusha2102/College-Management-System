import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { IncomeHead } from './IncomeHead';

@Entity()
export class Income {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => IncomeHead, (incomeHead) => incomeHead.income)
  income_head!: IncomeHead;

  @Column()
  name!: string;

  @Column()
  invoice_number!: number;

  @Column()
  date!: Date;

  @Column('float')
  amount!: number;

  @Column({ nullable: true })
  attached_doc!: string;

  @Column()
  description!: string;
}
