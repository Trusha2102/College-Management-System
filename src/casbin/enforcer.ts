import { Enforcer, newEnforcer, newSyncedEnforcer } from 'casbin';
import TypeORMAdapter, { TypeORMAdapterOptions } from 'typeorm-adapter';
import path from 'path';
import { InternalServerError } from '../services/errorHandler';

export default class CasbinService {
  public async getEnforcer() {
    try {
      const databaseParams: TypeORMAdapterOptions = {
        type: 'postgres',
        host: process.env.DB_HOST,
        port: +(process?.env?.DB_PORT || 5432),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      };

      const adapter = await TypeORMAdapter.newAdapter(databaseParams);

      const filePath = path.join(
        __dirname + '/../../src/casbin/casbinModel.conf',
      );
      const enforcer = await newEnforcer(filePath, adapter);

      return enforcer;

      // Load the policy from DB.
      //   this.enforcer.loadPolicy();
    } catch (error: any) {
      throw new InternalServerError(
        `Failed to initialize enforcer: ${error.message || error}`,
      );
    }
  }
}
