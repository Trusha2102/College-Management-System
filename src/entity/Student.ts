import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Session } from './Session';
import { Class } from './Class';
import { Section } from './Section';
import { Address } from './Address';
import { ParentDetails } from './ParentDetails';
import { BankAccount } from './BankAccount';
import { Result } from './Result';
import { FeesPayment } from './FeesPayment';
import { FeesMaster } from './FeesMaster';

@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  admission_no!: number;

  @ManyToOne(() => Session, (session) => session.students)
  student_session!: Session;

  @Column()
  student_session_id!: number;

  @Column()
  roll_no!: number;

  @Column()
  category!: string;

  @ManyToOne(() => Class, (cls) => cls.students)
  class!: Class;

  @Column()
  class_id!: number;

  @ManyToOne(() => Section, (section) => section.students)
  section!: Section;

  @Column()
  section_id!: number;

  @Column()
  gender!: string;

  @Column()
  first_name!: string;

  @Column()
  last_name!: string;

  @Column()
  middle_name!: string;

  @Column()
  dob!: Date;

  @Column()
  religion!: string;

  @Column()
  caste!: string;

  @Column()
  mobile!: string;

  @Column()
  email!: string;

  @Column()
  school_name!: string;

  @Column()
  mother_tongue!: string;

  @Column()
  ssc_board!: string;

  @Column()
  year_of_passing_ssc!: string;

  @Column()
  examination_no!: string;

  @Column()
  quota!: string;

  @Column()
  joining_after!: string;

  @Column()
  blood_group!: string;

  @Column()
  height!: string;

  @Column()
  weight!: string;

  @Column()
  medical_history!: string;

  @Column()
  aadhar_card!: string;

  @Column()
  admission_date!: Date;

  @Column()
  profile_picture!: string;

  @Column()
  other_docs!: string;

  @Column()
  password!: string;

  @OneToOne(() => Address, (address) => address.student, { nullable: true })
  address!: Address;

  @OneToOne(() => ParentDetails, (parentDetails) => parentDetails.student, {
    nullable: true,
  })
  parent_details!: ParentDetails;

  @OneToOne(() => BankAccount, (bankAccount) => bankAccount.student, {
    nullable: true,
  })
  bank_details!: BankAccount;

  @OneToOne(() => Result, (result) => result.student, { nullable: true })
  result!: Result;

  @OneToMany(() => FeesPayment, (feesPayment) => feesPayment.student)
  fees_payment!: FeesPayment[];

  @OneToMany(() => FeesMaster, (feesMaster) => feesMaster.student)
  fees_master!: FeesMaster[];
}
