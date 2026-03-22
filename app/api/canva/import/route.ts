export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getSession } from '@/lib/session';
import { exportDesignAsPDF, canvaFetch, CanvaDesign } from '@/lib/canva/client';
import { extractTextFromPDF, parseCVSections } from '@/lib/cv/pdfParser';
import { cvStore } from '@/lib/storage/dbStore';
import { CVDocument } from '@/types';

export async function POST(req: NextRequest) {
  const session = await getSession();

  if (!session.canvaAccessToken) {
    return NextResponse.json({ error: 'Not authenticated with Canva' }, { status: 401 });
  }

  const { designId } = await req.json();
  if (!designId) {
    return NextResponse.json({ error: 'designId is required' }, { status: 400 });
  }

  try {
    // Get design metadata
    const design = await canvaFetch<{ design: CanvaDesign }>(
      session.canvaAccessToken,
      `/designs/${designId}`,
    );

    // Export as PDF and download
    const pdfUrl = await exportDesignAsPDF(session.canvaAccessToken, designId);

    const pdfRes = await fetch(pdfUrl);
    if (!pdfRes.ok) throw new Error('Failed to download exported PDF');

    const buffer = Buffer.from(await pdfRes.arrayBuffer());
    const rawText = await extractTextFromPDF(buffer);

    if (!rawText || rawText.trim().length < 50) {
      return NextResponse.json({
        error: 'Could not extract text from Canva design. Make sure it contains text elements.',
      }, { status: 422 });
    }

    const sections = parseCVSections(rawText);
    const id = uuidv4();

    const cv: CVDocument = {
      id,
      createdAt: new Date().toISOString(),
      source: 'canva_import',
      canvaDesignId: designId,
      canvaDesignName: design.design.title,
      canvaThumbnailUrl: design.design.thumbnail?.url,
      rawText,
      sections,
    };

    await cvStore.save(cv);

    return NextResponse.json({
      id: cv.id,
      canvaDesignName: cv.canvaDesignName,
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
    console.error('Canva import error:', err);
    return NextResponse.json({
      error: err instanceof Error ? err.message : 'Failed to import Canva design',
    }, { status: 500 });
  }
}
