'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminProductForm from '@/components/AdminProductForm';
import { supabaseBrowser } from '@/lib/supabaseClient';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const id = params.id;
      if (!id) return;
      const { data, error } = await supabaseBrowser
        .from('products')
        .select('*, product_images(url, sort_order)')
        .eq('id', id)
        .single();
      if (error) {
        console.error(error);
      } else if (data) {
        const prod = data as any;
        const images = (prod.product_images || [])
          .sort((a: any, b: any) => a.sort_order - b.sort_order)
          .map((i: any) => i.url);
        setInitialData({ ...prod, images });
      }
      setLoading(false);
    };
    load();
  }, [params]);

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <p className="text-yellow-600">Supabase não configurado. Não é possível editar produtos.</p>
      </main>
    );
  }

  if (loading) {
    return <p>Carregando...</p>;
  }

  if (!initialData) {
    return <p>Produto não encontrado</p>;
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
