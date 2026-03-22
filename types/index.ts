export interface CVDocument {
  id: string;
  createdAt: string;
  source: 'pdf_upload' | 'canva_import';
  fileName?: string;
  filePath?: string;
  canvaDesignId?: string;
  canvaDesignName?: string;
  canvaThumbnailUrl?: string;
  rawText: string;
  sections: CVSections;
}

export interface CVSections {
  name?: string;
  contactInfo?: string;
  summary?: string;
  experience: WorkExperience[];
  education: Education[];
  skills: string[];
  languages?: string[];
  certifications?: string[];
  other?: Record<string, string>;
}

export interface WorkExperience {
  title: string;
  company: string;
  period?: string;
  bullets: string[];
}

export interface Education {
  degree: string;
  institution: string;
  year?: string;
  details?: string;
}

export interface JobListing {
  id: string;
  createdAt: string;
  source: 'url' | 'paste';
  url?: string;
  rawText: string;
  parsedData: ParsedJobData;
}

export interface ParsedJobData {
  title?: string;
  company?: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  responsibilities: string[];
  qualifications: string[];
  keywords: string[];
}

export interface AnalysisResult {
  id: string;
  createdAt: string;
  cvId: string;
  jobId: string;
  matchScore: number;
  scoreBreakdown: ScoreBreakdown;
  matchedSkills: string[];
  missingSkills: string[];
  partialSkills: SkillMatch[];
  feedback: StructuredFeedback;
  tailoredCV: TailoredCVData;
  canvaOutputDesignId?: string;
  canvaOutputUrl?: string;
}

export interface ScoreBreakdown {
  technicalSkills: number;
  experience: number;
  education: number;
  keywords: number;
}

export interface SkillMatch {
  skill: string;
  currentPresentation: string;
  suggestedPresentation: string;
}

export interface StructuredFeedback {
  overallSummary: string;
  topPriorities: FeedbackItem[];
  sectionFeedback: SectionFeedback[];
  keywordsToAdd: string[];
  toneAdjustments?: string;
}

export interface FeedbackItem {
  priority: 'high' | 'medium' | 'low';
  section: string;
  issue: string;
  suggestion: string;
  example?: string;
}

export interface SectionFeedback {
  section: string;
  currentText?: string;
  issues: string[];
  rewriteSuggestion?: string;
}

export interface TailoredCVData {
  sections: TailoredSection[];
  changeLog: ChangeLogEntry[];
}

export interface TailoredSection {
  sectionName: string;
  originalText: string;
  tailoredText: string;
  changesApplied: string[];
}

export interface ChangeLogEntry {
  section: string;
  changeType: 'reword' | 'add' | 'remove' | 'reorder' | 'emphasize';
  description: string;
}

export interface SessionData {
  canvaAccessToken?: string;
  canvaRefreshToken?: string;
  canvaTokenExpiresAt?: number;
  canvaUserId?: string;
  oauthState?: string;
  oauthCodeVerifier?: string;
}
