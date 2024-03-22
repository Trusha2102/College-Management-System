import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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
}
