// Development contract mock: memory only, bound to loopback. NOT Azure evidence.
import { createServer } from 'node:http';
import { createHandlers } from '../src/handlers.mjs';
import { InterestRepository } from '../src/repository.mjs';
import { ApiError } from '../src/domain.mjs';
import { FakeTable } from '../test/fake-table.mjs';

const handlers = createHandlers({
  repository: new InterestRepository(new FakeTable()),
  authorizeAdmin: async token => {
    if (!token || token !== 'Bearer mock-admin') {
      const status = token === 'Bearer mock-user' ? 403 : 401;
      throw new ApiError(status, status === 403 ? 'ACESSO_NEGADO' : 'NAO_AUTENTICADO', 'Use token fictício mock-admin no mock local.');
    }
  },
});
const server = createServer(async (req, res) => {
  if (req.headers.origin === 'http://localhost:3000') {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Idempotency-Key');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  }
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  try {
    const url = new URL(req.url, 'http://localhost:7072');
    const fn = req.method === 'POST' && url.pathname === '/api/interesses' ? handlers.post
      : req.method === 'GET' && url.pathname === '/api/demanda' ? handlers.get : null;
    if (!fn) { res.writeHead(404); res.end(); return; }
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > 2048) { res.writeHead(413); res.end(JSON.stringify({ error: 'Corpo excede 2.048 bytes.', code: 'CORPO_MUITO_GRANDE' })); return; }
      chunks.push(chunk);
    }
    const request = new Request(url, { method: req.method, headers: req.headers,
      ...(req.method === 'POST' ? { body: Buffer.concat(chunks) } : {}) });
    const result = await fn(request);
    res.writeHead(result.status, result.headers);
    res.end(JSON.stringify(result.jsonBody));
  } catch {
    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Mock indisponível.', code: 'INDISPONIVEL' }));
  }
});
server.listen(7072, '127.0.0.1', () => console.log('MOCK LOCAL http://localhost:7072 — sem Azure/persistência; token mock-admin.'));
