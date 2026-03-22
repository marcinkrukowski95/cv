'use client';

import { Brain, FileSearch, Sparkles } from 'lucide-react';

interface AnalysisLoadingStateProps {
  step: string;
  percent: number;
}

const stepConfig: Record<string, { label: string; icon: React.ElementType }> = {
  starting: { label: 'Uruchamianie analizy...', icon: Brain },
  parsing_job: { label: 'Analizuję ofertę pracy...', icon: FileSearch },
  scoring: { label: 'Oceniam dopasowanie CV...', icon: Brain },
  tailoring: { label: 'Dostosowuję CV do oferty...', icon: Sparkles },
  saving: { label: 'Zapisuję wyniki...', icon: FileSearch },
};

export function AnalysisLoadingState({ step, percent }: AnalysisLoadingStateProps) {
  const config = stepConfig[step] || { label: 'Przetwarzam...', icon: Brain };
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-24 space-y-6">
      <div className="relative">
        <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
          <Icon className="h-10 w-10 text-blue-600 animate-pulse" />
        </div>
        <div className="absolute inset-0 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
      </div>

      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-gray-800">{config.label}</p>
        <p className="text-sm text-gray-700">To może potrwać do 60 sekund...</p>
      </div>

      <div className="w-64 space-y-1">
        <div className="flex justify-between text-xs text-gray-500">
          <span className="text-gray-700">Postęp</span>
          <span className="text-gray-700">{percent}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
