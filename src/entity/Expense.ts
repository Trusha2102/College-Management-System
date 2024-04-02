import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { ExpenseHead } from './ExpenseHead';

@Entity()
export class Expense {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ExpenseHead, (expenseHead) => expenseHead.expense)
  expense_head!: ExpenseHead;

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
