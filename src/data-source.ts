import 'reflect-metadata';
import { DataSource } from 'typeorm';
import Entities from './entity';
import dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: true,
  entities: Entities,
  migrations: ['src/migration/**/*.ts'],
  subscribers: [],
  migrationsRun: true,
});

export default AppDataSource;
