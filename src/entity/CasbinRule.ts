import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class CasbinRule {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  ptype!: string;

  @Column()
  v0!: string;

  @Column()
  v1!: string;

  @Column()
  v2!: string;

  @Column()
  v3!: string;

  @Column()
  v4!: string;

  @Column()
  v5!: string;

  @Column()
  v6!: string;
}
