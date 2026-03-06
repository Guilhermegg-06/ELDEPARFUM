'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminProductForm from '@/components/AdminProductForm';
import { Product } from '@/lib/types';
import { AdminApiError, adminApi } from '@/lib/adminApiClient';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id as string | undefined;
  const [initialData, setInitialData] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setError('Produto nao encontrado.');
        setLoading(false);
        return;
      }

      try {
        const response = await adminApi<{ data: Product }>(`/api/admin/products/${id}`);
        setInitialData(response.data);
      } catch (err) {
        if (err instanceof AdminApiError) {
          setError(err.message);
        } else {
          setError('Falha ao carregar produto.');
        }
      }

      setLoading(false);
    };

    load();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <p>Carregando...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  if (!initialData) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <p className="text-red-600">Produto nao encontrado.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Editar produto</h1>
        <AdminProductForm initial={initialData} onSave={() => router.push('/admin')} />
      </div>
    </main>
  );
}
