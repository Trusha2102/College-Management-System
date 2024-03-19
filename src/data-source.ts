import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Notice } from './entity/Notice';
import dotenv from 'dotenv';

dotenv.config();

console.log(
  'THE ENV VARIABLES:',
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  process.env.DB_NAME
);

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: true,
  entities: ['src/entity/**/*.ts'],
  migrations: ['src/migration/**/*.ts'],
  subscribers: [],
  migrationsRun: true // Automatically run migrations on startup
});
