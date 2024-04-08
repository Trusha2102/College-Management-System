import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { FeesMaster } from './FeesMaster';

@Entity()
export class Fine {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => FeesMaster, (feesMaster) => feesMaster.fines)
  feesMaster!: FeesMaster;

  @Column()
  fine_value!: number;

  @Column()
  late_fee_frequency?: string;
}
