export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { scrapeJobUrl } from '@/lib/job/scraper';
import { jobStore } from '@/lib/storage/dbStore';
import { JobListing } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, text } = body as { url?: string; text?: string };

    if (!url && !text) {
      return NextResponse.json({ error: 'Provide either url or text' }, { status: 400 });
    }

    let rawText = '';
    let source: 'url' | 'paste' = 'paste';

    if (url) {
      try {
        rawText = await scrapeJobUrl(url);
        source = 'url';
      } catch (err) {
        // Return scraping error but allow fallback to paste
        return NextResponse.json({
          error: 'Could not scrape URL. Please paste the job description directly.',
          details: err instanceof Error ? err.message : 'Unknown error',
        }, { status: 422 });
      }
    } else {
      rawText = (text as string).trim();
    }

    if (rawText.length < 50) {
      return NextResponse.json({ error: 'Job description is too short' }, { status: 400 });
    }

    const job: JobListing = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      source,
      url,
      rawText,
      parsedData: {
        requiredSkills: [],
        niceToHaveSkills: [],
        responsibilities: [],
        qualifications: [],
        keywords: [],
      },
    };

    await jobStore.save(job);

    return NextResponse.json({
      id: job.id,
      source: job.source,
      url: job.url,
      preview: rawText.substring(0, 300) + (rawText.length > 300 ? '...' : ''),
      length: rawText.length,
    });
  } catch (err) {
    console.error('Job scrape error:', err);
    return NextResponse.json({ error: 'Failed to process job listing' }, { status: 500 });
  }
}
