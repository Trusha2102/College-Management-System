import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
// import { FeesMaster } from './FeesMaster';

@Entity()
export class Fine {
  @PrimaryGeneratedColumn()
  id!: number;

  // @ManyToOne(() => FeesMaster, (feesMaster) => feesMaster.fines)
  // feesMaster!: FeesMaster;

  @Column()
  fine_type!: string;

  // @Column()
  // late_fee_frequency?: string;

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
