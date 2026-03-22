// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdf = require('pdf-parse');
import { CVSections, WorkExperience, Education } from '@/types';

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const data = await pdf(buffer);
  return data.text;
}

export function parseCVSections(text: string): CVSections {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  const sections: CVSections = {
    experience: [],
    education: [],
    skills: [],
  };

  // Try to extract name (first non-empty line that looks like a name)
  const firstLine = lines[0];
  if (firstLine && firstLine.length < 60 && !firstLine.includes('@')) {
    sections.name = firstLine;
  }

  // Extract contact info (lines with email, phone, linkedin)
  const contactLines = lines.filter(l =>
    l.includes('@') || l.match(/\+?[\d\s\-()]{7,}/) || l.includes('linkedin') || l.includes('github')
  );
  if (contactLines.length > 0) {
    sections.contactInfo = contactLines.join(' | ');
  }

  // Detect section headers
  const sectionKeywords = {
    summary: ['summary', 'profile', 'about', 'objective', 'podsumowanie', 'o mnie'],
    experience: ['experience', 'work', 'employment', 'career', 'doświadczenie', 'praca'],
    education: ['education', 'academic', 'studies', 'wykształcenie', 'edukacja'],
    skills: ['skills', 'technologies', 'technical', 'competencies', 'umiejętności', 'technologie'],
    languages: ['languages', 'języki'],
    certifications: ['certifications', 'certificates', 'courses', 'certyfikaty', 'kursy'],
  };

  let currentSection = '';
  let currentContent: string[] = [];
  const sectionBlocks: Record<string, string[]> = {};

  for (const line of lines) {
    const lower = line.toLowerCase();
    let detectedSection = '';

    for (const [section, keywords] of Object.entries(sectionKeywords)) {
      if (keywords.some(kw => lower.includes(kw)) && line.length < 40) {
        detectedSection = section;
        break;
      }
    }

    if (detectedSection) {
      if (currentSection && currentContent.length > 0) {
        sectionBlocks[currentSection] = currentContent;
      }
      currentSection = detectedSection;
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    }
  }
  if (currentSection && currentContent.length > 0) {
    sectionBlocks[currentSection] = currentContent;
  }

  // Parse summary
  if (sectionBlocks.summary) {
    sections.summary = sectionBlocks.summary.join(' ');
  }

  // Parse skills
  if (sectionBlocks.skills) {
    const skillText = sectionBlocks.skills.join(', ');
    sections.skills = skillText
      .split(/[,;|•·\n]/)
      .map(s => s.trim())
      .filter(s => s.length > 1 && s.length < 50);
  }

  // Parse languages
  if (sectionBlocks.languages) {
    sections.languages = sectionBlocks.languages
      .join(', ')
      .split(/[,;|•·\n]/)
      .map(s => s.trim())
      .filter(Boolean);
  }

  // Parse certifications
  if (sectionBlocks.certifications) {
    sections.certifications = sectionBlocks.certifications.filter(Boolean);
  }

  // Parse experience (basic grouping by likely job entries)
  if (sectionBlocks.experience) {
    sections.experience = parseExperience(sectionBlocks.experience);
  }

  // Parse education
  if (sectionBlocks.education) {
    sections.education = parseEducation(sectionBlocks.education);
  }

  return sections;
}

function parseExperience(lines: string[]): WorkExperience[] {
  const experiences: WorkExperience[] = [];
  let current: WorkExperience | null = null;

  for (const line of lines) {
    // Detect new job entry: line that looks like a title/company (short, no leading bullet)
    const isJobTitle = line.length < 80 && !line.startsWith('•') && !line.startsWith('-') &&
      (line.match(/\d{4}/) || experiences.length === 0 && !current);

    if (isJobTitle && line.match(/\d{4}/)) {
      if (current) experiences.push(current);
      current = { title: line, company: '', period: extractPeriod(line), bullets: [] };
    } else if (current) {
      if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        current.bullets.push(line.replace(/^[•\-*]\s*/, ''));
      } else if (!current.company && line.length < 60) {
        current.company = line;
      } else {
        current.bullets.push(line);
      }
    } else {
      current = { title: line, company: '', bullets: [] };
    }
  }
  if (current) experiences.push(current);

  return experiences;
}

function parseEducation(lines: string[]): Education[] {
  const educations: Education[] = [];
  let current: Education | null = null;

  for (const line of lines) {
    if (line.match(/\d{4}/) || !current) {
      if (current) educations.push(current);
      current = {
        degree: line,
        institution: '',
        year: extractPeriod(line),
      };
    } else if (current && !current.institution) {
      current.institution = line;
    } else if (current) {
      current.details = (current.details ? current.details + ' ' : '') + line;
    }
  }
  if (current) educations.push(current);

  return educations;
}

function extractPeriod(text: string): string {
  const match = text.match(/(\d{4})\s*[-–]\s*(\d{4}|present|now|current|obecnie)/i);
  return match ? match[0] : '';
}
