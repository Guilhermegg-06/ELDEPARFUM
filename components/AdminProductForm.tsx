'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Product } from '@/lib/types';
import slugify from 'slugify';
import { AdminApiError, adminApi } from '@/lib/adminApiClient';

interface AdminProductFormProps {
  initial?: Partial<Product>;
  onSave: () => void;
}

function toSlug(value: string): string {
  return slugify(value || '', { lower: true, strict: true, trim: true });
}

function parseNotes(value: string): string[] {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export default function AdminProductForm({ initial = {}, onSave }: AdminProductFormProps) {
  const [name, setName] = useState(initial.name || '');
  const [slug, setSlug] = useState(initial.slug || toSlug(initial.name || ''));
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.slug));
  const [brand, setBrand] = useState(initial.brand || '');
  const [price, setPrice] = useState(initial.price?.toString() || '');
  const [ml, setMl] = useState(initial.ml?.toString() || '');
  const [gender, setGender] = useState(initial.gender || '');
  const [family, setFamily] = useState(initial.family || '');
  const [description, setDescription] = useState(initial.description || '');
  const [notesTop, setNotesTop] = useState(initial.notes_top?.join(', ') || '');
  const [notesHeart, setNotesHeart] = useState(initial.notes_heart?.join(', ') || '');
  const [notesBase, setNotesBase] = useState(initial.notes_base?.join(', ') || '');
  const [images, setImages] = useState<string[]>(initial.images || []);
  const [inStockLabel, setInStockLabel] = useState(initial.in_stock_label || 'Em estoque');
  const [featured, setFeatured] = useState(initial.featured || false);
  const [bestSeller, setBestSeller] = useState(initial.best_seller || false);
  const [active, setActive] = useState(initial.active ?? true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!slugTouched) {
      setSlug(toSlug(name));
    }
  }, [name, slugTouched]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    setFormError(null);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));

      const response = await adminApi<{ data: Array<{ url: string }> }>(
        '/api/admin/images',
        {
          method: 'POST',
          body: formData,
        }
      );

      setImages((prev) => [...prev, ...response.data.map((entry) => entry.url)]);
    } catch (error) {
      if (error instanceof AdminApiError) {
        setFormError(error.message);
      } else {
        setFormError('Falha ao enviar imagem.');
      }
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const normalizedSlug = toSlug(slug);
    const parsedPrice = Number(price);
    const parsedMl = Number(ml);

    if (!name.trim()) {
      setFormError('Nome obrigatorio.');
      return;
    }

    if (!normalizedSlug) {
      setFormError('Slug obrigatorio.');
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setFormError('Preco deve ser maior que zero.');
      return;
    }

    if (!Number.isInteger(parsedMl) || parsedMl <= 0) {
      setFormError('ml deve ser inteiro maior que zero.');
      return;
    }

    if (!brand.trim()) {
      setFormError('Marca obrigatoria.');
      return;
    }

    if (!family.trim()) {
      setFormError('Familia obrigatoria.');
      return;
    }

    const productData = {
      name: name.trim(),
      slug: normalizedSlug,
      brand: brand.trim(),
      price: parsedPrice,
      ml: parsedMl,
      gender: gender.trim(),
      family: family.trim(),
      description: description.trim(),
      notes_top: parseNotes(notesTop),
      notes_heart: parseNotes(notesHeart),
      notes_base: parseNotes(notesBase),
      images,
      in_stock_label: inStockLabel.trim() || 'Em estoque',
      featured,
      best_seller: bestSeller,
      active,
    };

    setIsSaving(true);

    try {
      if (initial.id) {
        await adminApi(`/api/admin/products/${initial.id}`, {
          method: 'PUT',
          body: JSON.stringify(productData),
        });
      } else {
        await adminApi('/api/admin/products', {
          method: 'POST',
          body: JSON.stringify(productData),
        });
      }
      onSave();
    } catch (error) {
      if (error instanceof AdminApiError) {
        setFormError(error.message);
      } else {
        setFormError('Falha ao salvar produto.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-[#292828]">Nome</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#292828]">Slug</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => {
            setSlug(toSlug(e.target.value));
            setSlugTouched(true);
          }}
          className="mt-1 block w-full border-gray-300 rounded-md"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#292828]">Marca</label>
        <input
          type="text"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md"
          required
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#292828]">Preco</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#292828]">Volume (ml)</label>
          <input
            type="number"
            min="1"
            step="1"
            value={ml}
            onChange={(e) => setMl(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#292828]">Genero</label>
        <input
          type="text"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#292828]">Familia</label>
        <input
          type="text"
          value={family}
          onChange={(e) => setFamily(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#292828]">Descricao</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#292828]">Status de estoque</label>
        <input
          type="text"
          value={inStockLabel}
          onChange={(e) => setInStockLabel(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md"
          placeholder="Ex.: Em estoque"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#292828]">Notas de Topo (separadas por virgula)</label>
        <input
          type="text"
          value={notesTop}
          onChange={(e) => setNotesTop(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#292828]">Notas de Coracao (separadas por virgula)</label>
        <input
          type="text"
          value={notesHeart}
          onChange={(e) => setNotesHeart(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#292828]">Notas de Fundo (separadas por virgula)</label>
        <input
          type="text"
          value={notesBase}
          onChange={(e) => setNotesBase(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#292828]">Imagens</label>
        <div className="flex flex-wrap gap-2 my-2">
          {images.map((url, idx) => (
            <div key={idx} className="relative w-24 h-24">
              <Image
                src={url}
                alt={`Imagem ${idx + 1}`}
                fill
                className="object-cover rounded"
                sizes="96px"
              />
              <button
                type="button"
                onClick={() => setImages(images.filter((_, i) => i !== idx))}
                className="absolute top-0 right-0 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center"
              >
                x
              </button>
            </div>
          ))}
        </div>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          disabled={isUploading}
        />
        {isUploading && (
          <p className="text-sm text-[#292828] mt-2">Enviando imagem(ns)...</p>
        )}
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="mr-2"
          />
          Destaque
        </label>

        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={bestSeller}
            onChange={(e) => setBestSeller(e.target.checked)}
            className="mr-2"
          />
          Mais vendido
        </label>

        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="mr-2"
          />
          Ativo
        </label>
      </div>

      {formError && (
        <p className="text-sm text-red-600">{formError}</p>
      )}

      <button
        type="submit"
        disabled={isSaving || isUploading}
        className="bg-black text-white py-2 px-4 rounded hover:bg-gray-900 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSaving ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  );
}
