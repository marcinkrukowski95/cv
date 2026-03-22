import { getAnthropicClient } from './claude';
import {
  PARSE_JOB_SYSTEM, buildParseJobPrompt,
  SCORE_SYSTEM, buildScorePrompt,
  TAILOR_SYSTEM, buildTailorPrompt,
} from './prompts';
import { ParsedJobData, ScoreBreakdown, SkillMatch, StructuredFeedback, TailoredCVData } from '@/types';

type ProgressCallback = (step: string, percent: number) => void;

interface GapAnalysis {
  matchScore: number;
  scoreBreakdown: ScoreBreakdown;
  matchedSkills: string[];
  missingSkills: string[];
  partialSkills: SkillMatch[];
}

interface TailorResult {
  feedback: StructuredFeedback;
  tailoredCV: TailoredCVData;
}

function parseJSONSafe<T>(text: string): T {
  const cleaned = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    if (err instanceof SyntaxError && cleaned.length > 1000) {
      throw new Error('Odpowiedź AI została ucięta - CV lub oferta pracy może być zbyt długa. Spróbuj z krótszym CV lub ofertą.');
    }
    throw err;
  }
}

export async function parseJobListing(rawText: string, onProgress?: ProgressCallback): Promise<ParsedJobData> {
  onProgress?.('parsing_job', 12);
  const client = getAnthropicClient();

  let fullText = '';
  const stream = await client.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: PARSE_JOB_SYSTEM,
    messages: [{ role: 'user', content: buildParseJobPrompt(rawText) }],
  });

  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      fullText += chunk.delta.text;
      const pct = 12 + Math.min(13, Math.round((fullText.length / 800) * 13));
      onProgress?.('parsing_job', pct);
    }
  }

  onProgress?.('parsing_job', 25);
  return parseJSONSafe<ParsedJobData>(fullText);
}

export async function scoreCV(cvText: string, parsedJob: ParsedJobData, onProgress?: ProgressCallback): Promise<GapAnalysis> {
  onProgress?.('scoring', 28);
  const client = getAnthropicClient();

  let fullText = '';
  const stream = await client.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    system: SCORE_SYSTEM,
    messages: [{ role: 'user', content: buildScorePrompt(cvText, JSON.stringify(parsedJob, null, 2)) }],
  });

  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      fullText += chunk.delta.text;
      const pct = 28 + Math.min(22, Math.round((fullText.length / 1600) * 22));
      onProgress?.('scoring', pct);
    }
  }

  onProgress?.('scoring', 50);
  return parseJSONSafe<GapAnalysis>(fullText);
}

export async function tailorCV(
  cvText: string,
  parsedJob: ParsedJobData,
  gapAnalysis: GapAnalysis,
  onProgress?: ProgressCallback,
): Promise<TailorResult> {
  onProgress?.('tailoring', 53);
  const client = getAnthropicClient();

  let fullText = '';
  const stream = await client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 16000,
    system: TAILOR_SYSTEM,
    messages: [{
      role: 'user',
      content: buildTailorPrompt(
        cvText,
        JSON.stringify(parsedJob, null, 2),
        JSON.stringify(gapAnalysis, null, 2),
      ),
    }],
  });

  const expectedChars = 10000; // rough estimate for Opus response
  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      fullText += chunk.delta.text;
      const pct = 53 + Math.min(37, Math.round((fullText.length / expectedChars) * 37));
      onProgress?.('tailoring', pct);
    }
  }

  onProgress?.('tailoring', 90);
  return parseJSONSafe<TailorResult>(fullText);
}

export async function runFullAnalysis(
  cvText: string,
  jobText: string,
  onProgress?: ProgressCallback,
) {
  const cvTruncated = cvText.length > 8000 ? cvText.slice(0, 8000) + '\n[...tekst skrócony...]' : cvText;
  const jobTruncated = jobText.length > 6000 ? jobText.slice(0, 6000) + '\n[...tekst skrócony...]' : jobText;

  const parsedJob = await parseJobListing(jobTruncated, onProgress);
  const gapAnalysis = await scoreCV(cvTruncated, parsedJob, onProgress);
  const tailorResult = await tailorCV(cvTruncated, parsedJob, gapAnalysis, onProgress);

  return {
    parsedJob,
    ...gapAnalysis,
    ...tailorResult,
  };
}
