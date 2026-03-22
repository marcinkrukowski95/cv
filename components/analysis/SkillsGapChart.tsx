'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SkillMatch } from '@/types';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface SkillsGapChartProps {
  matchedSkills: string[];
  missingSkills: string[];
  partialSkills: SkillMatch[];
}

function SkillPill({ skill, variant, tooltip }: { skill: string; variant: 'success' | 'destructive' | 'warning'; tooltip?: string }) {
  return (
    <Badge variant={variant} className="cursor-default" title={tooltip}>
      {skill}
    </Badge>
  );
}

export function SkillsGapChart({ matchedSkills, missingSkills, partialSkills }: SkillsGapChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analiza umiejętności</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-3">
          {/* Matched */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <h4 className="font-medium text-green-700">Masz ({matchedSkills.length})</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {matchedSkills.length > 0 ? (
                matchedSkills.map(skill => (
                  <SkillPill key={skill} skill={skill} variant="success" />
                ))
              ) : (
                <p className="text-sm text-gray-600">Brak dopasowanych umiejętności</p>
              )}
            </div>
          </div>

          {/* Partial */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <h4 className="font-medium text-yellow-700">Do podkreślenia ({partialSkills.length})</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {partialSkills.length > 0 ? (
                partialSkills.map(ps => (
                  <SkillPill
                    key={ps.skill}
                    skill={ps.skill}
                    variant="warning"
                    tooltip={`Sugestia: ${ps.suggestedPresentation}`}
                  />
                ))
              ) : (
                <p className="text-sm text-gray-600">Brak</p>
              )}
            </div>
          </div>

          {/* Missing */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <h4 className="font-medium text-red-700">Brakuje ({missingSkills.length})</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {missingSkills.length > 0 ? (
                missingSkills.map(skill => (
                  <SkillPill key={skill} skill={skill} variant="destructive" />
                ))
              ) : (
                <p className="text-sm text-gray-600">Brak luk</p>
              )}
            </div>
          </div>
        </div>

        {partialSkills.length > 0 && (
          <div className="mt-4 rounded-lg bg-yellow-50 p-3 text-xs text-yellow-800">
            Najedź kursorem na umiejętności oznaczone kolorem pomarańczowym, aby zobaczyć sugestię jak lepiej je zaprezentować.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
