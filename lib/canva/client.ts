const CANVA_API_BASE = 'https://api.canva.com/rest/v1';

// Simple in-memory rate limiter: 20 req/min per token
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(token: string) {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 18; // slightly under 20 for safety

  const requests = (rateLimitMap.get(token) || []).filter(t => now - t < windowMs);
  if (requests.length >= maxRequests) {
    throw new Error('Canva API rate limit reached. Please wait a moment and try again.');
  }
  requests.push(now);
  rateLimitMap.set(token, requests);
}

export async function canvaFetch<T>(
  accessToken: string,
  path: string,
  options: RequestInit = {},
): Promise<T> {
  checkRateLimit(accessToken);

  const res = await fetch(`${CANVA_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Canva API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

export interface CanvaDesign {
  id: string;
  title: string;
  thumbnail?: { url: string };
  urls?: { edit_url: string; view_url: string };
  created_at: number;
  updated_at: number;
}

export interface CanvaDesignsResponse {
  items: CanvaDesign[];
  continuation?: string;
}

export async function listDesigns(
  accessToken: string,
  query?: string,
  continuation?: string,
): Promise<CanvaDesignsResponse> {
  const params = new URLSearchParams({ ownership: 'owned' });
  if (query) params.set('query', query);
  if (continuation) params.set('continuation', continuation);

  return canvaFetch<CanvaDesignsResponse>(accessToken, `/designs?${params}`);
}

export async function exportDesignAsPDF(accessToken: string, designId: string): Promise<string> {
  // Create export job
  const job = await canvaFetch<{ job: { id: string } }>(
    accessToken,
    `/designs/${designId}/exports`,
    {
      method: 'POST',
      body: JSON.stringify({ format: 'pdf' }),
    },
  );

  const jobId = job.job.id;

  // Poll for completion (max 30s)
  for (let i = 0; i < 15; i++) {
    await new Promise(r => setTimeout(r, 2000));

    const status = await canvaFetch<{
      job: { id: string; status: string; urls?: string[] };
    }>(accessToken, `/designs/${designId}/exports/${jobId}`);

    if (status.job.status === 'success' && status.job.urls?.[0]) {
      return status.job.urls[0];
    }
    if (status.job.status === 'failed') {
      throw new Error('Canva export failed');
    }
  }

  throw new Error('Canva export timed out');
}
