'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import { supabaseBrowser } from '@/lib/supabaseClient';
import slugify from 'slugify';

interface AdminProductFormProps {
  initial?: Partial<Product>;
  onSave: () => void;
}

export default function AdminProductForm({ initial = {}, onSave }: AdminProductFormProps) {
  const [name, setName] = useState(initial.name || '');
  const [slug, setSlug] = useState(initial.slug || '');
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

  // generate slug when name changes if user hasn't edited slug manually
  useEffect(() => {
    if (!initial.slug) {
      setSlug(slugify(name || '', { lower: true, strict: true }));
    }
  }, [name, initial.slug]);

  const uploadImage = async (file: File) => {
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabaseBrowser.storage
      .from('product-images')
      .upload(fileName, file);
    if (error) {
      console.error('upload error', error);
      return;
    }
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${fileName}`;
    setImages((prev) => [...prev, url]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImage(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const productData: any = {
      name,
      slug,
      brand,
      price: parseFloat(price) || 0,
      ml: parseInt(ml) || 0,
      gender,
      family,
      description,
      notes_top: notesTop.split(',').map((s) => s.trim()).filter(Boolean),
      notes_heart: notesHeart.split(',').map((s) => s.trim()).filter(Boolean),
      notes_base: notesBase.split(',').map((s) => s.trim()).filter(Boolean),
      images,
      in_stock_label: inStockLabel,
      featured,
      best_seller: bestSeller,
      active,
    };

    try {
      if (initial.id) {
        await supabaseBrowser.from('products').update(productData).eq('id', initial.id);
        // clear existing images and re-insert
        await supabaseBrowser.from('product_images').delete().eq('product_id', initial.id);
        for (let i = 0; i < images.length; i++) {
          await supabaseBrowser.from('product_images').insert({ product_id: initial.id, url: images[i], sort_order: i });
        }
      } else {
        const { data, error } = await supabaseBrowser.from('products').insert(productData).select().single();
        if (error) throw error;
        const newId = (data as any).id;
        for (let i = 0; i < images.length; i++) {
          await supabaseBrowser.from('product_images').insert({ product_id: newId, url: images[i], sort_order: i });
        }
      }
      onSave();
    } catch (err) {
      console.error('save product error', err);
      alert('Falha ao salvar produto');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nome</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Slug</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Marca</label>
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
          <label className="block text-sm font-medium text-gray-700">Preço</label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Volume (ml)</label>
          <input
            type="number"
            value={ml}
            onChange={(e) => setMl(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Gênero</label>
        <input
          type="text"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Família</label>
        <input
          type="text"
          value={family}
          onChange={(e) => setFamily(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Descrição</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Notas de Topo (separadas por vírgula)</label>
        <input
          type="text"
          value={notesTop}
          onChange={(e) => setNotesTop(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Notas de Coração (separadas por vírgula)</label>
        <input
          type="text"
          value={notesHeart}
          onChange={(e) => setNotesHeart(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Notas de Fundo (separadas por vírgula)</label>
        <input
          type="text"
          value={notesBase}
          onChange={(e) => setNotesBase(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Imagens</label>
        <div className="flex flex-wrap gap-2 my-2">
          {images.map((url, idx) => (
            <div key={idx} className="relative w-24 h-24">
              <img src={url} className="object-cover w-full h-full rounded" alt="" />
              <button
                type="button"
                onClick={() => setImages(images.filter((_, i) => i !== idx))}
                className="absolute top-0 right-0 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>

      <div>
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

      <button
        type="submit"
        className="bg-black text-white py-2 px-4 rounded hover:bg-gray-900 transition"
      >
        Salvar
      </button>
    </form>
  );
}
