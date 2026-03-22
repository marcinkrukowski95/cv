export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  const connected = !!session.canvaAccessToken;
  const expired = connected && session.canvaTokenExpiresAt
    ? Date.now() > session.canvaTokenExpiresAt
    : false;

  return NextResponse.json({ connected: connected && !expired });
}

export async function DELETE() {
  const session = await getSession();
  session.canvaAccessToken = undefined;
  session.canvaRefreshToken = undefined;
  session.canvaTokenExpiresAt = undefined;
  await session.save();
  return NextResponse.json({ success: true });
}
