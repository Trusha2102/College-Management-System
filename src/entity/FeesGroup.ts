import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { FeesType } from './FeesType';
import { FeesMaster } from './FeesMaster';

@Entity()
export class FeesGroup {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToMany(() => FeesMaster, (feesMaster) => feesMaster.feesGroups)
  @JoinTable()
  feesMaster!: FeesMaster[];

  @Column()
  name!: string;

  @Column()
  description!: string;

  @OneToMany(() => FeesType, (feesType) => feesType)
  feesTypes!: FeesType[];

  // @Column('simple-array', { nullable: true, name: 'fees_type_data' })
  // feesTypeData?: string[];

  // @Column({ nullable: true, name: 'fees_type_data' })
  // feesTypeData?: string;

  @Column({
    type: 'jsonb',
    array: false,
    name: 'fees_type_data',
    default: () => "'[]'",
    nullable: false,
  })
  public feesTypeData!: Array<{
    name: string;
    fees_type_id: number;
    due_date: Date;
    amount: number;
    fine_amount: number;
  }>;

  @Column({ nullable: true })
  due_date!: Date;

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
