'use client';

import React from 'react';
import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabaseClient';

export default function AdminLogin() {
  const isSupabaseConfigured = Boolean(supabaseBrowser);
  const getRedirectUrl = (path: string) => `${window.location.origin}${path}`;

  const handleGoogle = async () => {
    if (!supabaseBrowser) {
      alert('Supabase nao configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY');
      return;
    }

    await supabaseBrowser.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: getRedirectUrl('/admin') },
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-100 via-white to-gray-100 flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xl shadow-black/5">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
            ADM
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-black">Login Admin</h1>
          <p className="mt-2 text-sm text-gray-700">Entre com uma conta autorizada para acessar o painel.</p>
        </div>

        {!isSupabaseConfigured && (
          <p className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
            Supabase nao configurado. Configure as variaveis de ambiente primeiro.
          </p>
        )}

        <button
          onClick={handleGoogle}
          disabled={!isSupabaseConfigured}
          className="w-full rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          Continuar com Google
        </button>

        <p className="mt-6 text-center text-sm text-gray-700">
          <Link href="/" className="font-medium text-black underline underline-offset-2 hover:text-gray-700">
            Voltar ao site
          </Link>
        </p>
      </section>
    </main>
  );
}
