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
} from 'typeorm';
import { Session } from '../entity/Session';
import { Section } from '../entity/Section';
import { ParentDetails } from '../entity/ParentDetails';
import { Result } from '../entity/Result';
import { FeesPayment } from '../entity/FeesPayment';
import { FeesMaster } from '../entity/FeesMaster';
import { Course } from '../entity/Course';
import { Semester } from '../entity/Semester';
import {
  IsNotEmpty,
  IsEmail,
  IsDateString,
  IsIn,
  IsOptional,
} from 'class-validator';

@Entity()
export default class Student {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  @IsNotEmpty({ message: 'Admission number is required' })
  admission_no!: string;

  @Column({ unique: true })
  @IsNotEmpty({ message: 'Enrollment number is required' })
  enrollment_no!: string;

  @Column({ default: true })
  is_active!: boolean;

  @ManyToOne(() => Session, (session) => session.students)
  @JoinColumn({ name: 'student_session_id' })
  student_session!: Session;

  @Column()
  student_session_id!: number;

  @Column()
  @IsNotEmpty({ message: 'Roll number is required' })
  roll_no!: number;

  @Column()
  @IsNotEmpty({ message: 'Category is required' })
  category!: string;

  @ManyToOne(() => Section, (section) => section.students)
  @JoinColumn({ name: 'section_id' })
  section!: Section;

  @Column()
  section_id!: number;

  @ManyToOne(() => Course, (course) => course.students)
  @JoinColumn({ name: 'course_id' })
  course!: Course;

  @Column()
  course_id!: number;

  @ManyToOne(() => Semester, (semester) => semester.students)
  @JoinColumn({ name: 'semester_id' })
  semester!: Semester;

  @Column()
  semester_id!: number;

  @Column()
  @IsNotEmpty({ message: 'Gender is required' })
  @IsIn(['Male', 'Female', 'Other'], {
    message: 'Gender must be Male, Female, or Other',
  })
  gender!: string;

  @Column()
  @IsNotEmpty({ message: 'First name is required' })
  first_name!: string;

  @Column()
  @IsOptional()
  middle_name?: string;

  @Column()
  @IsNotEmpty({ message: 'Last name is required' })
  last_name!: string;

  @Column()
  @IsNotEmpty({ message: 'Date of birth is required' })
  @IsDateString(undefined, { message: 'Invalid date of birth format' })
  dob!: Date;

  @Column()
  @IsNotEmpty({ message: 'Religion is required' })
  religion!: string;

  @Column()
  @IsNotEmpty({ message: 'Caste is required' })
  caste!: string;

  @Column()
  @IsNotEmpty({ message: 'Mobile number is required' })
  mobile!: string;

  @Column({ unique: true })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;

  // Add more fields with validation as needed...

  @Column()
  @IsNotEmpty({ message: 'School name is required' })
  school_name!: string;

  @Column()
  @IsOptional()
  mother_tongue?: string;

  @Column()
  @IsOptional()
  ssc_board?: string;

  @Column()
  @IsOptional()
  year_of_passing_ssc?: string;

  @Column()
  @IsOptional()
  examination_no?: string;

  @Column()
  @IsOptional()
  quota?: string;

  @Column()
  @IsOptional()
  joining_after?: string;

  @Column()
  @IsOptional()
  aadhar_card?: string;

  @Column()
  @IsOptional()
  admission_date?: Date;

  @Column()
  @IsOptional()
  profile_picture?: string;

  @Column()
  @IsOptional()
  other_docs?: string;

  @Column()
  @IsNotEmpty({ message: 'Password is required' })
  password!: string;

  // Add more fields with validation as needed...

  @Column({ nullable: true })
  @IsOptional()
  permanent_address?: string;

  @Column({ nullable: true })
  @IsOptional()
  current_address?: string;

  @OneToOne(() => ParentDetails, (parentDetails) => parentDetails.student, {
    nullable: true,
  })
  @JoinColumn()
  @IsOptional()
  parent_details!: ParentDetails;

  @OneToOne(() => Result, (result) => result.student, { nullable: true })
  @JoinColumn()
  @IsOptional()
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
