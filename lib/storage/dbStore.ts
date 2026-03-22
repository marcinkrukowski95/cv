import mysql from 'mysql2/promise';
import { CVDocument, JobListing, AnalysisResult } from '@/types';
import { ensureDB } from './db';

// CV
export const cvStore = {
  async save(cv: CVDocument) {
    const pool = await ensureDB();
    await pool.execute(
      `INSERT INTO cvs (id, created_at, source, file_name, file_path, canva_design_id, canva_design_name, canva_thumbnail_url, raw_text, sections)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         source=VALUES(source), file_name=VALUES(file_name), file_path=VALUES(file_path),
         canva_design_id=VALUES(canva_design_id), canva_design_name=VALUES(canva_design_name),
         canva_thumbnail_url=VALUES(canva_thumbnail_url), raw_text=VALUES(raw_text), sections=VALUES(sections)`,
      [cv.id, cv.createdAt, cv.source, cv.fileName ?? null, cv.filePath ?? null,
       cv.canvaDesignId ?? null, cv.canvaDesignName ?? null, cv.canvaThumbnailUrl ?? null,
       cv.rawText, JSON.stringify(cv.sections)]
    );
  },
  async get(id: string): Promise<CVDocument | null> {
    const pool = await ensureDB();
    const [rows] = await pool.execute<mysql.RowDataPacket[]>('SELECT * FROM cvs WHERE id = ?', [id]);
    if (!rows.length) return null;
    return rowToCV(rows[0]);
  },
  async list(): Promise<CVDocument[]> {
    const pool = await ensureDB();
    const [rows] = await pool.execute<mysql.RowDataPacket[]>('SELECT * FROM cvs ORDER BY created_at DESC');
    return (rows as mysql.RowDataPacket[]).map(rowToCV);
  },
  async delete(id: string) {
    const pool = await ensureDB();
    await pool.execute('DELETE FROM cvs WHERE id = ?', [id]);
  },
};

function rowToCV(row: mysql.RowDataPacket): CVDocument {
  return {
    id: row.id,
    createdAt: row.created_at,
    source: row.source,
    fileName: row.file_name ?? undefined,
    filePath: row.file_path ?? undefined,
    canvaDesignId: row.canva_design_id ?? undefined,
    canvaDesignName: row.canva_design_name ?? undefined,
    canvaThumbnailUrl: row.canva_thumbnail_url ?? undefined,
    rawText: row.raw_text,
    sections: typeof row.sections === 'string' ? JSON.parse(row.sections) : row.sections,
  };
}

// Jobs
export const jobStore = {
  async save(job: JobListing) {
    const pool = await ensureDB();
    await pool.execute(
      `INSERT INTO jobs (id, created_at, source, url, raw_text, parsed_data)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         source=VALUES(source), url=VALUES(url), raw_text=VALUES(raw_text), parsed_data=VALUES(parsed_data)`,
      [job.id, job.createdAt, job.source, job.url ?? null, job.rawText, JSON.stringify(job.parsedData)]
    );
  },
  async get(id: string): Promise<JobListing | null> {
    const pool = await ensureDB();
    const [rows] = await pool.execute<mysql.RowDataPacket[]>('SELECT * FROM jobs WHERE id = ?', [id]);
    if (!rows.length) return null;
    return rowToJob(rows[0]);
  },
  async list(): Promise<JobListing[]> {
    const pool = await ensureDB();
    const [rows] = await pool.execute<mysql.RowDataPacket[]>('SELECT * FROM jobs ORDER BY created_at DESC');
    return (rows as mysql.RowDataPacket[]).map(rowToJob);
  },
};

function rowToJob(row: mysql.RowDataPacket): JobListing {
  return {
    id: row.id,
    createdAt: row.created_at,
    source: row.source,
    url: row.url ?? undefined,
    rawText: row.raw_text,
    parsedData: typeof row.parsed_data === 'string' ? JSON.parse(row.parsed_data) : row.parsed_data,
  };
}

// Analyses
export const analysisStore = {
  async save(analysis: AnalysisResult) {
    const pool = await ensureDB();
    await pool.execute(
      `INSERT INTO analyses (id, created_at, cv_id, job_id, match_score, score_breakdown, matched_skills, missing_skills, partial_skills, feedback, tailored_cv, canva_output_design_id, canva_output_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         match_score=VALUES(match_score), score_breakdown=VALUES(score_breakdown),
         matched_skills=VALUES(matched_skills), missing_skills=VALUES(missing_skills),
         partial_skills=VALUES(partial_skills), feedback=VALUES(feedback),
         tailored_cv=VALUES(tailored_cv), canva_output_design_id=VALUES(canva_output_design_id),
         canva_output_url=VALUES(canva_output_url)`,
      [analysis.id, analysis.createdAt, analysis.cvId, analysis.jobId, analysis.matchScore,
       JSON.stringify(analysis.scoreBreakdown), JSON.stringify(analysis.matchedSkills),
       JSON.stringify(analysis.missingSkills), JSON.stringify(analysis.partialSkills),
       JSON.stringify(analysis.feedback), JSON.stringify(analysis.tailoredCV),
       analysis.canvaOutputDesignId ?? null, analysis.canvaOutputUrl ?? null]
    );
  },
  async get(id: string): Promise<AnalysisResult | null> {
    const pool = await ensureDB();
    const [rows] = await pool.execute<mysql.RowDataPacket[]>('SELECT * FROM analyses WHERE id = ?', [id]);
    if (!rows.length) return null;
    return rowToAnalysis(rows[0]);
  },
  async list(): Promise<AnalysisResult[]> {
    const pool = await ensureDB();
    const [rows] = await pool.execute<mysql.RowDataPacket[]>('SELECT * FROM analyses ORDER BY created_at DESC');
    return (rows as mysql.RowDataPacket[]).map(rowToAnalysis);
  },
};

function rowToAnalysis(row: mysql.RowDataPacket): AnalysisResult {
  const j = (v: unknown) => typeof v === 'string' ? JSON.parse(v) : v;
  return {
    id: row.id,
    createdAt: row.created_at,
    cvId: row.cv_id,
    jobId: row.job_id,
    matchScore: row.match_score,
    scoreBreakdown: j(row.score_breakdown),
    matchedSkills: j(row.matched_skills),
    missingSkills: j(row.missing_skills),
    partialSkills: j(row.partial_skills),
    feedback: j(row.feedback),
    tailoredCV: j(row.tailored_cv),
    canvaOutputDesignId: row.canva_output_design_id ?? undefined,
    canvaOutputUrl: row.canva_output_url ?? undefined,
  };
}
