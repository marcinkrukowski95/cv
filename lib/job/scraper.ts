import * as cheerio from 'cheerio';

export async function scrapeJobUrl(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5,pl;q=0.3',
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  return extractJobText(html);
}

function extractJobText(html: string): string {
  const $ = cheerio.load(html);

  // Aggressively remove navigation, filters, sidebars, ads, and all portal chrome
  $(
    'script, style, nav, header, footer, aside, ' +
    '.cookie-banner, .ad, [class*="cookie"], [class*="banner"], [id*="cookie"], ' +
    '[class*="filter"], [class*="Filter"], [id*="filter"], ' +
    '[class*="sidebar"], [class*="Sidebar"], ' +
    '[class*="search"], [class*="Search"], ' +
    '[class*="menu"], [class*="Menu"], ' +
    '[class*="breadcrumb"], [class*="Breadcrumb"], ' +
    '[class*="related"], [class*="similar"], [class*="recommend"], ' +
    '[class*="newsletter"], [class*="social"], ' +
    'form, [role="search"], [role="navigation"], [role="banner"]'
  ).remove();

  // Selectors ordered by specificity - most specific job content first
  const jobSelectors = [
    '[class*="offer-details"]',
    '[class*="offerDetails"]',
    '[class*="job-offer"]',
    '[class*="jobOffer"]',
    '[class*="vacancy"]',
    '[class*="position-details"]',
    '[class*="job-description"]',
    '[class*="jobDescription"]',
    '[class*="job_description"]',
    '[class*="offer-description"]',
    '[class*="offerDescription"]',
    '[id*="job-description"]',
    '[id*="offer"]',
    '[data-testid*="job"]',
    '[data-testid*="offer"]',
    '[data-testid*="description"]',
    'article',
    'main',
    '[role="main"]',
    '.content',
    '#content',
    '#main',
  ];

  let jobText = '';

  for (const selector of jobSelectors) {
    const el = $(selector).first();
    const text = el.text().trim();
    if (el.length && text.length > 300) {
      jobText = text;
      break;
    }
  }

  // Fallback: body text
  if (!jobText || jobText.length < 300) {
    jobText = $('body').text();
  }

  const cleaned = jobText
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 1)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .substring(0, 12000);

  // Detect JS-rendered pages (SPA) - very little meaningful content
  if (cleaned.length < 400) {
    throw new Error(
      'Strona wymaga JavaScript do załadowania treści. ' +
      'Skopiuj tekst ogłoszenia ręcznie i wklej w zakładce "Wklej tekst".'
    );
  }

  // Detect portal-only noise: no job requirement language found
  const jobSignals = [
    'wymagam', 'wymagani', 'oczekujem', 'oferujem', 'obowiązk',
    'kandydat', 'doświadczen', 'umiejętnoś',
    'requirement', 'responsibilities', 'qualif', 'experience', 'skills',
    'we offer', 'we expect', 'you will', 'looking for',
  ];
  const lowerCleaned = cleaned.toLowerCase();
  const hasJobContent = jobSignals.some(signal => lowerCleaned.includes(signal));

  if (!hasJobContent) {
    throw new Error(
      'Nie udało się pobrać treści ogłoszenia — strona prawdopodobnie ładuje zawartość przez JavaScript. ' +
      'Otwórz ogłoszenie w przeglądarce, zaznacz i skopiuj jego tekst, a następnie wklej w zakładce "Wklej tekst".'
    );
  }

  return cleaned;
}
