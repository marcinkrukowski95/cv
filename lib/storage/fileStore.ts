import fs from 'fs';
import path from 'path';
import { CVDocument, JobListing, AnalysisResult } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readJSON<T>(filePath: string): T | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

function writeJSON(filePath: string, data: unknown) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function listJSON<T>(dir: string): T[] {
  ensureDir(dir);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  return files.map(f => readJSON<T>(path.join(dir, f))).filter(Boolean) as T[];
}

// CV
export const cvStore = {
  save(cv: CVDocument) {
    writeJSON(path.join(DATA_DIR, 'cvs', `${cv.id}.json`), cv);
  },
  get(id: string): CVDocument | null {
    return readJSON(path.join(DATA_DIR, 'cvs', `${id}.json`));
  },
  list(): CVDocument[] {
    return listJSON<CVDocument>(path.join(DATA_DIR, 'cvs'));
  },
  delete(id: string) {
    const filePath = path.join(DATA_DIR, 'cvs', `${id}.json`);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  },
};

// Jobs
export const jobStore = {
  save(job: JobListing) {
    writeJSON(path.join(DATA_DIR, 'jobs', `${job.id}.json`), job);
  },
  get(id: string): JobListing | null {
    return readJSON(path.join(DATA_DIR, 'jobs', `${id}.json`));
  },
  list(): JobListing[] {
    return listJSON<JobListing>(path.join(DATA_DIR, 'jobs'));
  },
};

// Analyses
export const analysisStore = {
  save(analysis: AnalysisResult) {
    writeJSON(path.join(DATA_DIR, 'analyses', `${analysis.id}.json`), analysis);
  },
  get(id: string): AnalysisResult | null {
    return readJSON(path.join(DATA_DIR, 'analyses', `${id}.json`));
  },
  list(): AnalysisResult[] {
    return listJSON<AnalysisResult>(path.join(DATA_DIR, 'analyses'));
  },
};
