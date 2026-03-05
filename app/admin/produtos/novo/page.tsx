'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AdminProductForm from '@/components/AdminProductForm';

export default function NewProductPage() {
  const router = useRouter();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <p className="text-yellow-600">Para criar produtos o Supabase deve estar configurado.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Novo produto</h1>
        <AdminProductForm onSave={() => router.push('/admin')} />
      </div>
    </main>
  );
}
