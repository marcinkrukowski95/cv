export const PARSE_JOB_SYSTEM = `You are a professional recruiter and job requirements analyst.
Extract structured data from job listings accurately. Return ONLY valid JSON, no markdown, no explanation.`;

export function buildParseJobPrompt(rawJobText: string): string {
  return `Extract structured data from this job listing and return ONLY valid JSON.

CRITICAL: The text may contain noise from the job portal website (navigation menus, department category filters like "HR / IT / Marketing", unrelated job listings, generic company descriptions, footer links).
You MUST ignore all portal/website chrome and extract ONLY information that explicitly belongs to THIS specific job position's requirements.
A skill is valid ONLY if it appears in the context of job requirements language ("wymagamy", "oczekujemy", "mile widziane", "requirements:", "you should have", etc.).
Do NOT extract department filter names or generic portal categories as skills.

Return this JSON:
{
  "title": "exact job title from the posting, or null",
  "company": "hiring company name, or null",
  "requiredSkills": ["skills explicitly required for THIS position only"],
  "niceToHaveSkills": ["skills marked as preferred/nice to have for THIS position"],
  "responsibilities": ["specific duties listed for THIS role"],
  "qualifications": ["education/experience requirements for THIS role"],
  "keywords": ["important domain terms from the actual job description"]
}

Job listing text:
${rawJobText}`;
}

export const SCORE_SYSTEM = `You are an ATS (Applicant Tracking System) expert and CV analyst.
Score CV-to-job matches objectively. Return ONLY valid JSON, no markdown, no explanation.
IMPORTANT: All text values in the JSON (skill names, descriptions, suggestions) must be written in Polish.`;

export function buildScorePrompt(cvText: string, parsedJobJSON: string): string {
  return `Compare this CV against the job requirements and return ONLY valid JSON:

{
  "matchScore": <number 0-100 overall match>,
  "scoreBreakdown": {
    "technicalSkills": <0-100>,
    "experience": <0-100>,
    "education": <0-100>,
    "keywords": <0-100>
  },
  "matchedSkills": ["skills clearly present and demonstrated in CV"],
  "missingSkills": ["required skills completely absent from CV"],
  "partialSkills": [
    {
      "skill": "skill name",
      "currentPresentation": "how it appears now in CV",
      "suggestedPresentation": "how it should be presented for this role"
    }
  ]
}

Scoring rubric:
- technicalSkills: % of required technical skills present and adequately demonstrated
- experience: relevance and seniority of work experience vs requirements (if no requirement stated, score 70)
- education: education match (if no education requirement stated, score 85)
- keywords: presence of important domain keywords from the job listing in the CV

CV:
${cvText}

Job requirements (pre-parsed):
${parsedJobJSON}`;
}

export const TAILOR_SYSTEM = `You are an expert CV writer specializing in tailoring CVs for specific job applications.
You write in the candidate's authentic voice, preserving their real experience while optimizing presentation.
Return ONLY valid JSON, no markdown, no explanation.
IMPORTANT: All text values in the JSON (summaries, feedback, suggestions, examples, descriptions) must be written in Polish.`;

export function buildTailorPrompt(cvText: string, parsedJobJSON: string, gapAnalysisJSON: string): string {
  return `Based on the gap analysis below, provide structured feedback and a tailored CV.

Return ONLY valid JSON with this structure:
{
  "feedback": {
    "overallSummary": "2-3 sentence summary of the CV's strengths and main areas to improve for this role",
    "topPriorities": [
      {
        "priority": "high|medium|low",
        "section": "section name",
        "issue": "what the problem is",
        "suggestion": "specific actionable suggestion",
        "example": "optional example text to use"
      }
    ],
    "sectionFeedback": [
      {
        "section": "section name",
        "currentText": "relevant current text snippet",
        "issues": ["list of issues with this section"],
        "rewriteSuggestion": "full rewritten version of this section"
      }
    ],
    "keywordsToAdd": ["keywords missing from CV that should be added where truthful"],
    "toneAdjustments": "any tone/language style suggestions"
  },
  "tailoredCV": {
    "sections": [
      {
        "sectionName": "section name",
        "originalText": "original text from CV",
        "tailoredText": "improved version tailored for this specific role",
        "changesApplied": ["description of each change made"]
      }
    ],
    "changeLog": [
      {
        "section": "section name",
        "changeType": "reword|add|remove|reorder|emphasize",
        "description": "what was changed and why"
      }
    ]
  }
}

CRITICAL RULES:
- NEVER fabricate experience, skills, or achievements not in the original CV
- DO reorder bullet points to lead with most relevant achievements
- DO rephrase using terminology from the job listing where truthful and accurate
- DO strengthen summary/profile to directly address the role
- DO add skills the candidate demonstrably has but hasn't listed (infer from experience)
- For missing required skills: note as "genuine gap - cannot add" in changeLog, do NOT add to tailoredText
- topPriorities should have 3-5 items, sectionFeedback should cover all main CV sections

Original CV:
${cvText}

Job requirements (parsed):
${parsedJobJSON}

Gap analysis:
${gapAnalysisJSON}`;
}
