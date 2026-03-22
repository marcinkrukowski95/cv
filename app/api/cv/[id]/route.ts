export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { cvStore } from '@/lib/storage/dbStore';
import fs from 'fs';
import path from 'path';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cv = await cvStore.get(id);
  if (!cv) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(cv);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cv = await cvStore.get(id);
  if (!cv) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Delete PDF file if exists
  if (cv.filePath) {
    const fullPath = path.join(process.cwd(), 'public', cv.filePath);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  }

  await cvStore.delete(id);
  return NextResponse.json({ success: true });
}
