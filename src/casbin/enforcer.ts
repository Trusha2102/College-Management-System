import { Enforcer, newEnforcer } from 'casbin';
import TypeORMAdapter, { TypeORMAdapterOptions } from 'typeorm-adapter';
import path from 'path';

export class CasbinService {
  private enforcer: Enforcer | null = null;

  public async getEnforcer(): Promise<Enforcer> {
    await this.init();
    if (!this.enforcer) {
      throw new Error('Failed to initialize Casbin enforcer');
    }
    return this.enforcer;
  }

  private async init(): Promise<void> {
    const databaseParams: TypeORMAdapterOptions = {
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +(process?.env?.DB_PORT || 5432),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    };

    const a = await TypeORMAdapter.newAdapter(databaseParams);
    const filePath = path.join(__dirname, '../../src/casbin/casbinModel.conf');
    this.enforcer = await newEnforcer(filePath, a);
    await this.enforcer.loadPolicy();
  }
}
