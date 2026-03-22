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
  // Strip markdown code blocks if present
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
  onProgress?.('parsing_job', 10);
  const client = getAnthropicClient();

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{ role: 'user', content: buildParseJobPrompt(rawText) }],
    system: PARSE_JOB_SYSTEM,
  });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type from Claude');

  onProgress?.('parsing_job', 25);
  return parseJSONSafe<ParsedJobData>(content.text);
}

export async function scoreCV(cvText: string, parsedJob: ParsedJobData, onProgress?: ProgressCallback): Promise<GapAnalysis> {
  onProgress?.('scoring', 30);
  const client = getAnthropicClient();

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [{ role: 'user', content: buildScorePrompt(cvText, JSON.stringify(parsedJob, null, 2)) }],
    system: SCORE_SYSTEM,
  });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type from Claude');

  onProgress?.('scoring', 50);
  return parseJSONSafe<GapAnalysis>(content.text);
}

export async function tailorCV(
  cvText: string,
  parsedJob: ParsedJobData,
  gapAnalysis: GapAnalysis,
  onProgress?: ProgressCallback,
): Promise<TailorResult> {
  onProgress?.('tailoring', 55);
  const client = getAnthropicClient();

  const message = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 16000,
    messages: [{
      role: 'user',
      content: buildTailorPrompt(
        cvText,
        JSON.stringify(parsedJob, null, 2),
        JSON.stringify(gapAnalysis, null, 2),
      ),
    }],
    system: TAILOR_SYSTEM,
  });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type from Claude');

  onProgress?.('tailoring', 90);
  return parseJSONSafe<TailorResult>(content.text);
}

export async function runFullAnalysis(
  cvText: string,
  jobText: string,
  onProgress?: ProgressCallback,
) {
  // Cap inputs to avoid token overflow (CV ~8k chars, job ~6k chars)
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
