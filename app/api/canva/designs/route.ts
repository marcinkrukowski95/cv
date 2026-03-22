export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { listDesigns } from '@/lib/canva/client';
import { refreshAccessToken } from '@/lib/canva/oauth';

export async function GET(req: NextRequest) {
  const session = await getSession();

  if (!session.canvaAccessToken) {
    return NextResponse.json({ error: 'Not authenticated with Canva' }, { status: 401 });
  }

  // Auto-refresh if token is near expiry
  if (session.canvaTokenExpiresAt && Date.now() > session.canvaTokenExpiresAt - 60_000) {
    try {
      const tokens = await refreshAccessToken(session.canvaRefreshToken!);
      session.canvaAccessToken = tokens.accessToken;
      session.canvaRefreshToken = tokens.refreshToken;
      session.canvaTokenExpiresAt = Date.now() + tokens.expiresIn * 1000;
      await session.save();
    } catch {
      return NextResponse.json({ error: 'Session expired. Please reconnect Canva.' }, { status: 401 });
    }
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query') || 'CV';
  const continuation = searchParams.get('continuation') || undefined;

  try {
    const data = await listDesigns(session.canvaAccessToken, query, continuation);
    return NextResponse.json(data);
  } catch (err) {
    console.error('Canva designs error:', err);
    return NextResponse.json({ error: 'Failed to fetch Canva designs' }, { status: 500 });
  }
}
