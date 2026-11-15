import { ApiError, validateInterest, parseLimit, rank } from './domain.mjs';

const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
const response = (status, jsonBody) => ({ status, headers: { ...headers }, jsonBody });

export function createHandlers({ repository, authorizeAdmin, enabled = () => true }) {
  async function safe(context, operation) {
    try { return await operation(); }
    catch (error) {
      // Do not log request, token, raw search, storage URL or SDK error text.
      const known = error instanceof ApiError;
      const status = known ? error.status : 503;
      const code = known ? error.code : 'INDISPONIVEL';
      if (status >= 500) context?.warn?.('cloud-demand', { code, invocationId: context.invocationId });
      const result = response(status, { error: known ? error.message : 'Serviço temporariamente indisponível.', code });
      if (status === 429) result.headers['Retry-After'] = '3600';
      return result;
    }
  }

  return {
    post: (request, context) => safe(context, async () => {
      if (!enabled()) throw new ApiError(503, 'INDISPONIVEL', 'Registro de interesses temporariamente indisponível.');
      if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') || '')) {
        throw new ApiError(415, 'TIPO_NAO_SUPORTADO', 'Envie application/json.');
      }
      const declared = request.headers.get('content-length');
      if (declared && Number(declared) > 2048) {
        throw new ApiError(413, 'CORPO_MUITO_GRANDE', 'Corpo excede 2.048 bytes.');
      }
      const raw = await request.text();
      if (Buffer.byteLength(raw, 'utf8') > 2048) {
        throw new ApiError(413, 'CORPO_MUITO_GRANDE', 'Corpo excede 2.048 bytes.');
      }
      let body;
      try { body = JSON.parse(raw); }
      catch { throw new ApiError(400, 'ENTRADA_INVALIDA', 'JSON inválido.'); }
      const input = validateInterest(body, request.headers.get('idempotency-key'));
      const { entity, repeated } = await repository.create(input);
      context?.log?.('cloud-demand', { operation: 'registrarInteresse', normalizacaoVersao: 1, invocationId: context.invocationId });
      return response(repeated ? 200 : 201, {
        id: entity.rowKey, referenciaNormalizada: entity.referenciaNormalizada,
        criadoEm: entity.criadoEm, repetido: repeated,
      });
    }),
    get: (request, context) => safe(context, async () => {
      await authorizeAdmin(request.headers.get('authorization'));
      const params = new URL(request.url).searchParams;
      if ([...params.keys()].some(key => key !== 'limite') || params.getAll('limite').length > 1) {
        throw new ApiError(400, 'ENTRADA_INVALIDA', 'Parâmetros de consulta inválidos.');
      }
      const limit = parseLimit(params.get('limite'));
      const ranking = rank(await repository.list(), limit);
      context?.log?.('cloud-demand', { operation: 'consultarDemanda', totalInteresses: ranking.totalInteresses, invocationId: context.invocationId });
      return response(200, ranking);
    }),
  };
}
