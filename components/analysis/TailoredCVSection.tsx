'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TailoredCVData } from '@/types';
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface TailoredCVSectionProps {
  tailoredCV: TailoredCVData;
  analysisId: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleCopy} className="shrink-0">
      {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
      <span className="ml-1">{copied ? 'Skopiowano' : 'Kopiuj'}</span>
    </Button>
  );
}

function SectionDiff({ section }: { section: TailoredCVData['sections'][0] }) {
  const [showOriginal, setShowOriginal] = useState(false);

  const changeTypeLabels: Record<string, string> = {
    reword: 'Przepisano',
    add: 'Dodano',
    remove: 'Usunięto',
    reorder: 'Zmieniono kolejność',
    emphasize: 'Podkreślono',
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-300">
        <h4 className="font-semibold text-sm text-gray-900">{section.sectionName}</h4>
        <div className="flex items-center gap-2">
          {section.changesApplied.length > 0 && (
            <Badge variant="success">{section.changesApplied.length} zmian</Badge>
          )}
          <CopyButton text={section.tailoredText} />
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Tailored text */}
        <div>
          <p className="text-xs font-medium text-green-700 mb-1">Wersja dostosowana:</p>
          <div className="rounded bg-green-50 border border-green-200 p-3 text-sm text-gray-800 whitespace-pre-wrap">
            {section.tailoredText}
          </div>
        </div>

        {/* Changes list */}
        {section.changesApplied.length > 0 && (
          <ul className="space-y-1">
            {section.changesApplied.map((change, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                {change}
              </li>
            ))}
          </ul>
        )}

        {/* Toggle original */}
        <button
          onClick={() => setShowOriginal(o => !o)}
          className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800"
        >
          {showOriginal ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {showOriginal ? 'Ukryj oryginał' : 'Pokaż oryginał'}
        </button>

        {showOriginal && (
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">Oryginał:</p>
            <div className="rounded bg-gray-50 border border-gray-300 p-3 text-sm text-gray-800 whitespace-pre-wrap">
              {section.originalText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function TailoredCVSection({ tailoredCV, analysisId }: TailoredCVSectionProps) {
  const [copiedAll, setCopiedAll] = useState(false);

  const allTailoredText = tailoredCV.sections
    .map(s => `=== ${s.sectionName} ===\n${s.tailoredText}`)
    .join('\n\n');

  const handleCopyAll = async () => {
    await navigator.clipboard.writeText(allTailoredText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Dostosowane CV</CardTitle>
          <Button variant="outline" size="sm" onClick={handleCopyAll}>
            {copiedAll ? <Check className="h-4 w-4 mr-1 text-green-600" /> : <Copy className="h-4 w-4 mr-1" />}
            {copiedAll ? 'Skopiowano!' : 'Kopiuj całość'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {tailoredCV.sections.map((section, i) => (
          <SectionDiff key={i} section={section} />
        ))}

        {tailoredCV.changeLog.length > 0 && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-gray-700 hover:text-gray-900">
              Dziennik zmian ({tailoredCV.changeLog.length})
            </summary>
            <ul className="mt-2 space-y-1 pl-4">
              {tailoredCV.changeLog.map((entry, i) => (
                <li key={i} className="text-xs text-gray-700">
                  <span className="font-medium text-gray-900">[{entry.section}]</span>{' '}
                  {entry.changeType}: {entry.description}
                </li>
              ))}
            </ul>
          </details>
        )}
      </CardContent>
    </Card>
  );
}
