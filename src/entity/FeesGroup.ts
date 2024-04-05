import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { FeesType } from './FeesType';
import { Fine } from './Fine';
import { FeesMaster } from './FeesMaster';

@Entity()
export class FeesGroup {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  description!: string;

  @OneToMany(() => FeesType, (feesType) => feesType.feesGroup)
  feesTypes!: FeesType[];

  @OneToMany(() => Fine, (fine) => fine.feesGroup)
  fines!: Fine[];
}
