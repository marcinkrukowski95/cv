'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface UploadedCV {
  id: string;
  fileName: string;
  sections: {
    name?: string;
    skillsCount: number;
    experienceCount: number;
    educationCount: number;
  };
}

interface CVUploaderProps {
  onSelect: (cvId: string, fileName: string) => void;
  selectedCvId?: string;
}

export function CVUploader({ onSelect, selectedCvId }: CVUploaderProps) {
  const [uploadedCVs, setUploadedCVs] = useState<UploadedCV[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/cv/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      const cv: UploadedCV = {
        id: data.id,
        fileName: data.fileName,
        sections: data.sections,
      };
      setUploadedCVs(prev => [cv, ...prev]);
      onSelect(cv.id, cv.fileName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [onSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50',
          uploading && 'pointer-events-none opacity-60'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
        {uploading ? (
          <p className="text-sm text-gray-600">Przetwarzam PDF...</p>
        ) : isDragActive ? (
          <p className="text-sm text-blue-600 font-medium">Upuść plik tutaj</p>
        ) : (
          <>
            <p className="text-sm font-medium text-gray-700">Przeciągnij PDF lub kliknij, aby wybrać</p>
            <p className="text-xs text-gray-400 mt-1">Maksymalnie 10MB</p>
          </>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {uploadedCVs.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Wgrane CV</p>
          {uploadedCVs.map(cv => (
            <button
              key={cv.id}
              onClick={() => onSelect(cv.id, cv.fileName)}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors',
                selectedCvId === cv.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              )}
            >
              <FileText className={cn('h-5 w-5 shrink-0', selectedCvId === cv.id ? 'text-blue-600' : 'text-gray-400')} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{cv.fileName}</p>
                <p className="text-xs text-gray-500">
                  {cv.sections.name && `${cv.sections.name} · `}
                  {cv.sections.experienceCount} stanowisk · {cv.sections.skillsCount} umiejętności
                </p>
              </div>
              {selectedCvId === cv.id && (
                <CheckCircle className="h-4 w-4 text-blue-600 shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
