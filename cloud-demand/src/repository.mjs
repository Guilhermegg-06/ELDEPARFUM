import { ApiError } from './domain.mjs';

const partitionKey = 'demand-v1';
const unavailable = () => new ApiError(503, 'INDISPONIVEL', 'Serviço temporariamente indisponível.');

export class InterestRepository {
  constructor(client, { dailyLimit = 100, maxRows = 10000, now = () => new Date() } = {}) {
    if (!Number.isInteger(dailyLimit) || dailyLimit < 1 || dailyLimit > 1000) throw unavailable();
    this.client = client;
    this.dailyLimit = dailyLimit;
    this.maxRows = maxRows;
    this.now = now;
  }

  async find(rowKey) {
    try {
      return await this.client.getEntity(partitionKey, rowKey);
    } catch (error) {
      // Missing table is NOT a missing entity: provision the table separately.
      if (error.statusCode === 404 && error.code === 'ResourceNotFound') return null;
      throw error;
    }
  }

  replay(existing, input) {
    if (existing.payloadHash !== input.payloadHash) {
      throw new ApiError(409, 'CHAVE_REUTILIZADA', 'Chave já utilizada para outro conteúdo.');
    }
    return { entity: existing, repeated: true };
  }

  async create(input) {
    const createdAt = this.now().toISOString();
    const quotaKey = 'quota-' + createdAt.slice(0, 10);
    const entity = { ...input, partitionKey, criadoEm: createdAt };
    // Bounded optimistic retries; quota and event are committed atomically.
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const existing = await this.find(input.rowKey);
      if (existing) return this.replay(existing, input);
      const quota = await this.find(quotaKey);
      if ((quota?.contagem || 0) >= this.dailyLimit) {
        throw new ApiError(429, 'LIMITE_DIARIO', 'Limite diário de solicitações atingido.');
      }
      const counter = { partitionKey, rowKey: quotaKey, tipo: 'quota', contagem: (quota?.contagem || 0) + 1 };
      const quotaAction = quota
        ? ['update', counter, 'Replace', { etag: quota.etag }]
        : ['create', counter];
      try {
        await this.client.submitTransaction([['create', entity], quotaAction]);
        return { entity, repeated: false };
      } catch (error) {
        if (![409, 412].includes(error.statusCode)) throw error;
      }
    }
    const existing = await this.find(input.rowKey);
    if (existing) return this.replay(existing, input);
    throw unavailable();
  }

  async list() {
    const rows = [];
    const entities = this.client.listEntities({
      queryOptions: {
        filter: "PartitionKey eq 'demand-v1' and tipo eq 'interesse'",
        select: ['referenciaNormalizada'],
      },
    });
    for await (const entity of entities) {
      if (rows.length >= this.maxRows) throw unavailable();
      rows.push(entity);
    }
    return rows;
  }
}
