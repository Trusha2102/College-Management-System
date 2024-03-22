import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Permission } from './Permission';

@Entity()
export class Module {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @OneToMany(() => Permission, (permission) => permission.module)
  permissions!: Permission[];
}
