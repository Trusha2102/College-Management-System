import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './Role';
// import { Address } from './Address';
import { BankAccount } from './BankAccount';
import { Employee } from './Employee';
import { ActivityLog } from './ActivityLog';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255 })
  first_name!: string;

  @Column({ length: 255, nullable: true })
  last_name!: string;

  @Column({ length: 255, nullable: true })
  father_name!: string;

  @Column({ length: 255, nullable: true })
  mother_name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  mobile!: string;

  @Column()
  password!: string;

  @Column()
  role_id!: number;

  @ManyToOne(() => Role, (role: { user: any }) => role.user)
  role!: Role;

  @Column({ length: 255, nullable: true })
  profile_picture!: string;

  @Column({ default: true })
  is_active!: boolean;

  @Column()
  gender!: string;

  @Column({ type: 'date' })
  dob!: Date;

  @Column({ nullable: true })
  marital_status!: boolean;

  @Column({ length: 255, nullable: true })
  qualification!: string;

  @Column({ length: 255, nullable: true })
  work_experience!: string;

  @Column({ nullable: true })
  aadhar_card!: string;

  // @ManyToOne(() => Address, (address: { user: any }) => address.user, {
  //   nullable: true,
  // })
  // address!: Address;

  @Column({ nullable: true })
  permanent_address!: string;

  @Column({ nullable: true })
  current_address!: string;

  @Column({ nullable: true })
  address_id!: number;

  @ManyToOne(
    () => BankAccount,
    (bankAccount: { user: any }) => bankAccount.user,
    {
      nullable: true,
    },
  )
  bank_details!: BankAccount;

  @Column({ nullable: true })
  bank_details_id!: number;

  @Column('simple-array', { nullable: true })
  social_media_links!: string[];

  @OneToMany(() => Employee, (employee: { user: any }) => employee.user)
  employee!: Employee[];

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

  @OneToMany(
    () => ActivityLog,
    (activityLog: { user: any }) => activityLog.user,
  )
  activityLog!: ActivityLog[];
}
