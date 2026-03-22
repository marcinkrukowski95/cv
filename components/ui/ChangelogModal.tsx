'use client';

import { useState } from 'react';
import { CHANGELOG, APP_VERSION } from '@/lib/changelog';

export function ChangelogModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="underline underline-offset-2 hover:text-gray-600 transition-colors"
      >
        v{APP_VERSION}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Historia zmian</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-4 space-y-6">
              {CHANGELOG.map(entry => (
                <div key={entry.version}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-sm text-blue-600">v{entry.version}</span>
                    <span className="text-xs text-gray-400">{entry.date}</span>
                  </div>
                  <ul className="space-y-1">
                    {entry.changes.map((change, i) => (
                      <li key={i} className="text-sm text-gray-600 flex gap-2">
                        <span className="text-gray-300 shrink-0">–</span>
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
