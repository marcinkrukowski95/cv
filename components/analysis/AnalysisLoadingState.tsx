'use client';

import { Brain, FileSearch, Sparkles, Database, ClipboardList } from 'lucide-react';

interface AnalysisLoadingStateProps {
  step: string;
  percent: number;
}

const stepConfig: Record<string, { label: string; sublabel: string; icon: React.ElementType }> = {
  preparing:   { label: 'Przygotowuję analizę…',              sublabel: 'Przetwarzam treść ogłoszenia o pracę',         icon: ClipboardList },
  starting:    { label: 'Uruchamiam analizę…',                sublabel: 'Inicjalizuję połączenie z AI',                 icon: Brain },
  parsing_job: { label: 'Analizuję ogłoszenie o pracę…',      sublabel: 'Wyodrębniam wymagania, obowiązki i słowa kluczowe', icon: FileSearch },
  scoring:     { label: 'Porównuję CV z ogłoszeniem…',        sublabel: 'Oceniam dopasowanie i identyfikuję luki kompetencyjne', icon: ClipboardList },
  tailoring:   { label: 'Dostosowuję CV do oferty…',          sublabel: 'Generuję rekomendacje i przepisane sekcje',   icon: Sparkles },
  saving:      { label: 'Zapisuję wyniki…',                   sublabel: 'Prawie gotowe',                               icon: Database },
};

export function AnalysisLoadingState({ step, percent }: AnalysisLoadingStateProps) {
  const config = stepConfig[step] || { label: 'Przetwarzam…', sublabel: '', icon: Brain };
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-24 space-y-6">
      <div className="relative">
        <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
          <Icon className="h-10 w-10 text-blue-600 animate-pulse" />
        </div>
        <div className="absolute inset-0 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
      </div>

      <div className="text-center space-y-1">
        <p className="text-lg font-semibold text-gray-900">{config.label}</p>
        <p className="text-sm text-gray-500">{config.sublabel}</p>
      </div>

      <div className="w-72 space-y-2">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Postęp</span>
          <span>{percent}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
