import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { FeesGroup } from './FeesGroup';

@Entity()
export class Fine {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => FeesGroup, (feesGroup) => feesGroup.fines)
  feesGroup!: FeesGroup;

  @Column()
  fine_value!: number;

  @Column()
  late_fee_frequency!: string;
}
