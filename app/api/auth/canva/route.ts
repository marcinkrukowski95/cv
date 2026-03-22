export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { generatePKCE, generateState, buildAuthUrl } from '@/lib/canva/oauth';
import { getSession } from '@/lib/session';

export async function GET() {
  if (!process.env.CANVA_CLIENT_ID) {
    return NextResponse.json({ error: 'Canva integration not configured' }, { status: 503 });
  }

  const { verifier, challenge } = generatePKCE();
  const state = generateState();

  const session = await getSession();
  session.oauthState = state;
  session.oauthCodeVerifier = verifier;
  await session.save();

  const authUrl = buildAuthUrl(state, challenge);
  return NextResponse.redirect(authUrl);
}
