'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StructuredFeedback, FeedbackItem } from '@/types';
import { ChevronDown, ChevronUp, AlertTriangle, Info, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeedbackPanelProps {
  feedback: StructuredFeedback;
}

const priorityConfig = {
  high: { label: 'Wysoki priorytet', variant: 'destructive' as const, icon: AlertTriangle, color: 'text-red-600' },
  medium: { label: 'Średni priorytet', variant: 'warning' as const, icon: Info, color: 'text-yellow-600' },
  low: { label: 'Niski priorytet', variant: 'secondary' as const, icon: Lightbulb, color: 'text-gray-600' },
};

function PriorityCard({ item }: { item: FeedbackItem }) {
  const config = priorityConfig[item.priority];
  const Icon = config.icon;

  return (
    <div className="rounded-lg border border-gray-300 p-4 space-y-2.5 bg-white">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className={cn('h-4 w-4 shrink-0', config.color)} />
          <span className="font-semibold text-sm text-gray-900">{item.section}</span>
        </div>
        <Badge variant={item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'warning' : 'secondary'}>
          {config.label}
        </Badge>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{item.issue}</p>
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-900 leading-relaxed">
        <span className="font-semibold">Sugestia: </span>{item.suggestion}
      </div>
      {item.example && (
        <div className="rounded-lg bg-gray-100 border border-gray-200 p-2.5 text-xs text-gray-700 font-mono leading-relaxed">
          <span className="font-semibold text-gray-600">Przykład: </span>{item.example}
        </div>
      )}
    </div>
  );
}

function SectionAccordion({ section }: { section: { section: string; issues: string[]; rewriteSuggestion?: string; currentText?: string } }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-sm text-gray-900">{section.section}</span>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <Badge variant="secondary" className="text-gray-700 font-medium">{section.issues.length} uwag</Badge>
          {open ? <ChevronUp className="h-4 w-4 text-gray-600" /> : <ChevronDown className="h-4 w-4 text-gray-600" />}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-200 pt-3 bg-gray-50">
          <ul className="space-y-2">
            {section.issues.map((issue, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-800">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-500 shrink-0" />
                {issue}
              </li>
            ))}
          </ul>
          {section.rewriteSuggestion && (
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Sugerowana wersja:</p>
              <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-900 whitespace-pre-wrap leading-relaxed">
                {section.rewriteSuggestion}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function FeedbackPanel({ feedback }: FeedbackPanelProps) {
  return (
    <div className="space-y-6">
      {/* Overall summary */}
      <Card>
        <CardHeader>
          <CardTitle>Podsumowanie analizy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">{feedback.overallSummary}</p>
          {feedback.keywordsToAdd.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600 mb-2">Słowa kluczowe do dodania:</p>
              <div className="flex flex-wrap gap-2">
                {feedback.keywordsToAdd.map(kw => (
                  <Badge key={kw} variant="outline">{kw}</Badge>
                ))}
              </div>
            </div>
          )}
          {feedback.toneAdjustments && (
            <div className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
              <span className="font-medium">Ton i styl: </span>{feedback.toneAdjustments}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top priorities */}
      <Card>
        <CardHeader>
          <CardTitle>Priorytety zmian</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {feedback.topPriorities.map((item, i) => (
            <PriorityCard key={i} item={item} />
          ))}
        </CardContent>
      </Card>

      {/* Section feedback */}
      {feedback.sectionFeedback.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Feedback per sekcja</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {feedback.sectionFeedback.map((section, i) => (
              <SectionAccordion key={i} section={section} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
