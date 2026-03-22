'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, ExternalLink, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CanvaDesign {
  id: string;
  title: string;
  thumbnail?: { url: string };
  updated_at: number;
}

interface CanvaDesignPickerProps {
  onSelect: (cvId: string, name: string) => void;
  selectedCvId?: string;
}

export function CanvaDesignPicker({ onSelect, selectedCvId }: CanvaDesignPickerProps) {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [designs, setDesigns] = useState<CanvaDesign[]>([]);
  const [loading, setLoading] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importedMap, setImportedMap] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/auth/canva/status')
      .then(r => r.json())
      .then(d => {
        setConnected(d.connected);
        if (d.connected) loadDesigns();
      });
  }, []);

  const loadDesigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/canva/designs?query=CV');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDesigns(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load designs');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (design: CanvaDesign) => {
    if (importedMap[design.id]) {
      onSelect(importedMap[design.id], design.title);
      return;
    }

    setImportingId(design.id);
    setError(null);
    try {
      const res = await fetch('/api/canva/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ designId: design.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setImportedMap(prev => ({ ...prev, [design.id]: data.id }));
      onSelect(data.id, design.title);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImportingId(null);
    }
  };

  if (connected === null) {
    return <div className="h-20 flex items-center justify-center text-sm text-gray-400">Sprawdzam połączenie...</div>;
  }

  if (!connected) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto">
          <ImageIcon className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <p className="font-medium text-gray-800">Połącz konto Canva</p>
          <p className="text-sm text-gray-500 mt-1">
            Autoryzuj dostęp do swoich projektów, aby móc importować CV bezpośrednio z Canvy
          </p>
        </div>
        <a href="/api/auth/canva">
          <Button variant="outline">
            <ExternalLink className="h-4 w-4 mr-2" />
            Połącz z Canvą
          </Button>
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {loading ? 'Wczytuję projekty...' : `${designs.length} projektów`}
        </p>
        <Button variant="ghost" size="sm" onClick={loadDesigns} disabled={loading}>
          <RefreshCw className={cn('h-4 w-4 mr-1', loading && 'animate-spin')} />
          Odśwież
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {designs.length === 0 && !loading && (
        <p className="text-sm text-gray-400 text-center py-8">
          Brak projektów z &quot;CV&quot; w nazwie. Spróbuj wyszukać inaczej.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {designs.map(design => {
          const cvId = importedMap[design.id];
          const isSelected = cvId && cvId === selectedCvId;
          const isImporting = importingId === design.id;

          return (
            <button
              key={design.id}
              onClick={() => handleImport(design)}
              disabled={isImporting}
              className={cn(
                'relative rounded-lg border overflow-hidden text-left transition-all',
                isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300',
                isImporting && 'opacity-60 pointer-events-none'
              )}
            >
              <div className="aspect-video bg-gray-100 relative">
                {design.thumbnail?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={design.thumbnail.url}
                    alt={design.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-300" />
                  </div>
                )}
                {isImporting && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
                  </div>
                )}
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="h-5 w-5 text-blue-600 bg-white rounded-full" />
                  </div>
                )}
              </div>
              <div className="p-2">
                <p className="text-xs font-medium text-gray-800 truncate">{design.title}</p>
                <p className="text-xs text-gray-400">
                  {new Date(design.updated_at * 1000).toLocaleDateString('pl-PL')}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
