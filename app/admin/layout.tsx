'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabaseClient';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoginRoute = pathname === '/admin/login';
  const [status, setStatus] = useState<'checking' | 'misconfigured' | 'unauthenticated' | 'forbidden' | 'error' | 'ok'>('checking');

  useEffect(() => {
    const check = async () => {
      if (isLoginRoute) {
        setStatus('ok');
        return;
      }

      if (!supabaseBrowser) {
        setStatus('misconfigured');
        return;
      }

      const {
        data: { session },
      } = await supabaseBrowser.auth.getSession();

      if (!session) {
        setStatus('unauthenticated');
        router.push('/admin/login');
        return;
      }

      const verifyRes = await fetch('/api/admin/me', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!verifyRes.ok) {
        if (verifyRes.status === 403) {
          setStatus('forbidden');
          return;
        }

        if (verifyRes.status === 401) {
          setStatus('error');
          return;
        }

        setStatus('error');
        return;
      }

      setStatus('ok');
    };

    check();
  }, [isLoginRoute, router]);

  const handleSignOut = async () => {
    if (!supabaseBrowser) return;
    await supabaseBrowser.auth.signOut();
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
          Painel admin indisponivel por configuracao do Supabase.
        </p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p>Redirecionando para login...</p>
      </div>
    );
  }

  if (status === 'forbidden') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-600 mb-4">Acesso negado. Voce nao e um administrador autorizado.</p>
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
        <p className="text-red-600 mb-4">Nao foi possivel validar sua sessao admin.</p>
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
