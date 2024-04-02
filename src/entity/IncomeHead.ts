import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Income } from './Income';

@Entity()
export class IncomeHead {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  income_head!: string;

  @Column()
  description!: string;

  @OneToMany(() => Income, (income) => income.income_head)
  income!: Income[];
}
