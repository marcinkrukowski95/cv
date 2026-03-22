'use client';

interface JobInputFormProps {
  text: string;
  onChange: (text: string) => void;
}

export function JobInputForm({ text, onChange }: JobInputFormProps) {
  return (
    <textarea
      value={text}
      onChange={e => onChange(e.target.value)}
      placeholder="Wklej treść ogłoszenia o pracę..."
      rows={8}
      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
    />
  );
}
