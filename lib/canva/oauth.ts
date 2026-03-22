import crypto from 'crypto';

const CANVA_TOKEN_URL = 'https://api.canva.com/rest/v1/oauth/token';
const CANVA_AUTH_URL = 'https://www.canva.com/api/oauth/authorize';

export function generatePKCE(): { verifier: string; challenge: string } {
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url');
  return { verifier, challenge };
}

export function generateState(): string {
  return crypto.randomBytes(16).toString('base64url');
}

export function buildAuthUrl(state: string, challenge: string): string {
  const params = new URLSearchParams({
    client_id: process.env.CANVA_CLIENT_ID!,
    response_type: 'code',
    redirect_uri: process.env.CANVA_REDIRECT_URI!,
    scope: 'design:content:read asset:read',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  });
  return `${CANVA_AUTH_URL}?${params}`;
}

export async function exchangeCodeForTokens(code: string, verifier: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: process.env.CANVA_REDIRECT_URI!,
    code_verifier: verifier,
    client_id: process.env.CANVA_CLIENT_ID!,
    client_secret: process.env.CANVA_CLIENT_SECRET!,
  });

  const res = await fetch(CANVA_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: process.env.CANVA_CLIENT_ID!,
    client_secret: process.env.CANVA_CLIENT_SECRET!,
  });

  const res = await fetch(CANVA_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token refresh failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? refreshToken,
    expiresIn: data.expires_in,
  };
}
