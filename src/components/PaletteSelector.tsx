import { useState } from 'react';
import { Palette } from 'lucide-react';
import { COLOR_PALETTES } from '../lib/colorPalettes';
import { useSurveyStore } from '../stores/useSurveyStore';

export function PaletteSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedPalette, setSelectedPalette } = useSurveyStore();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
      >
        <Palette className="h-4 w-4" />
        Colors
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
            <h3 className="mb-3 text-sm font-medium text-gray-900">Color Palette</h3>
            <div className="space-y-2">
              {COLOR_PALETTES.map((palette) => (
                <button
                  key={palette.id}
                  onClick={() => {
                    setSelectedPalette(palette);
                    setIsOpen(false);
                  }}
                  className={`w-full rounded-md border p-2 text-left transition-colors ${
                    selectedPalette.id === palette.id
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="mb-2 text-xs font-medium text-gray-700">{palette.name}</div>
                  <div className="flex gap-1">
                    {palette.colors.map((color, idx) => (
                      <div
                        key={idx}
                        className="h-4 flex-1 rounded-sm"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
