import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CV Tailor - Dostosuj CV do ofert pracy z AI',
  description: 'Analizuj swoje CV pod konkretne oferty pracy. Otrzymaj scoring, feedback i gotową dostosowaną wersję.',
};

const LAST_UPDATED = new Date('2026-03-22T21:21:00');

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const updated = LAST_UPDATED.toLocaleString('pl-PL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <html lang="pl">
      <body className={`${geist.className} antialiased`}>
        {children}
        <footer className="border-t border-gray-200 bg-white/80 py-4 text-center text-xs text-gray-400">
          Stworzone przez <span className="font-medium text-gray-500">Marcin Krukowski</span>
          &nbsp;·&nbsp;
          Ostatnia aktualizacja: {updated}
        </footer>
      </body>
    </html>
  );
}
