'use client';

import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScoreBreakdown } from '@/types';

interface MatchScoreProps {
  score: number;
  breakdown: ScoreBreakdown;
}

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 75 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626';
  const data = [{ value: score, fill: color }];

  return (
    <div className="relative flex items-center justify-center">
      <ResponsiveContainer width={200} height={200}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="65%"
          outerRadius="90%"
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar dataKey="value" background={{ fill: '#e5e7eb' }} cornerRadius={8} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold" style={{ color }}>{score}</span>
        <span className="text-sm text-gray-700">/ 100</span>
      </div>
    </div>
  );
}

function SubScore({ label, value }: { label: string; value: number }) {
  const color = value >= 75 ? 'bg-green-500' : value >= 50 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100">
        <div className={`h-2 rounded-full ${color} transition-all`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function MatchScore({ score, breakdown }: MatchScoreProps) {
  const label = score >= 75 ? 'Silne dopasowanie' : score >= 50 ? 'Umiarkowane dopasowanie' : 'Słabe dopasowanie';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dopasowanie CV do oferty</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-6 md:flex-row">
          <div className="flex flex-col items-center">
            <ScoreGauge score={score} />
            <p className="mt-1 text-sm font-medium text-gray-700">{label}</p>
          </div>
          <div className="flex-1 space-y-3 w-full">
            <SubScore label="Umiejętności techniczne" value={breakdown.technicalSkills} />
            <SubScore label="Doświadczenie" value={breakdown.experience} />
            <SubScore label="Wykształcenie" value={breakdown.education} />
            <SubScore label="Słowa kluczowe" value={breakdown.keywords} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
