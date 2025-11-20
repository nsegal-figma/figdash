/**
 * ChartExportMenu Component
 * Export menu for charts (CSV, PNG, SVG)
 */

import { useState } from 'react';
import { Download, FileText, Image, Code } from 'lucide-react';
import { useChartExport } from '../hooks/useChartExport';

export interface ChartExportMenuProps {
  /** Chart data to export */
  data: Record<string, any>[];
  /** Chart name for filename */
  chartName: string;
  /** Optional: SVG element ref for image export */
  svgRef?: React.RefObject<SVGSVGElement>;
}

/**
 * ChartExportMenu - Dropdown menu for exporting chart data/images
 *
 * Usage:
 * ```tsx
 * const svgRef = useRef<SVGSVGElement>(null);
 *
 * <div style={{ position: 'relative' }}>
 *   <BarChartV2 data={data} ... />
 *   <ChartExportMenu data={data} chartName="responses" svgRef={svgRef} />
 * </div>
 * ```
 */
export function ChartExportMenu({ data, chartName, svgRef }: ChartExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { exportCSV, exportPNG, exportSVG } = useChartExport();

  const handleExportCSV = () => {
    exportCSV(data, `${chartName}-data.csv`);
    setIsOpen(false);
  };

  const handleExportPNG = async () => {
    if (svgRef?.current) {
      await exportPNG(svgRef.current, `${chartName}-chart.png`);
      setIsOpen(false);
    }
  };

  const handleExportSVG = () => {
    if (svgRef?.current) {
      exportSVG(svgRef.current, `${chartName}-chart.svg`);
      setIsOpen(false);
    }
  };

  return (
    <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '8px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '14px',
          fontWeight: 500,
          color: '#374151',
        }}
        aria-label="Export chart"
      >
        <Download size={16} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '4px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            minWidth: '160px',
            overflow: 'hidden',
          }}
        >
          <button
            onClick={handleExportCSV}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              color: '#374151',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <FileText size={16} />
            Export CSV
          </button>

          {svgRef?.current && (
            <>
              <button
                onClick={handleExportPNG}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  color: '#374151',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Image size={16} />
                Export PNG
              </button>

              <button
                onClick={handleExportSVG}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  color: '#374151',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Code size={16} />
                Export SVG
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
