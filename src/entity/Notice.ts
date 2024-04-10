import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Notice {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ name: 'notice_date', type: 'timestamp' })
  noticeDate!: Date;

  @Column({ name: 'publish_on', type: 'timestamp' })
  publishOn!: Date;

  @Column({ name: 'message_to', type: 'simple-array' })
  messageTo!: string[];

  @Column()
  message!: string;

  @Column({ nullable: true })
  attachment!: string;

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
