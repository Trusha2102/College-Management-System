// src/entities/User.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Role } from './Role';
import { Address } from './Address';
import { BankAccount } from './BankAccount';
import { Employee } from './Employee';
import { ActivityLog } from './ActivityLog';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  first_name: string;

  @Column({ length: 255 })
  last_name: string;

  @Column({ length: 255 })
  father_name: string;

  @Column({ length: 255 })
  mother_name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  mobile: string;

  @Column()
  password: string;

  @Column()
  role_id: number;

  @ManyToOne(() => Role, (role) => role.user)
  role: Role;

  @Column({ length: 255, nullable: true })
  profile_picture: string;

  @Column({ default: true })
  is_active: boolean;

  @Column()
  gender: string;

  @Column({ type: 'date' })
  dob: Date;

  @Column()
  marital_status: boolean;

  @Column({ length: 255 })
  qualification: string;

  @Column({ length: 255 })
  work_experience: string;

  @ManyToOne(() => Address, (address) => address.user, { nullable: true })
  address: Address;

  @Column({ nullable: true })
  address_id: number;

  @ManyToOne(() => BankAccount, (bankAccount) => bankAccount.user, { nullable: true })
  bank_details: BankAccount;

  @Column({ nullable: true })
  bank_details_id: number;

  @Column('simple-array')
  social_media_links: string[];

  @OneToMany(() => Employee, (employee) => employee.user)
  employee: Employee[];

  @OneToMany(() => ActivityLog, (activityLog) => activityLog.user)
  activityLog: ActivityLog[];
}
