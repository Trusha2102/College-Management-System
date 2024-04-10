import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
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
