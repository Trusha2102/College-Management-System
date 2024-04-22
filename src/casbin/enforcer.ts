import { Enforcer, newEnforcer } from 'casbin';
import TypeORMAdapter, { TypeORMAdapterOptions } from 'typeorm-adapter';
import path from 'path';
import { cache } from 'joi';

export class CasbinService {
  private enforcer: Enforcer | null = null;

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
      console.log('FilePath:', filePath);
      this.enforcer = await newEnforcer(filePath, a);
      await this.enforcer.loadPolicy();
      return this.enforcer;
    } catch (err) {
      console.log('CasbinService Error::::', err);
    }
  }
}
