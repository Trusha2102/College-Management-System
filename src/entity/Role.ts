import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Permission } from './Permission';
import { User } from './User';
import { ActivityLog } from './ActivityLog';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Permission, (permission) => permission.role)
  permissions: Permission[];

  @OneToMany(() => User, (user) => user.role)
  user: User[];

  @OneToMany(() => ActivityLog, (activityLog) => activityLog.role)
  activityLog: ActivityLog[];
}
