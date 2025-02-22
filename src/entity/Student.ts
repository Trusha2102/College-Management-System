import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Session } from './Session';
import { Section } from './Section';
import { ParentDetails } from './ParentDetails';
import { Result } from './Result';
import { FeesPayment } from './FeesPayment';
import { FeesMaster } from './FeesMaster';
import { Course } from './Course';
import { Semester } from './Semester';

@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  admission_no!: string;

  @Column({ unique: true })
  enrollment_no!: string;

  @Column({ default: true })
  is_active!: boolean;

  // @ManyToOne(() => Session, (session) => session.students)
  // student_session!: Session;

  @ManyToOne(() => Session, (session) => session.students)
  @JoinColumn({ name: 'session_id' })
  session!: Session;

  @Column()
  session_id!: number;

  // @Column({ nullable: true })
  // roll_no!: number;

  @Column()
  category!: string;

  @ManyToOne(() => Section, (section) => section.students)
  section!: Section;

  @Column()
  section_id!: number;

  @ManyToOne(() => Course, (course) => course.students)
  course!: Course;

  @Column()
  course_id!: number;

  @ManyToOne(() => Semester, (semester) => semester.students)
  semester!: Semester;

  @Column()
  semester_id!: number;

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

  @Column({ unique: true })
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
  aadhar_card!: string;

  @Column()
  admission_date!: Date;

  @Column({ nullable: true })
  profile_picture!: string;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
    nullable: false,
  })
  public other_docs!: Array<{ name: string; path: string }>;

  // @Column('jsonb', { array: true, nullable: true })
  // other_docs!: JSON[];

  @Column({ nullable: true })
  permanent_address!: string;

  @Column({ nullable: true })
  current_address!: string;

  @OneToOne(() => ParentDetails, (parentDetails) => parentDetails.student, {
    nullable: true,
  })
  parent_details!: ParentDetails;

  @OneToOne(() => Result, (result) => result.student, { nullable: true })
  result!: Result;

  @OneToMany(() => FeesPayment, (feesPayment) => feesPayment.student)
  fees_payment!: FeesPayment[];

  @OneToMany(() => FeesMaster, (feesMaster) => feesMaster.student)
  feesMaster!: FeesMaster[];

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
