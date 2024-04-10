import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Permission } from './Permission';
import { User } from './User';
import { ActivityLog } from './ActivityLog';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @OneToMany(() => Permission, (permission) => permission.role)
  permissions!: Permission[];

  @OneToMany(() => User, (user) => user.role)
  user!: User[];

  @OneToMany(() => ActivityLog, (activityLog) => activityLog.role)
  activityLog!: ActivityLog[];

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

  static async findOne(roleId: number): Promise<Role | undefined> {
    return await this.findOne(roleId);
  }
}
