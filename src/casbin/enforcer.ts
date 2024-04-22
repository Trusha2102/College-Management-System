import { Enforcer, newEnforcer } from 'casbin';
import TypeORMAdapter, { TypeORMAdapterOptions } from 'typeorm-adapter';
import path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

export class CasbinService {
  // private enforcer: Enforcer | null = null;

  public async getEnforcer(): Promise<Enforcer> {
    try {
      const databaseParams: TypeORMAdapterOptions = {
        type: 'postgres',
        host: process.env.DB_HOST,
        port: +(process?.env?.DB_PORT || 5432),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      };
      const a = await TypeORMAdapter.newAdapter(databaseParams);
      const filePath = await path.join(
        __dirname,
        '../../src/casbin/casbinModel.conf',
      );

      let enforcer = await newEnforcer(filePath, a);
      await enforcer.loadPolicy();
      return enforcer;
    } catch (error) {
      console.error('Error in CasbinService:', error);
      throw new Error('Failed to initialize Casbin enforcer');
    }
  }
}
