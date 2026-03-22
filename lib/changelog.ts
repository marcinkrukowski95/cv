export const APP_VERSION = '1.3.0';

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.3.0',
    date: '22.03.2026',
    changes: [
      'Usunięto konieczność ręcznego klikania "Załaduj opis" — oferta ładuje się automatycznie',
      'Płynniejszy pasek postępu — aktualizowany na bieżąco podczas generowania odpowiedzi AI',
      'Szczegółowe statusy analizy: zbieranie wymagań, porównywanie, dostosowywanie CV',
      'Ulepszony prompt AI: ocena oparta wyłącznie na dowodach, surowsza i bardziej rzetelna',
      'Wnioski i rekomendacje zawsze po polsku',
      'Changelog i wersjonowanie aplikacji',
    ],
  },
  {
    version: '1.2.0',
    date: '22.03.2026',
    changes: [
      'Wdrożenie na produkcję: cv.ergotree.pl',
      'Migracja storage z plików JSON na MySQL',
      'Połączenie z GitHub (marcinkrukowski95/cv)',
      'Naprawa błędu 404 po analizie (strona wyników używała złego storage)',
      'Wyłączenie buforowania SSE przez nginx (X-Accel-Buffering: no)',
    ],
  },
  {
    version: '1.1.0',
    date: '22.03.2026',
    changes: [
      'Wnioski i feedback wyłącznie po polsku',
      'Footer z autorem i datą ostatniej aktualizacji',
    ],
  },
  {
    version: '1.0.0',
    date: '06.03.2026',
    changes: [
      'Pierwsze wydanie aplikacji',
      'Upload CV w formacie PDF',
      'Analiza CV vs oferta pracy (3 wywołania Claude API)',
      'Scoring dopasowania, analiza luk, dostosowane CV',
      'Integracja z Canva (import designu)',
    ],
  },
];
