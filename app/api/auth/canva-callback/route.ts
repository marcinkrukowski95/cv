export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/canva/oauth';
import { getSession } from '@/lib/session';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canva_error=${error}`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canva_error=missing_params`);
  }

  const session = await getSession();

  if (session.oauthState !== state) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canva_error=state_mismatch`);
  }

  if (!session.oauthCodeVerifier) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canva_error=missing_verifier`);
  }

  try {
    const tokens = await exchangeCodeForTokens(code, session.oauthCodeVerifier);

    session.canvaAccessToken = tokens.accessToken;
    session.canvaRefreshToken = tokens.refreshToken;
    session.canvaTokenExpiresAt = Date.now() + tokens.expiresIn * 1000;
    session.oauthState = undefined;
    session.oauthCodeVerifier = undefined;
    await session.save();

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canva_connected=1`);
  } catch (err) {
    console.error('Canva OAuth callback error:', err);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canva_error=token_exchange_failed`);
  }
}
