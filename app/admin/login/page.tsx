'use client';

import React from 'react';
import { supabaseBrowser } from '@/lib/supabaseClient';

export default function AdminLogin() {
  const handleGoogle = async () => {
    if (!supabaseBrowser) {
      alert('Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY');
      return;
    }
    await supabaseBrowser.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: '/admin' } });
  };

  const handleApple = async () => {
    if (!supabaseBrowser) {
      alert('Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY');
      return;
    }
    await supabaseBrowser.auth.signInWithOAuth({ provider: 'apple', options: { redirectTo: '/admin' } });
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Entrar como administrador</h1>
        {!supabaseBrowser && (
          <p className="text-yellow-600 mb-4 text-center">
            Supabase não configurado. Configure as variáveis de ambiente primeiro.
          </p>
        )}
        <button
          onClick={handleGoogle}
          disabled={!supabaseBrowser}
          className="w-full mb-4 py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
        >
          Entrar com Google
        </button>
        {process.env.NEXT_PUBLIC_ENABLE_APPLE_AUTH === 'true' && (
          <button
            onClick={handleApple}
            disabled={!supabaseBrowser}
            className="w-full mb-4 py-2 px-4 bg-black text-white rounded hover:bg-gray-800 transition disabled:opacity-50"
          >
            Entrar com Apple
          </button>
        )}
        <p className="text-sm text-gray-500 mt-4">
          Use uma conta autorizada. Se você não for administrador, não terá acesso ao painel.
        </p>
      </div>
    </main>
  );
}

