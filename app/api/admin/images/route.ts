import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, sanitizeFileName } from '@/lib/adminServer';
import { supabaseServer } from '@/lib/supabaseServer';

function getPublicUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  return `${baseUrl}/storage/v1/object/public/product-images/${path}`;
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin.ok) return admin.response;

  if (!supabaseServer || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ error: 'Supabase server nao configurado.' }, { status: 500 });
  }

  const formData = await request.formData();
  const files = formData.getAll('files').filter((entry): entry is File => entry instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
  }

  try {
    const uploaded = [];

    for (const file of files) {
      const safeName = sanitizeFileName(file.name || 'imagem');
      const filePath = `${Date.now()}-${crypto.randomUUID()}-${safeName}`;

      const { error } = await supabaseServer.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          contentType: file.type || 'application/octet-stream',
          upsert: false,
        });

      if (error) {
        console.error('Admin image upload error:', error);
        return NextResponse.json({ error: 'Falha ao fazer upload da imagem.' }, { status: 500 });
      }

      uploaded.push({ path: filePath, url: getPublicUrl(filePath) });
    }

    return NextResponse.json({ data: uploaded }, { status: 201 });
  } catch (error) {
    console.error('Admin image upload exception:', error);
    return NextResponse.json({ error: 'Falha ao fazer upload da imagem.' }, { status: 500 });
  }
}
