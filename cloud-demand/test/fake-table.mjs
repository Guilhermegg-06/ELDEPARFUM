// Unit-test double only; never imported by production Functions.
export class FakeTable {
  rows = new Map();
  version = 0;
  calls = 0;
  async getEntity(partition, key) {
    const row = this.rows.get(key);
    if (!row || row.partitionKey !== partition) throw Object.assign(new Error('missing'), { statusCode: 404, code: 'ResourceNotFound' });
    return { ...row };
  }
  async submitTransaction(actions) {
    this.calls++;
    for (const [operation, entity, , options] of actions) {
      const current = this.rows.get(entity.rowKey);
      if (operation === 'create' && current) throw Object.assign(new Error('exists'), { statusCode: 409 });
      if (operation === 'update' && (!current || current.etag !== options.etag)) throw Object.assign(new Error('etag'), { statusCode: 412 });
    }
    for (const [, entity] of actions) this.rows.set(entity.rowKey, { ...entity, etag: String(++this.version) });
  }
  async *listEntities() {
    for (const row of this.rows.values()) if (row.tipo === 'interesse') yield { ...row };
  }
}
