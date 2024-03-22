import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Role } from './Role';
import { Module } from './Module';

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Role, (role) => role.permissions)
  role!: Role;

  @Column()
  roleId!: number;

  @ManyToOne(() => Module, (module) => module.permissions)
  module!: Module;

  @Column()
  moduleId!: number;

  @Column()
  operation!: string;
}
