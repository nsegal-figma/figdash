import { useState, useEffect } from 'react';
import { VisxPrototype } from './VisxPrototype';
import { TremorPrototype } from './TremorPrototype';
import { RechartsPrototype } from './RechartsPrototype';
import { testData } from './testData';

export function ComparisonPage() {
  const [renderTimes] = useState<{
    visx: number;
    tremor: number;
    recharts: number;
  }>({ visx: 0, tremor: 0, recharts: 0 });

  useEffect(() => {
    // Simple render time measurement
    const start = performance.now();
    setTimeout(() => {
      const end = performance.now();
      console.log('Page render time:', end - start, 'ms');
    }, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Visualization Library Evaluation
      </h1>

      <div className="space-y-8">
        {/* Visx Prototype */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            1. Visx (D3 + React Primitives)
          </h2>
          <div className="border border-gray-200 rounded-lg p-4">
            <VisxPrototype data={testData} width={800} height={400} />
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>Pros:</strong> Maximum customization, D3 power, composable primitives</p>
            <p><strong>Cons:</strong> Steeper learning curve, more code required</p>
            <p className="text-error font-semibold mt-2">
              ⚠️ React 19 NOT officially supported (requires --legacy-peer-deps)
            </p>
          </div>
        </div>

        {/* Tremor Prototype */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            2. Tremor (Purpose-Built for Dashboards)
          </h2>
          <div className="border border-gray-200 rounded-lg p-4">
            <TremorPrototype data={testData} width={800} height={400} />
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>Pros:</strong> Minimal code, beautiful defaults, opinionated</p>
            <p><strong>Cons:</strong> Less customization, limited control over styling</p>
            <p className="text-error font-semibold mt-2">
              ⚠️ React 19 NOT officially supported (requires --legacy-peer-deps)
            </p>
          </div>
        </div>

        {/* Recharts Prototype */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            3. Enhanced Recharts (Current Library)
          </h2>
          <div className="border border-gray-200 rounded-lg p-4">
            <RechartsPrototype data={testData} width={800} height={400} />
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>Pros:</strong> Already installed, familiar, good docs, balanced</p>
            <p><strong>Cons:</strong> Less primitive control than Visx, less opinionated than Tremor</p>
            <p className="text-success font-semibold mt-2">
              ✅ React 19 compatible (already using it successfully)
            </p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 p-6 rounded-xl">
        <h3 className="font-semibold text-blue-900 mb-2">Evaluation Instructions:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>1. Hover over bars to test tooltips</li>
          <li>2. Resize browser window to test responsiveness</li>
          <li>3. Open React DevTools Profiler to measure render performance</li>
          <li>4. Check console for any errors or warnings</li>
          <li>5. Compare code complexity in spike/*.tsx files</li>
        </ul>
      </div>

      {/* Performance Metrics (to be filled manually) */}
      <div className="mt-8 bg-white p-6 rounded-xl shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Performance Metrics:</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <h4 className="font-medium text-gray-700">Visx</h4>
            <p className="text-sm text-gray-500">Render time: {renderTimes.visx || 'TBD'}ms</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700">Tremor</h4>
            <p className="text-sm text-gray-500">Render time: {renderTimes.tremor || 'TBD'}ms</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700">Recharts</h4>
            <p className="text-sm text-gray-500">Render time: {renderTimes.recharts || 'TBD'}ms</p>
          </div>
        </div>
      </div>
    </div>
  );
}
