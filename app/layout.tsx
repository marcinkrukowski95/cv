import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CV Tailor - Dostosuj CV do ofert pracy z AI',
  description: 'Analizuj swoje CV pod konkretne oferty pracy. Otrzymaj scoring, feedback i gotową dostosowaną wersję.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className={`${geist.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
