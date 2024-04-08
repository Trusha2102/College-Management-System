import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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

  // @Column()
  // amount!: number;
}
