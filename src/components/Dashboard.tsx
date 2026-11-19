import React, { useState, useRef, useEffect } from 'react';
import type { ScientificMeasurements, SimulationConfig } from '../physics/types';
import {
  Activity,
  LineChart,
  ShieldCheck,
  Cpu,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface DashboardProps {
  measurements: ScientificMeasurements;
  config: SimulationConfig;
  fps: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ measurements, config, fps }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'energy-chart' | 'momentum' | 'engine'>('overview');
  const chartCanvasRef = useRef<HTMLCanvasElement>(null);

  // Draw real-time Canvas telemetry chart for Energy
  useEffect(() => {
    if (activeTab !== 'energy-chart') return;
    const canvas = chartCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const history = measurements.history;
    if (history.length < 2) return;

    // Find min/max values for scaling
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

    const range = Math.max(1e-4, maxVal - minVal);
    const pad = 24;

    const getY = (val: number) => {
      const norm = (val - minVal) / range;
      return height - pad - norm * (height - pad * 2);
    };

    const getX = (idx: number) => {
      return pad + (idx / (history.length - 1)) * (width - pad * 2);
    };

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, pad);
    ctx.lineTo(pad, height - pad);
    ctx.lineTo(width - pad, height - pad);
    ctx.stroke();

    // Plot series helper
    const plotSeries = (color: string, key: 'kinetic' | 'potential' | 'total', lineWidth: number = 2) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      for (let i = 0; i < history.length; i++) {
        const x = getX(i);
        const y = getY(history[i][key]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    // Kinetic Energy (Cyan)
    plotSeries('#38bdf8', 'kinetic', 1.5);
    // Potential Energy (Pink/Magenta)
    plotSeries('#ec4899', 'potential', 1.5);
    // Total Mechanical Energy (Gold/Yellow)
    plotSeries('#facc15', 'total', 2.5);

    // Units label
    ctx.fillStyle = '#64748b';
    ctx.font = '10px monospace';
    ctx.fillText(`Max: ${maxVal.toExponential(2)}`, pad + 6, pad + 10);
    ctx.fillText(`Min: ${minVal.toExponential(2)}`, pad + 6, height - pad - 6);
  }, [measurements.history, activeTab]);

  const n = measurements.bodyCount;
  const pairwiseInteractions = (n * (n - 1)) / 2;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none flex justify-center">
      <div
        className={`pointer-events-auto bg-slate-950/90 backdrop-blur-md border-t border-cyan-500/30 shadow-2xl transition-all duration-300 w-full max-w-5xl rounded-t-2xl overflow-hidden ${
          isExpanded ? 'h-52' : 'h-10'
        }`}
      >
        {/* Ribbon Header */}
        <div className="h-10 px-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <Activity size={14} /> Scientific Analysis Laboratory
            </span>

            {/* Quick energy drift badge */}
            <span
              className={`px-2 py-0.5 rounded-full font-mono text-[10px] border ${
                Math.abs(measurements.energyDriftPercent) < 0.1
                  ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-950/80 border-amber-500/40 text-amber-300'
              }`}
            >
              Drift: {measurements.energyDriftPercent >= 0 ? '+' : ''}
              {measurements.energyDriftPercent.toFixed(3)}%
            </span>
          </div>

          {/* Tab buttons */}
          <div className="flex items-center gap-1 font-medium">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'energy-chart', label: 'Energy Graph', icon: LineChart },
              { id: 'momentum', label: 'Momentum & Conservation', icon: ShieldCheck },
              { id: 'engine', label: 'Engine Stats', icon: Cpu },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as typeof activeTab);
                    setIsExpanded(true);
                  }}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1 text-[11px] transition ${
                    activeTab === tab.id && isExpanded
                      ? 'bg-slate-800 text-cyan-300'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon size={12} />
                  <span>{tab.label}</span>
                </button>
              );
            })}

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition ml-2"
              title={isExpanded ? 'Collapse Scientific Panel' : 'Expand Scientific Panel'}
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
          </div>
        </div>

        {/* Tab Body */}
        {isExpanded && (
          <div className="h-[calc(100%-40px)] p-3 text-xs overflow-y-auto">
            {/* 1. OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-4 gap-2.5 font-mono text-center">
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
                  <span className="text-[10px] font-sans uppercase font-bold text-slate-400 block">
                    Kinetic Energy (K)
                  </span>
                  <div className="text-sm font-bold text-cyan-300 mt-1">
                    {measurements.kineticEnergy.toExponential(4)}
                  </div>
                  <span className="text-[9px] text-slate-500 font-sans">M☉·AU²/yr²</span>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
                  <span className="text-[10px] font-sans uppercase font-bold text-slate-400 block">
                    Potential Energy (U)
                  </span>
                  <div className="text-sm font-bold text-pink-400 mt-1">
                    {measurements.potentialEnergy.toExponential(4)}
                  </div>
                  <span className="text-[9px] text-slate-500 font-sans">M☉·AU²/yr²</span>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
                  <span className="text-[10px] font-sans uppercase font-bold text-slate-400 block">
                    Total Energy (H = K + U)
                  </span>
                  <div className="text-sm font-bold text-amber-300 mt-1">
                    {measurements.totalEnergy.toExponential(4)}
                  </div>
                  <span className="text-[9px] text-slate-500 font-sans">Hamiltonian Invariant</span>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
                  <span className="text-[10px] font-sans uppercase font-bold text-slate-400 block">
                    Angular Momentum (|L|)
                  </span>
                  <div className="text-sm font-bold text-purple-300 mt-1">
                    {measurements.totalAngularMomentum.toExponential(4)}
                  </div>
                  <span className="text-[9px] text-slate-500 font-sans">M☉·AU²/yr</span>
                </div>
              </div>
            )}

            {/* 2. ENERGY CHART */}
            {activeTab === 'energy-chart' && (
              <div className="h-full flex items-center gap-4">
                <canvas
                  ref={chartCanvasRef}
                  width={680}
                  height={140}
                  className="bg-slate-900/90 border border-slate-800 rounded-xl h-full flex-1"
                />
                <div className="w-56 shrink-0 bg-slate-900/70 border border-slate-800 rounded-xl p-2.5 space-y-1.5 text-[11px] font-mono">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-1 bg-yellow-400 rounded" />
                    <span className="text-yellow-300">Total Energy (H)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-1 bg-cyan-400 rounded" />
                    <span className="text-cyan-300">Kinetic Energy (K)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-1 bg-pink-400 rounded" />
                    <span className="text-pink-300">Potential Energy (U)</span>
                  </div>
                  <p className="text-[9px] text-slate-400 font-sans pt-1 border-t border-slate-800">
                    Velocity Verlet preserves phase space without orbital decay.
                  </p>
                </div>
              </div>
            )}

            {/* 3. MOMENTUM CONSERVATION */}
            {activeTab === 'momentum' && (
              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                  <span className="text-[10px] font-sans uppercase font-bold text-slate-400 block mb-1">
                    Linear Momentum Vector (P = Σ m*v)
                  </span>
                  <div className="space-y-0.5 text-slate-300 text-xs">
                    <div>Px: {measurements.linearMomentum.x.toExponential(3)} M☉·AU/yr</div>
                    <div>Py: {measurements.linearMomentum.y.toExponential(3)} M☉·AU/yr</div>
                    <div>Pz: {measurements.linearMomentum.z.toExponential(3)} M☉·AU/yr</div>
                  </div>
                  <div className="text-xs font-bold text-cyan-300 mt-2">
                    |P|: {measurements.totalLinearMomentum.toExponential(3)} M☉·AU/yr
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                  <span className="text-[10px] font-sans uppercase font-bold text-slate-400 block mb-1">
                    Angular Momentum Vector (L = Σ r x p)
                  </span>
                  <div className="space-y-0.5 text-slate-300 text-xs">
                    <div>Lx: {measurements.angularMomentum.x.toExponential(3)} M☉·AU²/yr</div>
                    <div>Ly: {measurements.angularMomentum.y.toExponential(3)} M☉·AU²/yr</div>
                    <div>Lz: {measurements.angularMomentum.z.toExponential(3)} M☉·AU²/yr</div>
                  </div>
                  <div className="text-xs font-bold text-purple-300 mt-2">
                    |L|: {measurements.totalAngularMomentum.toExponential(3)} M☉·AU²/yr
                  </div>
                </div>
              </div>
            )}

            {/* 4. ENGINE STATS */}
            {activeTab === 'engine' && (
              <div className="grid grid-cols-4 gap-2.5 font-mono text-center">
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
                  <span className="text-[10px] font-sans uppercase font-bold text-slate-400 block">
                    Active Bodies
                  </span>
                  <div className="text-sm font-bold text-slate-100 mt-1">{n}</div>
                  <span className="text-[9px] text-slate-500 font-sans">Point Masses</span>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
                  <span className="text-[10px] font-sans uppercase font-bold text-slate-400 block">
                    Direct Interactions
                  </span>
                  <div className="text-sm font-bold text-cyan-300 mt-1">
                    {pairwiseInteractions.toLocaleString()}
                  </div>
                  <span className="text-[9px] text-slate-500 font-sans">N(N-1)/2 Pairs</span>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
                  <span className="text-[10px] font-sans uppercase font-bold text-slate-400 block">
                    Integrator Algorithm
                  </span>
                  <div className="text-sm font-bold text-purple-300 mt-1 capitalize">
                    {config.integrator}
                  </div>
                  <span className="text-[9px] text-slate-500 font-sans">
                    {config.subSteps} Sub-steps ({fps} FPS)
                  </span>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
                  <span className="text-[10px] font-sans uppercase font-bold text-slate-400 block">
                    Collision Solver
                  </span>
                  <div className="text-sm font-bold text-amber-300 mt-1 capitalize">
                    {config.collisionModel}
                  </div>
                  <span className="text-[9px] text-slate-500 font-sans">Inelastic Merger</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
