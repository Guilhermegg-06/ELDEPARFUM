import { supabaseBrowser } from './supabaseClient';

export class AdminApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'AdminApiError';
  }
}

async function getAccessToken(): Promise<string> {
  if (!supabaseBrowser) {
    throw new AdminApiError('Supabase nao configurado.', 500);
  }

  const {
    data: { session },
    error,
  } = await supabaseBrowser.auth.getSession();

  if (error || !session?.access_token) {
    throw new AdminApiError('Sessao expirada. Faca login novamente.', 401);
  }

  return session.access_token;
}

export async function adminApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();
  const headers = new Headers(init.headers || {});

  headers.set('Authorization', `Bearer ${token}`);
  if (!(init.body instanceof FormData) && init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(path, {
    ...init,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : null;

  if (!response.ok) {
    const message =
      (payload && typeof payload.error === 'string' && payload.error) ||
      'Erro ao processar a solicitacao.';
    throw new AdminApiError(message, response.status);
  }

  return payload as T;
}
