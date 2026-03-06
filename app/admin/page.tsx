'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/format';
import { Product } from '@/lib/types';
import { AdminApiError, adminApi } from '@/lib/adminApiClient';

export default function AdminIndex() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (query.trim()) {
        params.set('q', query.trim());
      }
      const response = await adminApi<{ data: Product[] }>(
        `/api/admin/products${params.toString() ? `?${params.toString()}` : ''}`
      );
      setProducts(response.data || []);
    } catch (err) {
      if (err instanceof AdminApiError) {
        setError(err.message);
      } else {
        setError('Erro ao buscar produtos.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      load(search);
    }, 250);

    return () => clearTimeout(timer);
  }, [load, search]);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      await adminApi(`/api/admin/products/${id}`, { method: 'DELETE' });
      await load(search);
    } catch (err) {
      if (err instanceof AdminApiError) {
        alert(err.message);
      } else {
        alert('Falha ao excluir produto.');
      }
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await adminApi(`/api/admin/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ active: !current }),
      });
      await load(search);
    } catch (err) {
      if (err instanceof AdminApiError) {
        alert(err.message);
      } else {
        alert('Falha ao atualizar status.');
      }
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

        <div className="mb-6">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, marca ou slug"
            className="w-full md:w-96 rounded border border-gray-300 px-3 py-2"
          />
        </div>

        {loading && <p>Carregando...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && products.length === 0 && <p>Nenhum produto encontrado.</p>}

        {products.length > 0 && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="border-b p-2">Nome</th>
                <th className="border-b p-2">Marca</th>
                <th className="border-b p-2">Slug</th>
                <th className="border-b p-2">Preco</th>
                <th className="border-b p-2">Status</th>
                <th className="border-b p-2">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: Product) => (
                <tr key={p.id} className="hover:bg-gray-100">
                  <td className="p-2">{p.name}</td>
                  <td className="p-2">{p.brand}</td>
                  <td className="p-2">{p.slug}</td>
                  <td className="p-2">{formatPrice(p.price)}</td>
                  <td className="p-2">
                    <button
                      onClick={() => toggleActive(p.id, Boolean(p.active))}
                      className="text-sm underline"
                    >
                      {p.active ? 'Ativo' : 'Inativo'} (alternar)
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
                      Deletar
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
