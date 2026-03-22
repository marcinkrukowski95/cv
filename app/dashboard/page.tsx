'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CVUploader } from '@/components/cv/CVUploader';
import { JobInputForm } from '@/components/job/JobInputForm';
import { AnalysisLoadingState } from '@/components/analysis/AnalysisLoadingState';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const [selectedCvId, setSelectedCvId] = useState<string | null>(null);
  const [selectedCvName, setSelectedCvName] = useState<string | null>(null);
  const [jobText, setJobText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState({ step: 'starting', percent: 0 });
  const [error, setError] = useState<string | null>(null);

  const jobTextValid = jobText.trim().length >= 50;
  const canAnalyze = !!selectedCvId && jobTextValid && !analyzing;

  const handleAnalyze = async () => {
    if (!selectedCvId || !jobTextValid) return;

    setAnalyzing(true);
    setError(null);
    setProgress({ step: 'preparing', percent: 3 });

    try {
      // Auto-submit job text before analysis
      const jobRes = await fetch('/api/job/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: jobText.trim() }),
      });
      const jobData = await jobRes.json();
      if (!jobRes.ok) throw new Error(jobData.error || 'Błąd przetwarzania oferty');

      const jobId = jobData.id;

      setProgress({ step: 'starting', percent: 8 });

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvId: selectedCvId, jobId }),
      });

      if (!res.body) throw new Error('No response stream');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let currentEvent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith('data: ') && currentEvent) {
            const data = JSON.parse(line.slice(6));
            if (currentEvent === 'progress') {
              setProgress({ step: data.step, percent: data.percent });
            } else if (currentEvent === 'complete') {
              router.push(`/analysis/${data.analysisId}`);
              return;
            } else if (currentEvent === 'error') {
              throw new Error(data.message);
            }
            currentEvent = '';
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analiza nie powiodła się');
      setAnalyzing(false);
    }
  };

  if (analyzing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="border-b border-gray-200 bg-white">
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span className="font-bold text-gray-900">CV Tailor</span>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-6">
          <AnalysisLoadingState step={progress.step} percent={progress.percent} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <FileText className="h-5 w-5 text-blue-600" />
            <span className="font-bold text-gray-900">CV Tailor</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nowa analiza</h1>
          <p className="text-gray-700 mt-1">Wybierz CV i podaj ofertę pracy, aby otrzymać personalizowany feedback</p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Step 1: CV */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={cn(
                'h-7 w-7 rounded-full flex items-center justify-center text-sm font-bold',
                selectedCvId ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              )}>
                {selectedCvId ? <CheckCircle className="h-4 w-4" /> : '1'}
              </div>
              <CardTitle>Wybierz CV</CardTitle>
              {selectedCvName && (
                <span className="ml-auto text-sm text-green-700 font-medium truncate max-w-[200px]">
                  {selectedCvName}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <CVUploader
              onSelect={(id, name) => { setSelectedCvId(id); setSelectedCvName(name); }}
              selectedCvId={selectedCvId || undefined}
            />
          </CardContent>
        </Card>

        {/* Step 2: Job */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={cn(
                'h-7 w-7 rounded-full flex items-center justify-center text-sm font-bold',
                jobTextValid ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              )}>
                {jobTextValid ? <CheckCircle className="h-4 w-4" /> : '2'}
              </div>
              <CardTitle>Oferta pracy</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <JobInputForm text={jobText} onChange={setJobText} />
          </CardContent>
        </Card>

        <Button
          onClick={handleAnalyze}
          disabled={!canAnalyze}
          size="lg"
          className="w-full"
        >
          Analizuj CV
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </main>
    </div>
  );
}
