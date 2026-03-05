'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabaseClient';
import { getAllowedAdminEmails } from '@/lib/admin';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<'checking' | 'unauthenticated' | 'forbidden' | 'ok'>('checking');

  useEffect(() => {
    const check = async () => {
      const {
        data: { session },
      } = await supabaseBrowser.auth.getSession();

      if (!session) {
        setStatus('unauthenticated');
        router.push('/admin/login');
        return;
      }

      const allowed = getAllowedAdminEmails();
      if (!allowed.includes(session.user.email || '')) {
        setStatus('forbidden');
        return;
      }

      setStatus('ok');
    };

    check();
  }, [router]);

  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando painel...</p>
      </div>
    );
  }

  if (status === 'forbidden') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-600 mb-4">Acesso negado. Você não é um administrador autorizado.</p>
        <button
          onClick={() => supabaseBrowser.auth.signOut().then(() => router.push('/admin/login'))}
          className="bg-black text-white py-2 px-4 rounded"
        >
          Sair
        </button>
      </div>
    );
  }

  // render header with sign out
  return (
    <div>
      <header className="bg-gray-100 border-b border-gray-200 py-2 px-4 flex justify-end">
        <button
          onClick={() => supabaseBrowser.auth.signOut().then(() => router.push('/admin/login'))}
          className="text-sm text-red-600 hover:underline"
        >
          Sair
        </button>
      </header>
      {children}
    </div>
  );
}
