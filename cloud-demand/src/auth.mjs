import { ApiError } from './domain.mjs';

export function createAdminAuthorizer(env, fetchImpl = fetch) {
  return async (authorization) => {
    const match = /^Bearer ([^\s]+)$/.exec(authorization || '');
    if (!match || match[1].length > 8192) {
      throw new ApiError(401, 'NAO_AUTENTICADO', 'Autenticação necessária.');
    }
    const allowed = (env.DEMAND_ADMIN_USER_IDS || '').split(',').map(x => x.trim()).filter(Boolean);
    let base;
    try {
      base = new URL(env.SUPABASE_URL);
      if (base.protocol !== 'https:' || base.username || base.password ||
          base.pathname !== '/' || base.search || base.hash) throw new Error();
    } catch {
      throw new ApiError(503, 'INDISPONIVEL', 'Autenticação indisponível.');
    }
    if (!env.SUPABASE_PUBLISHABLE_KEY || allowed.length === 0) {
      throw new ApiError(503, 'INDISPONIVEL', 'Autenticação indisponível.');
    }
    const response = await fetchImpl(new URL('/auth/v1/user', base), {
      headers: { apikey: env.SUPABASE_PUBLISHABLE_KEY, Authorization: authorization },
      signal: AbortSignal.timeout(5000),
      redirect: 'error',
    });
    if ([401, 403].includes(response.status)) {
      throw new ApiError(401, 'NAO_AUTENTICADO', 'Sessão inválida ou expirada.');
    }
    if (!response.ok) throw new ApiError(503, 'INDISPONIVEL', 'Autenticação indisponível.');
    const user = await response.json();
    if (!user || typeof user.id !== 'string') {
      throw new ApiError(401, 'NAO_AUTENTICADO', 'Sessão inválida.');
    }
    // Never authorize using user_metadata or an email provided by the browser.
    if (!allowed.includes(user.id)) {
      throw new ApiError(403, 'ACESSO_NEGADO', 'Acesso administrativo negado.');
    }
  };
}
