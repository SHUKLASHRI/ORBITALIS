import React, { useState, useRef, useEffect } from 'react';
import type { ScientificMeasurements, SimulationConfig, AppMode } from '../physics/types';
import type { ChaosDivergencePoint } from '../physics/chaos';
import {
  Activity,
  LineChart,
  ShieldCheck,
  Cpu,
  Flame,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface DashboardProps {
  measurements: ScientificMeasurements;
  config: SimulationConfig;
  fps: number;
  appMode?: AppMode;
  chaosHistory?: ChaosDivergencePoint[];
}

export const Dashboard: React.FC<DashboardProps> = ({
  measurements,
  config,
  fps,
  chaosHistory = [],
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'energy-chart' | 'momentum' | 'integrators' | 'chaos'>('overview');
  const energyCanvasRef = useRef<HTMLCanvasElement>(null);
  const chaosCanvasRef = useRef<HTMLCanvasElement>(null);

  // Render Energy History Multi-Series Chart
  useEffect(() => {
    if (activeTab !== 'energy-chart') return;
    const canvas = energyCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const history = measurements.history;
    if (history.length < 2) {
      ctx.fillStyle = '#8b949e';
      ctx.font = '10px monospace';
      ctx.fillText('COLLECTING CONSERVATION TELEMETRY...', 20, height / 2);
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
    const padX = 36;
    const padY = 16;

    const getY = (val: number) => {
      const norm = (val - minVal) / range;
      return height - padY - norm * (height - padY * 2);
    };

    const getX = (idx: number) => {
      return padX + (idx / (history.length - 1)) * (width - padX * 2);
    };

    // Technical Grid
    ctx.strokeStyle = '#1b2230';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 4]);

    for (let i = 1; i <= 3; i++) {
      const y = padY + (i / 4) * (height - padY * 2);
      ctx.beginPath();
      ctx.moveTo(padX, y);
      ctx.lineTo(width - padX, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Axes
    ctx.strokeStyle = '#30363d';
    ctx.beginPath();
    ctx.moveTo(padX, padY);
    ctx.lineTo(padX, height - padY);
    ctx.lineTo(width - padX, height - padY);
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

    // Kinetic (Blue)
    drawLine('#388bfd', 'kinetic', 1.5);
    // Potential (Red)
    drawLine('#f85149', 'potential', 1.5);
    // Total (Green - Hamiltonian)
    drawLine('#3fb950', 'total', 2.0);

    // Coordinate text labels
    ctx.fillStyle = '#8b949e';
    ctx.font = '9px monospace';
    ctx.fillText(`${maxVal.toExponential(2)}`, 2, padY + 8);
    ctx.fillText(`${minVal.toExponential(2)}`, 2, height - padY);
  }, [measurements.history, activeTab]);

  // Render Chaos Lyapunov Divergence Chart
  useEffect(() => {
    if (activeTab !== 'chaos') return;
    const canvas = chaosCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    if (chaosHistory.length < 2) {
      ctx.fillStyle = '#8b949e';
      ctx.font = '10px monospace';
      ctx.fillText('RUNNING TWIN PERTURBATION (10⁻⁶)... WAITING FOR STEPS', 20, height / 2);
      return;
    }

    const padX = 40;
    const padY = 16;
    // log divergence scale from -6 (initial) to 1 (macro-divergence 10 AU)
    const minLog = -6;
    const maxLog = 1;
    const range = maxLog - minLog;

    const getY = (logVal: number) => {
      const clamped = Math.max(minLog, Math.min(maxLog, logVal));
      const norm = (clamped - minLog) / range;
      return height - padY - norm * (height - padY * 2);
    };

    const getX = (idx: number) => {
      return padX + (idx / (chaosHistory.length - 1)) * (width - padX * 2);
    };

    // Grid
    ctx.strokeStyle = '#1b2230';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 4]);
    for (let log = -5; log <= 0; log++) {
      const y = getY(log);
      ctx.beginPath();
      ctx.moveTo(padX, y);
      ctx.lineTo(width - padX, y);
      ctx.stroke();

      ctx.fillStyle = '#484f58';
      ctx.font = '8px monospace';
      ctx.fillText(`10^${log}`, 6, y + 3);
    }
    ctx.setLineDash([]);

    // Plot Lyapunov divergence curve (Orange)
    ctx.beginPath();
    ctx.strokeStyle = '#d29922';
    ctx.lineWidth = 2;
    for (let i = 0; i < chaosHistory.length; i++) {
      const x = getX(i);
      const y = getY(chaosHistory[i].logDivergence);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    const latest = chaosHistory[chaosHistory.length - 1];
    ctx.fillStyle = '#e3b341';
    ctx.font = '9px monospace';
    ctx.fillText(`Δr: ${latest.divergenceAU.toExponential(3)} AU`, width - 150, padY + 12);
  }, [chaosHistory, activeTab]);

  const n = measurements.bodyCount;
  const pairwiseInteractions = (n * (n - 1)) / 2;
  const virialRatio = measurements.potentialEnergy !== 0
    ? (2 * measurements.kineticEnergy) / Math.abs(measurements.potentialEnergy)
    : 0;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none flex justify-center">
      <div
        className={`pointer-events-auto bg-[#090d16] border-t border-[#1b2230] transition-all duration-200 w-full max-w-5xl overflow-hidden select-none font-mono ${
          isExpanded ? 'h-48' : 'h-8'
        }`}
      >
        {/* Instrument Control Ribbon */}
        <div className="h-8 px-3 bg-[#0d111a] border-b border-[#1b2230] flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold uppercase tracking-wider text-[#f0f6fc] flex items-center gap-1.5 text-[11px]">
              <Activity size={13} className="text-[#388bfd]" /> SCIENTIFIC TELEMETRY
            </span>

            {/* Symplectic Energy Drift Indicator */}
            <span
              className={`px-1.5 py-0.2 border text-[10px] ${
                Math.abs(measurements.energyDriftPercent) < 0.1
                  ? 'bg-[#122619] border-[#238636] text-[#3fb950]'
                  : 'bg-[#2b1f13] border-[#9e6a03] text-[#d29922]'
              }`}
            >
              DRIFT: {measurements.energyDriftPercent >= 0 ? '+' : ''}
              {measurements.energyDriftPercent.toFixed(4)}%
            </span>

            <span className="hidden md:inline text-[10px] text-[#8b949e]">
              VIRIAL (2K/|U|): <span className="text-[#f0f6fc]">{virialRatio.toFixed(3)}</span> • PAIRS: <span className="text-[#58a6ff]">{pairwiseInteractions.toLocaleString()}</span> • <span className="text-[#3fb950]">{fps} FPS</span>
            </span>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-0.5 text-[11px]">
            {[
              { id: 'overview', label: 'HAMILTONIAN', icon: Activity },
              { id: 'energy-chart', label: 'ENERGY PLOT', icon: LineChart },
              { id: 'momentum', label: 'MOMENTUM & L', icon: ShieldCheck },
              { id: 'integrators', label: 'INTEGRATOR SPECS', icon: Cpu },
              ...(chaosHistory.length > 0 ? [{ id: 'chaos', label: 'LYAPUNOV CHAOS', icon: Flame }] : []),
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as typeof activeTab);
                    setIsExpanded(true);
                  }}
                  className={`px-2.5 py-1 flex items-center gap-1 border-t-2 transition ${
                    isActive && isExpanded
                      ? 'bg-[#161b22] text-[#58a6ff] border-[#388bfd] font-bold'
                      : 'text-[#8b949e] border-transparent hover:text-[#f0f6fc] hover:bg-[#161b22]'
                  }`}
                >
                  <Icon size={11} />
                  <span>{tab.label}</span>
                </button>
              );
            })}

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[#8b949e] hover:text-[#f0f6fc] p-1 hover:bg-[#161b22] ml-2 border border-[#21262d] transition"
              title={isExpanded ? 'Collapse Scientific HUD' : 'Expand Scientific HUD'}
            >
              {isExpanded ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
            </button>
          </div>
        </div>

        {/* Tab Panel Body */}
        {isExpanded && (
          <div className="h-[calc(100%-32px)] p-2.5 text-xs overflow-y-auto">
            {/* 1. OVERVIEW: HAMILTONIAN DYNAMICS */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-[#0d111a] border border-[#1b2230] p-2">
                  <span className="text-[9px] uppercase text-[#8b949e] block">Kinetic Energy (K = ½Σmv²)</span>
                  <div className="text-xs font-bold text-[#58a6ff] mt-0.5">
                    {measurements.kineticEnergy.toExponential(4)}
                  </div>
                  <span className="text-[9px] text-[#484f58]">M☉·AU²/yr²</span>
                </div>

                <div className="bg-[#0d111a] border border-[#1b2230] p-2">
                  <span className="text-[9px] uppercase text-[#8b949e] block">Potential Energy (U = -GΣm₁m₂/r)</span>
                  <div className="text-xs font-bold text-[#f85149] mt-0.5">
                    {measurements.potentialEnergy.toExponential(4)}
                  </div>
                  <span className="text-[9px] text-[#484f58]">M☉·AU²/yr²</span>
                </div>

                <div className="bg-[#0d111a] border border-[#1b2230] p-2">
                  <span className="text-[9px] uppercase text-[#8b949e] block">Total Hamiltonian (H = K + U)</span>
                  <div className="text-xs font-bold text-[#3fb950] mt-0.5">
                    {measurements.totalEnergy.toExponential(4)}
                  </div>
                  <span className="text-[9px] text-[#484f58]">Conserved Invariant</span>
                </div>

                <div className="bg-[#0d111a] border border-[#1b2230] p-2">
                  <span className="text-[9px] uppercase text-[#8b949e] block">Angular Momentum (|L| = |Σr×p|)</span>
                  <div className="text-xs font-bold text-[#d29922] mt-0.5">
                    {measurements.totalAngularMomentum.toExponential(4)}
                  </div>
                  <span className="text-[9px] text-[#484f58]">M☉·AU²/yr</span>
                </div>
              </div>
            )}

            {/* 2. ENERGY CHART */}
            {activeTab === 'energy-chart' && (
              <div className="h-full flex items-center gap-3">
                <canvas
                  ref={energyCanvasRef}
                  width={680}
                  height={115}
                  className="bg-[#0d111a] border border-[#1b2230] h-full flex-1"
                />
                <div className="w-56 shrink-0 bg-[#0d111a] border border-[#1b2230] p-2 space-y-1 text-[10px]">
                  <div className="text-[#8b949e] uppercase font-bold border-b border-[#1b2230] pb-1 mb-1">
                    TIME-SERIES CHANNELS
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#3fb950]">
                      <span className="w-2.5 h-0.5 bg-[#3fb950]" /> H (Total)
                    </span>
                    <span className="text-[#c9d1d9]">{measurements.totalEnergy.toExponential(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#388bfd]">
                      <span className="w-2.5 h-0.5 bg-[#388bfd]" /> K (Kinetic)
                    </span>
                    <span className="text-[#c9d1d9]">{measurements.kineticEnergy.toExponential(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#f85149]">
                      <span className="w-2.5 h-0.5 bg-[#f85149]" /> U (Potential)
                    </span>
                    <span className="text-[#c9d1d9]">{measurements.potentialEnergy.toExponential(2)}</span>
                  </div>
                  <p className="text-[8px] text-[#484f58] pt-1 border-t border-[#1b2230] leading-tight">
                    Symplectic Velocity Verlet preserves phase space volume without secular orbital decay.
                  </p>
                </div>
              </div>
            )}

            {/* 3. MOMENTUM CONSERVATION */}
            {activeTab === 'momentum' && (
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#0d111a] border border-[#1b2230] p-2">
                  <span className="text-[9px] uppercase text-[#8b949e] block mb-1">Linear Momentum (P = Σmv)</span>
                  <div className="space-y-0.5 text-[10px] text-[#8b949e]">
                    <div>Px: <span className="text-[#f0f6fc]">{measurements.linearMomentum.x.toExponential(3)}</span></div>
                    <div>Py: <span className="text-[#f0f6fc]">{measurements.linearMomentum.y.toExponential(3)}</span></div>
                    <div>Pz: <span className="text-[#f0f6fc]">{measurements.linearMomentum.z.toExponential(3)}</span></div>
                  </div>
                  <div className="text-[10px] text-[#58a6ff] font-bold mt-1 pt-1 border-t border-[#1b2230]">
                    |P|: {measurements.totalLinearMomentum.toExponential(3)} M☉·AU/yr
                  </div>
                </div>

                <div className="bg-[#0d111a] border border-[#1b2230] p-2">
                  <span className="text-[9px] uppercase text-[#8b949e] block mb-1">Angular Momentum (L = Σr×p)</span>
                  <div className="space-y-0.5 text-[10px] text-[#8b949e]">
                    <div>Lx: <span className="text-[#f0f6fc]">{measurements.angularMomentum.x.toExponential(3)}</span></div>
                    <div>Ly: <span className="text-[#f0f6fc]">{measurements.angularMomentum.y.toExponential(3)}</span></div>
                    <div>Lz: <span className="text-[#f0f6fc]">{measurements.angularMomentum.z.toExponential(3)}</span></div>
                  </div>
                  <div className="text-[10px] text-[#d29922] font-bold mt-1 pt-1 border-t border-[#1b2230]">
                    |L|: {measurements.totalAngularMomentum.toExponential(3)} M☉·AU²/yr
                  </div>
                </div>

                <div className="bg-[#0d111a] border border-[#1b2230] p-2">
                  <span className="text-[9px] uppercase text-[#8b949e] block mb-1">Barycenter (R_cm = Σmr/M)</span>
                  <div className="space-y-0.5 text-[10px] text-[#8b949e]">
                    <div>X_cm: <span className="text-[#f0f6fc]">{measurements.barycenter.x.toFixed(4)} AU</span></div>
                    <div>Y_cm: <span className="text-[#f0f6fc]">{measurements.barycenter.y.toFixed(4)} AU</span></div>
                    <div>Z_cm: <span className="text-[#f0f6fc]">{measurements.barycenter.z.toFixed(4)} AU</span></div>
                  </div>
                  <div className="text-[10px] text-[#3fb950] font-bold mt-1 pt-1 border-t border-[#1b2230]">
                    System Center of Mass
                  </div>
                </div>
              </div>
            )}

            {/* 4. INTEGRATOR COMPARISON */}
            {activeTab === 'integrators' && (
              <div className="grid grid-cols-3 gap-2">
                <div className={`p-2 border ${config.integrator === 'verlet' ? 'bg-[#161b22] border-[#388bfd]' : 'bg-[#0d111a] border-[#1b2230]'}`}>
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#f0f6fc]">
                    <span>Velocity Verlet</span>
                    <span className="text-[9px] px-1 bg-[#1f2937] text-[#58a6ff]">RECOMMENDED</span>
                  </div>
                  <div className="text-[9px] text-[#8b949e] mt-1 space-y-0.5">
                    <div>• Order: 2nd Order Symplectic</div>
                    <div>• Evaluations: 1 force eval / step</div>
                    <div>• Energy: Exact phase-space conservation; no artificial secular orbital decay</div>
                  </div>
                </div>

                <div className={`p-2 border ${config.integrator === 'rk4' ? 'bg-[#161b22] border-[#388bfd]' : 'bg-[#0d111a] border-[#1b2230]'}`}>
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#f0f6fc]">
                    <span>Runge-Kutta 4 (RK4)</span>
                    <span className="text-[9px] px-1 bg-[#1f2937] text-[#8b949e]">HIGH ORDER</span>
                  </div>
                  <div className="text-[9px] text-[#8b949e] mt-1 space-y-0.5">
                    <div>• Order: 4th Order Classical</div>
                    <div>• Evaluations: 4 force evals / step (4x cost)</div>
                    <div>• Energy: High single-step accuracy, but non-symplectic (energy drifts over long epochs)</div>
                  </div>
                </div>

                <div className={`p-2 border ${config.integrator === 'euler' ? 'bg-[#161b22] border-[#f85149]' : 'bg-[#0d111a] border-[#1b2230]'}`}>
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#f0f6fc]">
                    <span>Explicit Euler</span>
                    <span className="text-[9px] px-1 bg-[#2b1f13] text-[#f85149]">UNSTABLE</span>
                  </div>
                  <div className="text-[9px] text-[#8b949e] mt-1 space-y-0.5">
                    <div>• Order: 1st Order Explicit</div>
                    <div>• Evaluations: 1 force eval / step</div>
                    <div>• Energy: Adds artificial energy every step; orbits spiral outward uncontrollably</div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. CHAOS & LYAPUNOV SENSITIVITY */}
            {activeTab === 'chaos' && chaosHistory.length > 0 && (
              <div className="h-full flex items-center gap-3">
                <canvas
                  ref={chaosCanvasRef}
                  width={680}
                  height={115}
                  className="bg-[#0d111a] border border-[#1b2230] h-full flex-1"
                />
                <div className="w-56 shrink-0 bg-[#0d111a] border border-[#1b2230] p-2 space-y-1 text-[10px]">
                  <div className="text-[#d29922] uppercase font-bold border-b border-[#1b2230] pb-1 mb-1">
                    LYAPUNOV DIVERGENCE
                  </div>
                  <p className="text-[9px] text-[#8b949e] leading-snug">
                    Tracks distance between twin systems starting with a 10⁻⁶ velocity perturbation:
                  </p>
                  <div className="text-[#f0f6fc] font-bold">
                    Δr(t) ~ Δr(0) · e^(λt)
                  </div>
                  <p className="text-[8px] text-[#484f58] pt-1 border-t border-[#1b2230]">
                    Positive slope on this logarithmic scale proves physical deterministic chaos.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
