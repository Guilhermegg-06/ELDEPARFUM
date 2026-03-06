import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminServer';

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin.ok) return admin.response;

  return NextResponse.json({ email: admin.email });
}
