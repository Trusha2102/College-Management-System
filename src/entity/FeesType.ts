import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { FeesGroup } from './FeesGroup';

@Entity()
export class FeesType {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  description!: string;

  @Column()
  due_date!: Date;

  @Column()
  amount!: number;

  @ManyToOne(() => FeesGroup, (feesGroup) => feesGroup.feesTypes)
  feesGroup!: FeesGroup;
}
