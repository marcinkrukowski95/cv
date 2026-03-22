export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { extractTextFromPDF, parseCVSections } from '@/lib/cv/pdfParser';
import { cvStore } from '@/lib/storage/dbStore';
import { CVDocument } from '@/types';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.name.endsWith('.pdf')) {
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const rawText = await extractTextFromPDF(buffer);

    if (!rawText || rawText.trim().length < 50) {
      return NextResponse.json({ error: 'Could not extract text from PDF. Is it a scanned image?' }, { status: 422 });
    }

    const sections = parseCVSections(rawText);
    const id = uuidv4();
    const fileName = file.name;

    // Save PDF file
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    const filePath = path.join(UPLOADS_DIR, `${id}.pdf`);
    fs.writeFileSync(filePath, buffer);

    const cv: CVDocument = {
      id,
      createdAt: new Date().toISOString(),
      source: 'pdf_upload',
      fileName,
      filePath: `/uploads/${id}.pdf`,
      rawText,
      sections,
    };

    await cvStore.save(cv);

    return NextResponse.json({
      id: cv.id,
      fileName: cv.fileName,
      createdAt: cv.createdAt,
      source: cv.source,
      sections: {
        name: sections.name,
        skillsCount: sections.skills.length,
        experienceCount: sections.experience.length,
        educationCount: sections.education.length,
      },
    });
  } catch (err) {
    console.error('CV upload error:', err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Failed to process PDF: ${msg}` }, { status: 500 });
  }
}
