import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FileText, ArrowLeft, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MatchScore } from '@/components/analysis/MatchScore';
import { SkillsGapChart } from '@/components/analysis/SkillsGapChart';
import { FeedbackPanel } from '@/components/analysis/FeedbackPanel';
import { TailoredCVSection } from '@/components/analysis/TailoredCVSection';
import { analysisStore } from '@/lib/storage/dbStore';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AnalysisPage({ params }: PageProps) {
  const { id } = await params;
  const analysis = await analysisStore.get(id);

  if (!analysis) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <FileText className="h-5 w-5 text-blue-600" />
            <span className="font-bold text-gray-900">CV Tailor</span>
          </Link>
          <div className="flex gap-2">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Wróć
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm">
                <PlusCircle className="h-4 w-4 mr-1" />
                Nowa analiza
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wyniki analizy</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {new Date(analysis.createdAt).toLocaleString('pl-PL')}
          </p>
        </div>

        <MatchScore score={analysis.matchScore} breakdown={analysis.scoreBreakdown} />

        <SkillsGapChart
          matchedSkills={analysis.matchedSkills}
          missingSkills={analysis.missingSkills}
          partialSkills={analysis.partialSkills}
        />

        <FeedbackPanel feedback={analysis.feedback} />

        <TailoredCVSection tailoredCV={analysis.tailoredCV} analysisId={analysis.id} />
      </main>
    </div>
  );
}
