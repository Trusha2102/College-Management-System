import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
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

  @Column('simple-array', { nullable: true, name: 'fees_type_data' })
  feesTypeData?: string[];
}
