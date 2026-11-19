import React, { useState, useRef, useEffect } from 'react';
import type { ScientificMeasurements } from '../physics/types';
import { formatAxisLabel } from '../physics/units';
import { LineChart, ChevronDown, ChevronUp } from 'lucide-react';

interface BottomAnalysisProps {
  measurements: ScientificMeasurements;
  simulationTimeYears: number;
}

export const BottomAnalysis: React.FC<BottomAnalysisProps> = ({
  measurements,
  simulationTimeYears,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'energy' | 'distance' | 'orbit'>('energy');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Render Multi-Series Telemetry Chart
  useEffect(() => {
    if (!isExpanded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const history = measurements.history;
    if (history.length < 2) {
      ctx.fillStyle = '#8E9BAD';
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText('Collecting telemetry points...', 20, height / 2);
      return;
    }

    let minVal = Infinity;
    let maxVal = -Infinity;
    for (const h of history) {
      if (h.kinetic < minVal) minVal = h.kinetic;
      if (h.potential < minVal) minVal = h.potential;
      if (h.total < minVal) minVal = h.total;

      if (h.kinetic > maxVal) maxVal = h.kinetic;
      if (h.potential > maxVal) maxVal = h.potential;
      if (h.total > maxVal) maxVal = h.total;
    }

    const range = Math.max(1e-6, maxVal - minVal);
    const padLeft = 44;
    const padRight = 16;
    const padTop = 16;
    const padBottom = 22;

    const getY = (val: number) => {
      const norm = (val - minVal) / range;
      return height - padBottom - norm * (height - padTop - padBottom);
    };

    const getX = (idx: number) => {
      return padLeft + (idx / (history.length - 1)) * (width - padLeft - padRight);
    };

    // Grid lines
    ctx.strokeStyle = '#263447';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);

    for (let i = 1; i <= 3; i++) {
      const y = padTop + (i / 4) * (height - padTop - padBottom);
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Axes
    ctx.strokeStyle = '#3a4d66';
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop);
    ctx.lineTo(padLeft, height - padBottom);
    ctx.lineTo(width - padRight, height - padBottom);
    ctx.stroke();

    const drawLine = (color: string, key: 'kinetic' | 'potential' | 'total', widthPx: number) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = widthPx;
      for (let i = 0; i < history.length; i++) {
        const x = getX(i);
        const y = getY(history[i][key]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    // Kinetic (Cyan #5FD5E8)
    drawLine('#5FD5E8', 'kinetic', 1.5);
    // Potential (Purple/Magenta #8797FF)
    drawLine('#8797FF', 'potential', 1.5);
    // Total (Pure White #E8EEF7 - Hamiltonian)
    drawLine('#E8EEF7', 'total', 2.0);

    // Y-Axis labels (Energy J)
    ctx.fillStyle = '#8E9BAD';
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.fillText(formatAxisLabel(maxVal), 2, padTop + 8);
    ctx.fillText('0', 2, getY(0));
    ctx.fillText(formatAxisLabel(minVal), 2, height - padBottom);

    // X-Axis label
    const curDays = Math.round(simulationTimeYears * 365.25);
    ctx.fillText('0', padLeft, height - 6);
    ctx.fillText(`${curDays} d`, width - padRight - 28, height - 6);
  }, [measurements.history, isExpanded, simulationTimeYears]);

  return (
    <div className="absolute bottom-4 left-4 z-30 pointer-events-none select-none font-sans">
      <div
        className={`pointer-events-auto bg-[#101722]/95 backdrop-blur-md border border-[#263447] rounded-xl transition-all duration-200 overflow-hidden shadow-2xl ${
          isExpanded ? 'w-84' : 'w-48'
        }`}
      >
        {/* Header Ribbon */}
        <div className="h-9 px-3 bg-[#141E2B]/80 border-b border-[#263447] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-[#E8EEF7]">
            <LineChart size={14} className="text-[#8797FF]" />
            <span>Analysis</span>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[#8E9BAD] hover:text-[#E8EEF7] p-1 rounded-md transition"
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>

        {isExpanded && (
          <div className="p-3 text-xs">
            {/* Tabs & Legend */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1 bg-[#141E2B] p-0.5 rounded-lg border border-[#263447]">
                {[
                  { id: 'energy', label: 'Energy' },
                  { id: 'distance', label: 'Distance' },
                  { id: 'orbit', label: 'Orbit' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as typeof activeTab)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                      activeTab === t.id
                        ? 'bg-[#8797FF]/20 text-[#8797FF] font-semibold'
                        : 'text-[#8E9BAD] hover:text-[#E8EEF7]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Chart Legend */}
              <div className="flex items-center gap-2 text-[10px] text-[#8E9BAD]">
                <span className="flex items-center gap-1 text-[#E8EEF7]">
                  <span className="w-2 h-0.5 bg-[#E8EEF7]" /> Total
                </span>
                <span className="flex items-center gap-1 text-[#5FD5E8]">
                  <span className="w-2 h-0.5 bg-[#5FD5E8]" /> Kinetic
                </span>
                <span className="flex items-center gap-1 text-[#8797FF]">
                  <span className="w-2 h-0.5 bg-[#8797FF]" /> Potential
                </span>
              </div>
            </div>

            {/* Canvas Plot */}
            <canvas
              ref={canvasRef}
              width={310}
              height={125}
              className="bg-[#080B12] rounded-lg border border-[#263447] w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
};

