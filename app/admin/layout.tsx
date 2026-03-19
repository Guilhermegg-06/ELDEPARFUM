'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabaseClient';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoginRoute = pathname === '/admin/login';
  const [status, setStatus] = useState<'checking' | 'misconfigured' | 'unauthenticated' | 'forbidden' | 'error' | 'ok'>('checking');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      if (isLoginRoute) {
        setStatus('ok');
        setStatusMessage(null);
        return;
      }

      if (!supabaseBrowser) {
        setStatus('misconfigured');
        setStatusMessage('Supabase browser nao configurado.');
        return;
      }

      const {
        data: { session },
      } = await supabaseBrowser.auth.getSession();

      if (!session) {
        setSessionEmail(null);
        setStatus('unauthenticated');
        setStatusMessage('Sessao nao encontrada. Redirecionando para login...');
        router.push('/admin/login');
        return;
      }

      setSessionEmail(session.user.email?.toLowerCase() || null);

      const verifyRes = await fetch('/api/admin/me', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!verifyRes.ok) {
        let apiMessage = 'Falha ao validar acesso ao painel.';

        try {
          const payload = await verifyRes.json();
          if (payload && typeof payload.error === 'string' && payload.error.trim()) {
            apiMessage = payload.error;
          }
        } catch {
          // Ignore payload parsing errors and keep fallback message.
        }

        if (verifyRes.status === 401) {
          await supabaseBrowser.auth.signOut();
          setSessionEmail(null);
          setStatus('unauthenticated');
          setStatusMessage(apiMessage);
          router.push('/admin/login');
          return;
        }

        if (verifyRes.status === 403) {
          setStatus('forbidden');
          setStatusMessage(apiMessage);
          return;
        }

        setStatus('error');
        setStatusMessage(apiMessage);
        return;
      }

      setStatus('ok');
      setStatusMessage(null);
    };

    check();
  }, [isLoginRoute, router]);

  const handleSignOut = async () => {
    if (!supabaseBrowser) return;
    await supabaseBrowser.auth.signOut();
    setSessionEmail(null);
    router.push('/admin/login');
  };

  if (isLoginRoute) {
    return <>{children}</>;
  }

  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando painel...</p>
      </div>
    );
  }

  if (status === 'misconfigured') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-yellow-600 mb-4">
          {statusMessage || 'Supabase nao configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.'}
        </p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p>{statusMessage || 'Redirecionando para login...'}</p>
      </div>
    );
  }

  if (status === 'forbidden') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-600 mb-4">
          {statusMessage || 'Acesso negado. Voce nao e um administrador autorizado.'}
        </p>
        {sessionEmail && (
          <p className="mb-4 text-sm text-[#292828]">Sessao atual: {sessionEmail}</p>
        )}
        <button
          onClick={handleSignOut}
          className="bg-black text-white py-2 px-4 rounded"
        >
          Trocar conta
        </button>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <p className="text-red-600 mb-4">
          {statusMessage || 'Falha ao validar o acesso admin.'}
        </p>
        {sessionEmail && (
          <p className="mb-4 text-sm text-[#292828]">Sessao atual: {sessionEmail}</p>
        )}
        <button
          onClick={handleSignOut}
          className="bg-black text-white py-2 px-4 rounded"
        >
          Limpar sessao e sair
        </button>
      </div>
    );
  }

  return (
    <div>
      <header className="bg-gray-100 border-b border-gray-200 py-2 px-4 flex justify-end">
        <button
          onClick={handleSignOut}
          className="text-sm text-red-600 hover:underline"
        >
          Sair
        </button>
      </header>
      {children}
    </div>
  );
}
