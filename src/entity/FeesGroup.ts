import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FeesType } from './FeesType';

@Entity()
export class FeesGroup {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  description!: string;

  @OneToMany(() => FeesType, (feesType) => feesType)
  feesTypes!: FeesType[];

  // @Column('simple-array', { nullable: true, name: 'fees_type_data' })
  // feesTypeData?: string[];

  @Column({ nullable: true, name: 'fees_type_data' })
  feesTypeData?: string;

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
