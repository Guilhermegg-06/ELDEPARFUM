import { app } from '@azure/functions';
import { TableClient } from '@azure/data-tables';
import { InterestRepository } from './repository.mjs';
import { createAdminAuthorizer } from './auth.mjs';
import { createHandlers } from './handlers.mjs';

let repository;
function getRepository() {
  if (!repository) {
    const connection = process.env.DEMAND_STORAGE_CONNECTION_STRING;
    if (!connection) throw new Error('Storage configuration missing');
    if (process.env.WEBSITE_HOSTNAME && !/DefaultEndpointsProtocol=https;/i.test(connection)) {
      throw new Error('HTTPS storage required');
    }
    const table = process.env.DEMAND_TABLE_NAME || 'DemandInterests';
    const client = TableClient.fromConnectionString(connection, table, {
      retryOptions: { maxRetries: 2, retryDelayInMs: 200, maxRetryDelayInMs: 1000 },
    });
    repository = new InterestRepository(client, { dailyLimit: Number(process.env.DEMAND_DAILY_LIMIT || '100') });
  }
  return repository;
}
const handlers = createHandlers({
  repository: {
    create: input => getRepository().create(input),
    list: () => getRepository().list(),
  },
  authorizeAdmin: createAdminAuthorizer(process.env),
  enabled: () => process.env.DEMAND_ENABLED === 'true',
});

app.http('registrarInteresse', { methods: ['POST'], authLevel: 'anonymous', route: 'interesses', handler: handlers.post });
app.http('consultarDemanda', { methods: ['GET'], authLevel: 'anonymous', route: 'demanda', handler: handlers.get });
// Anonymous at host level is intentional: GET validates the existing Supabase
// session and server allowlist inside the handler. Never distribute function keys.
