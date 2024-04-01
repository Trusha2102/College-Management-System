import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Expense } from './Expense';

@Entity()
export class ExpenseHead {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  expense_head!: string;

  @Column()
  description!: string;

  @OneToMany(() => Expense, (expense) => expense.expense_head)
  expense!: Expense[];
}
