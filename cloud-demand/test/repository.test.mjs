import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { validateInterest } from '../src/domain.mjs';
import { InterestRepository } from '../src/repository.mjs';
import { FakeTable } from './fake-table.mjs';

const make = () => validateInterest({ referencia: 'Asad', nomePesquisado: 'Asad', confirmado: true }, randomUUID());
const now = () => new Date('2026-11-15T23:59:59Z');
test('persistência, replay e quota contam somente uma gravação', async () => {
  const table = new FakeTable();
  const repo = new InterestRepository(table, { now });
  const input = make();
  const first = await repo.create(input);
  const second = await repo.create(input);
  assert.equal(first.repeated, false);
  assert.equal(second.repeated, true);
  assert.equal(second.entity.criadoEm, first.entity.criadoEm);
  assert.equal((await repo.list()).length, 1);
  assert.equal(table.rows.get('quota-2026-11-15').contagem, 1);
});
test('mesma chave concorrente é atômica e idempotente', async () => {
  const table = new FakeTable();
  const repo = new InterestRepository(table, { now });
  const input = make();
  const results = await Promise.all([repo.create(input), repo.create(input), repo.create(input)]);
  assert.equal(results.filter(result => !result.repeated).length, 1);
  assert.equal(table.rows.get('quota-2026-11-15').contagem, 1);
});
test('requisições distintas concorrentes não perdem contagem', async () => {
  const table = new FakeTable();
  const repo = new InterestRepository(table, { now });
  await Promise.all([repo.create(make()), repo.create(make()), repo.create(make())]);
  assert.equal((await repo.list()).length, 3);
  assert.equal(table.rows.get('quota-2026-11-15').contagem, 3);
});
test('quota global limita concorrência, mas permite replay', async () => {
  const table = new FakeTable();
  const repo = new InterestRepository(table, { dailyLimit: 1, now });
  const a = make(), b = make();
  const results = await Promise.allSettled([repo.create(a), repo.create(b)]);
  assert.equal(results.filter(x => x.status === 'fulfilled').length, 1);
  assert.equal(results.find(x => x.status === 'rejected').reason.status, 429);
  const stored = table.rows.has(a.rowKey) ? a : b;
  assert.equal((await repo.create(stored)).repeated, true);
});
test('chave reutilizada com conteúdo diferente retorna 409', async () => {
  const repo = new InterestRepository(new FakeTable());
  const input = make();
  await repo.create(input);
  await assert.rejects(repo.create({ ...input, payloadHash: 'different' }), { status: 409 });
});
test('quota reinicia em UTC sem apagar interesses', async () => {
  const table = new FakeTable();
  let date = new Date('2026-11-15T23:59:59Z');
  const repo = new InterestRepository(table, { dailyLimit: 1, now: () => date });
  await repo.create(make());
  date = new Date('2026-11-16T00:00:00Z');
  await repo.create(make());
  assert.equal((await repo.list()).length, 2);
});
test('não retorna ranking parcial ao ultrapassar limite', async () => {
  const repo = new InterestRepository(new FakeTable(), { maxRows: 1 });
  await repo.create(make());
  await repo.create(make());
  await assert.rejects(repo.list(), { status: 503 });
});
test('falha de tabela e concorrência persistente não viram sucesso', async () => {
  const missing = new InterestRepository({ getEntity: async () => { throw Object.assign(new Error(), { statusCode: 404, code: 'TableNotFound' }); } });
  await assert.rejects(missing.create(make()), { code: 'TableNotFound' });
  const table = new FakeTable();
  let tries = 0;
  table.submitTransaction = async () => { tries++; throw Object.assign(new Error(), { statusCode: 412 }); };
  await assert.rejects(new InterestRepository(table).create(make()), { status: 503 });
  assert.equal(tries, 3);
  assert.throws(() => new InterestRepository(table, { dailyLimit: NaN }), { status: 503 });
});
