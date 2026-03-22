import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { cvStore, jobStore, analysisStore } from '@/lib/storage/dbStore';
import { runFullAnalysis } from '@/lib/ai/analyzer';
import { AnalysisResult } from '@/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 min timeout for Vercel

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: string, data: object) {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      }

      try {
        const body = await req.json();
        const { cvId, jobId } = body as { cvId: string; jobId: string };

        if (!cvId || !jobId) {
          send('error', { message: 'cvId and jobId are required' });
          controller.close();
          return;
        }

        const cv = await cvStore.get(cvId);
        const job = await jobStore.get(jobId);

        if (!cv) {
          send('error', { message: 'CV not found' });
          controller.close();
          return;
        }
        if (!job) {
          send('error', { message: 'Job listing not found' });
          controller.close();
          return;
        }

        send('progress', { step: 'starting', percent: 5 });

        const result = await runFullAnalysis(
          cv.rawText,
          job.rawText,
          (step, percent) => send('progress', { step, percent }),
        );

        send('progress', { step: 'saving', percent: 95 });

        const analysis: AnalysisResult = {
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          cvId,
          jobId,
          matchScore: result.matchScore,
          scoreBreakdown: result.scoreBreakdown,
          matchedSkills: result.matchedSkills,
          missingSkills: result.missingSkills,
          partialSkills: result.partialSkills,
          feedback: result.feedback,
          tailoredCV: result.tailoredCV,
        };

        // Also save parsedData back to job listing
        job.parsedData = result.parsedJob;
        await jobStore.save(job);

        await analysisStore.save(analysis);

        send('complete', { analysisId: analysis.id });
        controller.close();
      } catch (err) {
        console.error('Analysis error:', err);
        let message = err instanceof Error ? err.message : 'Analysis failed';
        if (message.includes('credit balance is too low')) {
          message = 'Brak kredytów na koncie Anthropic. Doładuj konto na console.anthropic.com/settings/billing';
        } else if (message.includes('invalid_api_key') || message.includes('authentication')) {
          message = 'Nieprawidłowy klucz API Anthropic. Sprawdź plik .env.local';
        }
        try {
          controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ message })}\n\n`));
        } catch {}
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // disable nginx buffering for SSE
    },
  });
}
