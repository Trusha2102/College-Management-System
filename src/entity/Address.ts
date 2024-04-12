// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   Column,
//   ManyToOne,
//   UpdateDateColumn,
//   CreateDateColumn,
// } from 'typeorm';
// import { Student } from './Student';
// import { User } from './User';

// @Entity()
// export class Address {
//   @PrimaryGeneratedColumn()
//   id!: number;

//   @Column()
//   address_type!: string;

//   @Column()
//   house_no!: string;

//   @Column()
//   address_line_1!: string;

//   @Column()
//   address_line_2!: string;

//   @ManyToOne(() => Student, (student) => student.address, { nullable: true })
//   student!: Student;

//   @Column({ nullable: true })
//   student_id!: number;

//   @ManyToOne(() => User, (user) => user.address, { nullable: true })
//   user!: User;

//   @Column({ nullable: true })
//   user_id!: number;

//   @CreateDateColumn({
//     name: 'created_at',
//     type: 'timestamp',
//     default: () => 'CURRENT_TIMESTAMP',
//     nullable: false,
//   })
//   createdAt!: Date;

//   @UpdateDateColumn({
//     name: 'updated_at',
//     type: 'timestamp',
//     default: () => 'CURRENT_TIMESTAMP',
//     onUpdate: 'CURRENT_TIMESTAMP',
//     nullable: false,
//   })
//   updatedAt!: Date;
// }
