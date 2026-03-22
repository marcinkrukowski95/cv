export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { analysisStore } from '@/lib/storage/dbStore';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const analysis = await analysisStore.get(id);
  if (!analysis) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(analysis);
}
