import { newEnforcer } from 'casbin';
import { EntityManager, getConnectionOptions, createConnection } from 'typeorm';
import TypeORMAdapter from './TypeORMAdapter';

export async function getEnforcer(entityManager: EntityManager) {
  const connectionOptions = await getConnectionOptions(); // Get connection options
  const connection = await createConnection(connectionOptions); // Create a new connection
  const adapter = new TypeORMAdapter(connection.options); // Pass connection options to the adapter
  const enforcer = await newEnforcer('casbin_model.conf', adapter);

  await enforcer.loadPolicy(); // Load policies from the database

  return enforcer;
}
