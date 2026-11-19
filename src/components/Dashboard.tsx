import React, { useState, useRef, useEffect } from 'react';
import type { ScientificMeasurements, SimulationConfig, AppMode } from '../physics/types';
import type { ChaosDivergencePoint } from '../physics/chaos';
import {
  formatDynamicEnergy,
  formatDynamicMomentum,
  formatDynamicDistance,
  formatAxisLabel,
} from '../physics/units';
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

  // Render Energy History Multi-Series Chart (Pure Black & White with Off-white Lines & Zero 'e')
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
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText('COLLECTING CONSERVATION TELEMETRY...', 24, height / 2);
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
    const padX = 48;
    const padY = 18;

    const getY = (val: number) => {
      const norm = (val - minVal) / range;
      return height - padY - norm * (height - padY * 2);
    };

    const getX = (idx: number) => {
      return padX + (idx / (history.length - 1)) * (width - padX * 2);
    };

    // Off-white Grid
    ctx.strokeStyle = '#262626';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);

    for (let i = 1; i <= 3; i++) {
      const y = padY + (i / 4) * (height - padY * 2);
      ctx.beginPath();
      ctx.moveTo(padX, y);
      ctx.lineTo(width - padX, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Axes
    ctx.strokeStyle = '#404040';
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

    // Kinetic (Emerald Green)
    drawLine('#22c55e', 'kinetic', 1.5);
    // Potential (Crimson)
    drawLine('#ef4444', 'potential', 1.5);
    // Total (Pure White - Conserved Hamiltonian)
    drawLine('#ffffff', 'total', 2.0);

    // Coordinate text labels (Zero 'e')
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.fillText(formatAxisLabel(maxVal), 4, padY + 8);
    ctx.fillText(formatAxisLabel(minVal), 4, height - padY);
  }, [measurements.history, activeTab]);

  // Render Chaos Lyapunov Divergence Chart (Zero 'e')
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
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText('RUNNING TWIN PERTURBATION... WAITING FOR SIMULATION STEPS', 24, height / 2);
      return;
    }

    const padX = 52;
    const padY = 18;
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

    // Off-white Grid
    ctx.strokeStyle = '#262626';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);

    const logLabels: Record<number, string> = {
      [-6]: '150 km',
      [-4]: '15,000 km',
      [-2]: '1.5M km',
      [0]: '1.0 AU',
    };

    for (let log = -6; log <= 0; log += 2) {
      const y = getY(log);
      ctx.beginPath();
      ctx.moveTo(padX, y);
      ctx.lineTo(width - padX, y);
      ctx.stroke();

      ctx.fillStyle = '#71717a';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText(logLabels[log] || '', 4, y + 4);
    }
    ctx.setLineDash([]);

    // Plot Lyapunov divergence curve (Bright Gold)
    ctx.beginPath();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    for (let i = 0; i < chaosHistory.length; i++) {
      const x = getX(i);
      const y = getY(chaosHistory[i].logDivergence);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    const latest = chaosHistory[chaosHistory.length - 1];
    ctx.fillStyle = '#fef08a';
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.fillText(`Δr: ${formatDynamicDistance(latest.divergenceAU)}`, width - 170, padY + 14);
  }, [chaosHistory, activeTab]);

  const n = measurements.bodyCount;
  const pairwiseInteractions = (n * (n - 1)) / 2;
  const virialRatio = measurements.potentialEnergy !== 0
    ? (2 * measurements.kineticEnergy) / Math.abs(measurements.potentialEnergy)
    : 0;

  const kEnergy = formatDynamicEnergy(measurements.kineticEnergy);
  const uEnergy = formatDynamicEnergy(measurements.potentialEnergy);
  const hEnergy = formatDynamicEnergy(measurements.totalEnergy);

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none flex justify-center font-sans">
      <div
        className={`pointer-events-auto bg-black border-t border-neutral-800 transition-all duration-200 w-full max-w-5xl overflow-hidden select-none shadow-2xl ${
          isExpanded ? 'h-52' : 'h-10'
        }`}
      >
        {/* Instrument Control Ribbon */}
        <div className="h-10 px-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3.5">
            <span className="font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Activity size={14} className="text-white" /> SCIENTIFIC TELEMETRY
            </span>

            {/* Symplectic Energy Drift Indicator */}
            <span
              className={`px-2 py-0.5 border text-xs font-mono font-semibold ${
                Math.abs(measurements.energyDriftPercent) < 0.1
                  ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                  : 'bg-amber-950 border-amber-600 text-amber-300'
              }`}
            >
              DRIFT: {measurements.energyDriftPercent >= 0 ? '+' : ''}
              {measurements.energyDriftPercent.toFixed(4)}%
            </span>

            <span className="hidden md:inline text-xs text-neutral-400">
              VIRIAL (2K/|U|): <span className="text-white font-semibold">{virialRatio.toFixed(3)}</span> • PAIRS:{' '}
              <span className="text-white font-semibold">{pairwiseInteractions.toLocaleString()}</span> •{' '}
              <span className="text-emerald-400 font-semibold">{fps} FPS</span>
            </span>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 text-xs">
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
                  className={`px-3 py-1.5 flex items-center gap-1.5 border-t-2 transition font-medium ${
                    isActive && isExpanded
                      ? 'bg-neutral-900 text-white border-white font-bold'
                      : 'text-neutral-400 border-transparent hover:text-white hover:bg-neutral-900/50'
                  }`}
                >
                  <Icon size={12} />
                  <span>{tab.label}</span>
                </button>
              );
            })}

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-neutral-400 hover:text-white p-1 hover:bg-neutral-800 ml-2 border border-neutral-700 transition"
              title={isExpanded ? 'Collapse Panel' : 'Expand Panel'}
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
          </div>
        </div>

        {/* Tab Panel Body */}
        {isExpanded && (
          <div className="h-[calc(100%-40px)] p-3 text-xs overflow-y-auto">
            {/* 1. OVERVIEW: HAMILTONIAN DYNAMICS (Zero 'e' Notation) */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-4 gap-2.5 text-center">
                <div className="bg-neutral-950 border border-neutral-800 p-2.5">
                  <span className="text-xs uppercase text-neutral-400 block font-medium">Kinetic Energy (K = ½Σmv²)</span>
                  <div className="text-sm font-bold text-emerald-400 mt-1">
                    {kEnergy.value}
                  </div>
                  <span className="text-xs text-neutral-400 block">{kEnergy.unit}</span>
                  <span className="text-xs text-neutral-500 font-mono mt-0.5 block">{kEnergy.joulesLabel}</span>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 p-2.5">
                  <span className="text-xs uppercase text-neutral-400 block font-medium">Potential Energy (U = -GΣm₁m₂/r)</span>
                  <div className="text-sm font-bold text-rose-400 mt-1">
                    {uEnergy.value}
                  </div>
                  <span className="text-xs text-neutral-400 block">{uEnergy.unit}</span>
                  <span className="text-xs text-neutral-500 font-mono mt-0.5 block">{uEnergy.joulesLabel}</span>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 p-2.5">
                  <span className="text-xs uppercase text-neutral-400 block font-medium">Total Hamiltonian (H = K + U)</span>
                  <div className="text-sm font-bold text-white mt-1">
                    {hEnergy.value}
                  </div>
                  <span className="text-xs text-neutral-400 block">{hEnergy.unit}</span>
                  <span className="text-xs text-emerald-400 font-mono mt-0.5 block">Conserved Invariant</span>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 p-2.5">
                  <span className="text-xs uppercase text-neutral-400 block font-medium">Angular Momentum (|L| = |Σr×p|)</span>
                  <div className="text-sm font-bold text-amber-400 mt-1">
                    {formatDynamicMomentum(measurements.totalAngularMomentum, true)}
                  </div>
                  <span className="text-xs text-neutral-400 block">Total System L</span>
                  <span className="text-xs text-neutral-500 font-mono mt-0.5 block">Conserved Vector</span>
                </div>
              </div>
            )}

            {/* 2. ENERGY CHART */}
            {activeTab === 'energy-chart' && (
              <div className="h-full flex items-center gap-3.5">
                <canvas
                  ref={energyCanvasRef}
                  width={680}
                  height={125}
                  className="bg-neutral-950 border border-neutral-800 h-full flex-1"
                />
                <div className="w-60 shrink-0 bg-neutral-950 border border-neutral-800 p-2.5 space-y-1.5 text-xs">
                  <div className="text-neutral-300 uppercase font-bold border-b border-neutral-800 pb-1 mb-1">
                    CHANNELS (ZERO DRIFT)
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-white font-medium">
                      <span className="w-3 h-0.5 bg-white" /> H (Total Hamiltonian)
                    </span>
                    <span className="text-white font-mono">{hEnergy.value} {hEnergy.unit.split(' ')[0]}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-emerald-400 font-medium">
                      <span className="w-3 h-0.5 bg-emerald-400" /> K (Kinetic Energy)
                    </span>
                    <span className="text-emerald-400 font-mono">{kEnergy.value}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-rose-400 font-medium">
                      <span className="w-3 h-0.5 bg-rose-400" /> U (Potential Energy)
                    </span>
                    <span className="text-rose-400 font-mono">{uEnergy.value}</span>
                  </div>
                  <p className="text-xs text-neutral-400 pt-1.5 border-t border-neutral-800 leading-normal">
                    Symplectic Velocity Verlet preserves phase space volume without secular orbital decay.
                  </p>
                </div>
              </div>
            )}

            {/* 3. MOMENTUM CONSERVATION (Zero 'e' Notation) */}
            {activeTab === 'momentum' && (
              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-neutral-950 border border-neutral-800 p-2.5">
                  <span className="text-xs uppercase text-neutral-400 block mb-1 font-medium">
                    Linear Momentum (P = Σmv)
                  </span>
                  <div className="space-y-0.5 text-xs text-neutral-400 font-mono">
                    <div>Px: <span className="text-white">{formatDynamicMomentum(measurements.linearMomentum.x)}</span></div>
                    <div>Py: <span className="text-white">{formatDynamicMomentum(measurements.linearMomentum.y)}</span></div>
                    <div>Pz: <span className="text-white">{formatDynamicMomentum(measurements.linearMomentum.z)}</span></div>
                  </div>
                  <div className="text-xs text-white font-bold mt-1.5 pt-1.5 border-t border-neutral-800">
                    |P|: {formatDynamicMomentum(measurements.totalLinearMomentum)}
                  </div>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 p-2.5">
                  <span className="text-xs uppercase text-neutral-400 block mb-1 font-medium">
                    Angular Momentum (L = Σr×p)
                  </span>
                  <div className="space-y-0.5 text-xs text-neutral-400 font-mono">
                    <div>Lx: <span className="text-white">{formatDynamicMomentum(measurements.angularMomentum.x, true)}</span></div>
                    <div>Ly: <span className="text-white">{formatDynamicMomentum(measurements.angularMomentum.y, true)}</span></div>
                    <div>Lz: <span className="text-white">{formatDynamicMomentum(measurements.angularMomentum.z, true)}</span></div>
                  </div>
                  <div className="text-xs text-amber-400 font-bold mt-1.5 pt-1.5 border-t border-neutral-800">
                    |L|: {formatDynamicMomentum(measurements.totalAngularMomentum, true)}
                  </div>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 p-2.5">
                  <span className="text-xs uppercase text-neutral-400 block mb-1 font-medium">
                    Barycenter (R_cm = Σmr/M)
                  </span>
                  <div className="space-y-0.5 text-xs text-neutral-400 font-mono">
                    <div>X_cm: <span className="text-white">{measurements.barycenter.x.toFixed(4)} AU</span></div>
                    <div>Y_cm: <span className="text-white">{measurements.barycenter.y.toFixed(4)} AU</span></div>
                    <div>Z_cm: <span className="text-white">{measurements.barycenter.z.toFixed(4)} AU</span></div>
                  </div>
                  <div className="text-xs text-emerald-400 font-bold mt-1.5 pt-1.5 border-t border-neutral-800 font-sans">
                    System Center of Mass
                  </div>
                </div>
              </div>
            )}

            {/* 4. INTEGRATOR COMPARISON */}
            {activeTab === 'integrators' && (
              <div className="grid grid-cols-3 gap-2.5">
                <div className={`p-2.5 border ${config.integrator === 'verlet' ? 'bg-neutral-900 border-white' : 'bg-neutral-950 border-neutral-800'}`}>
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span>Velocity Verlet</span>
                    <span className="text-xs px-1.5 py-0.5 bg-white text-black font-semibold">ACTIVE SYMPLECTIC</span>
                  </div>
                  <div className="text-xs text-neutral-400 mt-1.5 space-y-1">
                    <div>• Order: 2nd Order Symplectic</div>
                    <div>• Evaluations: 1 force eval / step</div>
                    <div>• Energy: Exact phase-space conservation; no artificial secular orbital decay</div>
                  </div>
                </div>

                <div className={`p-2.5 border ${config.integrator === 'rk4' ? 'bg-neutral-900 border-white' : 'bg-neutral-950 border-neutral-800'}`}>
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span>Runge-Kutta 4 (RK4)</span>
                    <span className="text-xs px-1.5 py-0.5 bg-neutral-800 text-neutral-300">HIGH ORDER</span>
                  </div>
                  <div className="text-xs text-neutral-400 mt-1.5 space-y-1">
                    <div>• Order: 4th Order Classical</div>
                    <div>• Evaluations: 4 force evals / step (4x cost)</div>
                    <div>• Energy: High single-step accuracy, but non-symplectic (energy drifts over long epochs)</div>
                  </div>
                </div>

                <div className={`p-2.5 border ${config.integrator === 'euler' ? 'bg-neutral-900 border-rose-600' : 'bg-neutral-950 border-neutral-800'}`}>
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span>Explicit Euler</span>
                    <span className="text-xs px-1.5 py-0.5 bg-rose-950 text-rose-300 font-semibold">UNSTABLE</span>
                  </div>
                  <div className="text-xs text-neutral-400 mt-1.5 space-y-1">
                    <div>• Order: 1st Order Explicit</div>
                    <div>• Evaluations: 1 force eval / step</div>
                    <div>• Energy: Adds artificial energy every step; orbits spiral outward uncontrollably</div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. CHAOS & LYAPUNOV SENSITIVITY (Zero 'e' Notation) */}
            {activeTab === 'chaos' && chaosHistory.length > 0 && (
              <div className="h-full flex items-center gap-3.5">
                <canvas
                  ref={chaosCanvasRef}
                  width={680}
                  height={125}
                  className="bg-neutral-950 border border-neutral-800 h-full flex-1"
                />
                <div className="w-60 shrink-0 bg-neutral-950 border border-neutral-800 p-2.5 space-y-1.5 text-xs">
                  <div className="text-amber-400 uppercase font-bold border-b border-neutral-800 pb-1 mb-1">
                    LYAPUNOV DIVERGENCE
                  </div>
                  <p className="text-xs text-neutral-300 leading-snug">
                    Tracks distance between twin systems starting with microscopic velocity perturbation:
                  </p>
                  <div className="text-white font-bold font-mono text-sm">
                    Δr(t) ~ Δr(0) · e^(λt)
                  </div>
                  <p className="text-xs text-neutral-400 pt-1 border-t border-neutral-800">
                    Positive slope verifies physical deterministic chaos and sensitive dependence.
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
