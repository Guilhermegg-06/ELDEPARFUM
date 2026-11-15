import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createAdminAuthorizer } from '../src/auth.mjs';
import { createHandlers } from '../src/handlers.mjs';
import { InterestRepository } from '../src/repository.mjs';
import { FakeTable } from './fake-table.mjs';

const env = { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_PUBLISHABLE_KEY: 'fake-publishable', DEMAND_ADMIN_USER_IDS: 'admin-test' };
const body = { referencia: 'Asad', nomePesquisado: 'contratipo do Assad', confirmado: true };
const setup = () => {
  const table = new FakeTable();
  const handlers = createHandlers({
    repository: new InterestRepository(table),
    authorizeAdmin: createAdminAuthorizer(env, async () => Response.json({ id: 'admin-test' })),
  });
  return { table, handlers };
};
const post = (payload = body, extra = {}, key = randomUUID()) => new Request('http://local/api/interesses', {
  method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key, ...extra },
  body: typeof payload === 'string' ? payload : JSON.stringify(payload),
});
test('contrato HTTP 201/200 e leitura autorizada', async () => {
  const { handlers } = setup();
  const key = randomUUID();
  assert.equal((await handlers.post(post(body, {}, key))).status, 201);
  assert.equal((await handlers.post(post(body, {}, key))).status, 200);
  const ranking = await handlers.get(new Request('http://local/api/demanda', { headers: { Authorization: 'Bearer test' } }));
  assert.equal(ranking.status, 200);
  assert.deepEqual(ranking.jsonBody.dados, [{ referenciaNormalizada: 'asad', contagem: 1 }]);
  assert.equal(ranking.headers['Cache-Control'], 'no-store');
});
test('JSON inválido, consentimento e tipo rejeitados antes de gravar', async () => {
  const { handlers, table } = setup();
  assert.equal((await handlers.post(post('{broken'))).status, 400);
  assert.equal((await handlers.post(post({ ...body, confirmado: false }))).status, 400);
  assert.equal((await handlers.post(post(body, { 'Content-Type': 'text/plain' }))).status, 415);
  assert.equal(table.calls, 0);
});
test('tamanho real e declarado limitados', async () => {
  const { handlers, table } = setup();
  assert.equal((await handlers.post(post('é'.repeat(1025)))).status, 413);
  assert.equal((await handlers.post(post(body, { 'Content-Length': '9999' }))).status, 413);
  assert.equal(table.calls, 0);
});
test('ranking autentica antes de acessar armazenamento', async () => {
  let reads = 0;
  const handlers = createHandlers({
    repository: { list: async () => { reads++; return []; } },
    authorizeAdmin: createAdminAuthorizer(env),
  });
  assert.equal((await handlers.get(new Request('http://local/api/demanda'))).status, 401);
  assert.equal(reads, 0);
});
test('erros de infraestrutura não vazam credenciais ou payloads', async () => {
  const logs = [];
  const handlers = createHandlers({
    repository: { create: async () => { throw new Error('AccountKey=SECRET'); } },
    authorizeAdmin: async () => {},
  });
  const result = await handlers.post(post(), { invocationId: 'test', warn: (...args) => logs.push(args) });
  assert.equal(result.status, 503);
  assert.doesNotMatch(JSON.stringify([result, logs]), /SECRET|Assad/);
});
test('kill switch desativa gravação; quota retorna Retry-After', async () => {
  const table = new FakeTable();
  const repo = new InterestRepository(table, { dailyLimit: 1 });
  const disabled = createHandlers({ repository: repo, enabled: () => false });
  assert.equal((await disabled.post(post())).status, 503);
  assert.equal(table.calls, 0);
  const handlers = createHandlers({ repository: repo });
  await handlers.post(post());
  const result = await handlers.post(post());
  assert.equal(result.status, 429);
  assert.equal(result.headers['Retry-After'], '3600');
});
test('validação de query e conflito têm envelopes do contrato', async () => {
  const { handlers } = setup();
  for (const query of ['limite=0', 'limite=2&limite=3', 'unknown=1']) {
    const result = await handlers.get(new Request('http://local/api/demanda?' + query, { headers: { Authorization: 'Bearer test' } }));
    assert.equal(result.status, 400);
  }
  const key = randomUUID();
  await handlers.post(post(body, {}, key));
  assert.equal((await handlers.post(post({ ...body, nomePesquisado: 'Asad' }, {}, key))).status, 409);
});
test('auth valida no serviço e permite apenas ID da configuração', async () => {
  let called = false;
  const auth = createAdminAuthorizer(env, async (url, options) => {
    called = true;
    assert.equal(url.pathname, '/auth/v1/user');
    assert.equal(options.headers.Authorization, 'Bearer token');
    assert.equal(options.headers.apikey, 'fake-publishable');
    return Response.json({ id: 'admin-test' });
  });
  await auth('Bearer token');
  assert.equal(called, true);
  const forbidden = createAdminAuthorizer(env, async () => Response.json({ id: 'other', user_metadata: { admin: true } }));
  await assert.rejects(forbidden('Bearer token'), { status: 403 });
});
test('auth falha fechada para token inválido ou configuração ausente', async () => {
  const noToken = createAdminAuthorizer(env, async () => { throw new Error('must not call'); });
  for (const token of [null, '', 'Basic xx', 'Bearer ' + 'x'.repeat(8193)]) await assert.rejects(noToken(token), { status: 401 });
  const expired = createAdminAuthorizer(env, async () => new Response('', { status: 401 }));
  await assert.rejects(expired('Bearer token'), { status: 401 });
  for (const config of [{ ...env, DEMAND_ADMIN_USER_IDS: '' }, { ...env, SUPABASE_URL: 'http://example.com' }]) {
    await assert.rejects(createAdminAuthorizer(config)('Bearer token'), { status: 503 });
  }
});
test('auth indisponível e resposta malformada não autorizam', async () => {
  await assert.rejects(createAdminAuthorizer(env, async () => new Response('', { status: 500 }))('Bearer token'), { status: 503 });
  await assert.rejects(createAdminAuthorizer(env, async () => Response.json({}))('Bearer token'), { status: 401 });
  const handlers = createHandlers({ repository: {}, authorizeAdmin: createAdminAuthorizer(env, async () => { throw new Error('timeout'); }) });
  assert.equal((await handlers.get(new Request('http://local/api/demanda', { headers: { Authorization: 'Bearer test' } }))).status, 503);
});
