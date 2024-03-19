// src/entities/ActivityLog.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './User';
import { Role } from './Role';

@Entity()
export class ActivityLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.activityLog)
  user: User;

  @Column()
  user_id: number;

  @ManyToOne(() => Role, (role) => role.activityLog)
  role: Role;

  @Column()
  role_id: number;

  @Column()
  action: string;
}
