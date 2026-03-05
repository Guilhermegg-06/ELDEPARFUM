'use client';

import React from 'react';
import { supabaseBrowser } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function CustomerLoginPage() {
  const handleGoogle = async () => {
    await supabaseBrowser.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: '/' } });
  };

  const handleApple = async () => {
    await supabaseBrowser.auth.signInWithOAuth({ provider: 'apple', options: { redirectTo: '/' } });
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Entrar</h1>
        <button
          onClick={handleGoogle}
          className="w-full mb-4 py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Entrar com Google
        </button>
        {process.env.NEXT_PUBLIC_ENABLE_APPLE_AUTH === 'true' && (
          <button
            onClick={handleApple}
            className="w-full mb-4 py-2 px-4 bg-black text-white rounded hover:bg-gray-800 transition"
          >
            Entrar com Apple
          </button>
        )}
        <p className="text-center text-sm text-gray-500">
          <Link href="/">Voltar ao site</Link>
        </p>
      </div>
    </main>
  );
}
