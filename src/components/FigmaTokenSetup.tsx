import { useState } from 'react';
import { Settings, Check, X } from 'lucide-react';
import { useSurveyStore } from '../stores/useSurveyStore';
import { validateFigmaToken } from '../lib/figma/api';
import { Button } from './Button';

export function FigmaTokenSetup() {
  const { figmaToken, setFigmaToken } = useSurveyStore();
  const [isOpen, setIsOpen] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setIsValidating(true);
    setError('');

    const isValid = await validateFigmaToken(tokenInput);

    if (isValid) {
      setFigmaToken(tokenInput);
      setIsOpen(false);
      setTokenInput('');
    } else {
      setError('Invalid token. Please check and try again.');
    }

    setIsValidating(false);
  };

  const handleDisconnect = () => {
    setFigmaToken(null);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
          figmaToken
            ? 'border-gray-900 bg-gray-50 text-gray-900'
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        <Settings className="h-4 w-4" />
        {figmaToken ? 'Figma Connected' : 'Connect Figma'}
        {figmaToken && <Check className="h-3 w-3 text-green-600" />}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="absolute right-0 top-full z-40 mt-2 w-96 rounded-lg border border-gray-200 bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Connect to Figma</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {!figmaToken ? (
              <>
                <p className="mb-4 text-xs text-gray-600">
                  Get a Personal Access Token from Figma Settings → Personal Access Tokens
                </p>
                <div className="mb-4">
                  <label className="mb-2 block text-xs font-medium text-gray-700">
                    Figma Access Token
                  </label>
                  <input
                    type="password"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="figd_xxxxxxxxxxxxx"
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                  {error && (
                    <p className="mt-2 text-xs text-red-600">{error}</p>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={!tokenInput || isValidating}
                    loading={isValidating}
                  >
                    Connect
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-4 rounded-md bg-green-50 p-3">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <p className="text-sm font-medium text-green-900">Connected to Figma</p>
                  </div>
                  <p className="mt-1 text-xs text-green-700">
                    You can now export charts directly to Figma Slides
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth
                  onClick={handleDisconnect}
                >
                  Disconnect
                </Button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
