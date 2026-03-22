'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface JobResult {
  id: string;
  source: string;
  preview: string;
  length: number;
}

interface JobInputFormProps {
  onSelect: (jobId: string) => void;
  selectedJobId?: string;
}

export function JobInputForm({ onSelect, selectedJobId }: JobInputFormProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<JobResult | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/job/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to process job listing');
      }

      setResult(data);
      onSelect(data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd przetwarzania');
    } finally {
      setLoading(false);
    }
  };

  const isValid = text.trim().length >= 50;

  return (
    <div className="space-y-4">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Wklej treść ogłoszenia o pracę..."
        rows={8}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {result && selectedJobId === result.id ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Oferta załadowana</span>
          </div>
          <p className="text-xs text-green-700 line-clamp-3">{result.preview}</p>
          <p className="text-xs text-green-700 mt-1">{result.length} znaków</p>
        </div>
      ) : (
        <Button
          onClick={handleSubmit}
          disabled={!isValid || loading}
          className="w-full"
        >
          {loading ? 'Przetwarzam...' : 'Załaduj opis'}
        </Button>
      )}
    </div>
  );
}
