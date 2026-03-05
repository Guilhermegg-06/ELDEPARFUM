'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabaseClient';
import { formatPrice } from '@/lib/format';
import { Product } from '@/lib/types';

export default function AdminIndex() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!supabaseBrowser) {
      setError('Supabase nao configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY em .env.local');
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabaseBrowser
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      setError('Erro ao buscar produtos');
    } else if (data) {
      setProducts(data as Product[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!supabaseBrowser) {
      alert('Supabase nao configurado.');
      return;
    }

    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    const { error } = await supabaseBrowser.from('products').delete().eq('id', id);
    if (error) {
      console.error(error);
      alert('Falha ao excluir');
    } else {
      load();
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    if (!supabaseBrowser) {
      alert('Supabase nao configurado.');
      return;
    }

    const { error } = await supabaseBrowser
      .from('products')
      .update({ active: !current })
      .eq('id', id);
    if (error) {
      console.error(error);
      alert('Falha ao atualizar status');
    } else {
      load();
    }
  };

  return (
    <main className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Produtos</h1>
          <Link
            href="/admin/produtos/novo"
            className="bg-black text-white py-2 px-4 rounded hover:bg-gray-900 transition"
          >
            Novo produto
          </Link>
        </div>

        {loading && <p>Carregando...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && products.length === 0 && <p>Nenhum produto encontrado.</p>}

        {products.length > 0 && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="border-b p-2">Nome</th>
                <th className="border-b p-2">Slug</th>
                <th className="border-b p-2">Preco</th>
                <th className="border-b p-2">Ativo</th>
                <th className="border-b p-2">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: Product) => (
                <tr key={p.id} className="hover:bg-gray-100">
                  <td className="p-2">{p.name}</td>
                  <td className="p-2">{p.slug}</td>
                  <td className="p-2">{formatPrice(p.price)}</td>
                  <td className="p-2">
                    <button
                      onClick={() => toggleActive(p.id, p.active)}
                      className="text-sm underline"
                    >
                      {p.active ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="p-2 flex gap-2">
                    <Link
                      href={`/admin/produtos/${p.id}/editar`}
                      className="text-blue-600 hover:underline"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-red-600 hover:underline"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
