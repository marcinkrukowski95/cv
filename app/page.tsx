import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, Brain, Sparkles, BarChart3 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-bold text-gray-900">CV Tailor</span>
          </div>
          <Link href="/dashboard">
            <Button size="sm">Zacznij teraz</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center space-y-6 mb-20">
          <h1 className="text-5xl font-bold text-gray-900 leading-tight">
            Dostosuj CV do<br />
            <span className="text-blue-600">każdej oferty pracy</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Załaduj swoje CV, podaj link do oferty pracy i otrzymaj szczegółowy feedback
            oraz gotową wersję CV dostosowaną pod konkretne stanowisko.
          </p>
          <Link href="/dashboard">
            <Button size="lg">Zacznij analizę</Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: FileText,
              title: 'Wgraj CV',
              desc: 'Załaduj swoje CV w formacie PDF lub zaimportuj projekt z Canvy',
            },
            {
              icon: BarChart3,
              title: 'Scoring',
              desc: 'Otrzymaj ocenę % dopasowania i analizę luk w umiejętnościach',
            },
            {
              icon: Brain,
              title: 'AI Feedback',
              desc: 'Claude analizuje CV sekcja po sekcji i wskazuje konkretne zmiany',
            },
            {
              icon: Sparkles,
              title: 'Gotowe CV',
              desc: 'Dostosowana wersja CV z przepisanymi sekcjami gotowa do skopiowania',
            },
          ].map(feature => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
