import React from 'react';
import type { SimulationConfig, IntegratorType } from '../physics/types';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Sparkles,
  Compass,
  Layers,
  Crosshair,
  Activity,
} from 'lucide-react';

interface HeaderProps {
  config: SimulationConfig;
  onUpdateConfig: (updated: Partial<SimulationConfig>) => void;
  onStepFrame: () => void;
  onReset: () => void;
  simulationTimeYears: number;
  fps: number;
  presetName: string;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  onUpdateConfig,
  onStepFrame,
  onReset,
  simulationTimeYears,
  fps,
  presetName,
}) => {
  const days = Math.round(simulationTimeYears * 365.25);
  const years = simulationTimeYears.toFixed(2);

  return (
    <header className="absolute top-0 left-0 right-0 z-40 h-14 bg-slate-950/85 backdrop-blur-md border-b border-cyan-500/30 px-4 flex items-center justify-between shadow-2xl shadow-cyan-950/50">
      {/* Brand & Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/40">
          <Sparkles size={16} className="text-cyan-400 animate-pulse" />
          <span className="font-extrabold tracking-widest text-sm text-cyan-200">ORBITALIS</span>
        </div>
        <div className="hidden lg:block">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block leading-tight">
            N-Body Gravitational Dynamics Simulator
          </span>
          <span className="text-[9px] text-cyan-400 font-mono">
            {presetName} · 3D OBSERVATORY
          </span>
        </div>
      </div>

      {/* Middle: Simulation Clock & Integrator Selector */}
      <div className="flex items-center gap-3">
        {/* Elapsed Time Readout */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1 font-mono text-xs">
          <span className="text-slate-400 text-[10px] uppercase">Time:</span>
          <span className="font-bold text-cyan-300">{years} yr</span>
          <span className="text-slate-500 text-[10px]">({days} d)</span>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-xl p-1">
          <button
            onClick={() => onUpdateConfig({ isPaused: !config.isPaused })}
            className={`p-1.5 rounded-lg transition ${
              config.isPaused
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
            }`}
            title={config.isPaused ? 'Resume (Space)' : 'Pause (Space)'}
          >
            {config.isPaused ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />}
          </button>

          <button
            onClick={onStepFrame}
            disabled={!config.isPaused}
            className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded-lg transition"
            title="Step 1 Frame"
          >
            <SkipForward size={14} />
          </button>

          <button
            onClick={onReset}
            className="p-1.5 text-slate-400 hover:text-cyan-300 rounded-lg transition"
            title="Reset Simulation"
          >
            <RotateCcw size={14} />
          </button>
        </div>

        {/* Time Multiplier Warp Slider */}
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-1">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Speed:</span>
          <span className="font-mono text-xs text-cyan-300 w-11 text-right">
            {config.timeMultiplier.toFixed(1)}x
          </span>
          <input
            type="range"
            min="0.1"
            max="5.0"
            step="0.1"
            value={config.timeMultiplier}
            onChange={(e) => onUpdateConfig({ timeMultiplier: parseFloat(e.target.value) })}
            className="w-16 accent-cyan-400 h-1 bg-slate-800 rounded cursor-pointer"
          />
        </div>

        {/* Integrator Selector */}
        <div className="hidden md:flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-xl p-1 text-[11px]">
          {(['verlet', 'rk4', 'euler'] as IntegratorType[]).map((alg) => (
            <button
              key={alg}
              onClick={() => onUpdateConfig({ integrator: alg })}
              className={`px-2 py-0.5 rounded-lg font-mono capitalize transition ${
                config.integrator === alg
                  ? 'bg-purple-600 text-white font-bold shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {alg}
            </button>
          ))}
        </div>
      </div>

      {/* Right: Telemetry pill & Overlays */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
          <Activity size={12} className="text-emerald-400" />
          <span className="text-emerald-300 font-bold">{fps} FPS</span>
        </div>

        <button
          onClick={() => onUpdateConfig({ showGrid: !config.showGrid })}
          className={`p-2 rounded-xl border transition ${
            config.showGrid
              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
              : 'border-slate-800 text-slate-400 hover:bg-slate-800'
          }`}
          title="Toggle Ecliptic Grid"
        >
          <Compass size={15} />
        </button>

        <button
          onClick={() => onUpdateConfig({ showTrails: !config.showTrails })}
          className={`p-2 rounded-xl border transition ${
            config.showTrails
              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
              : 'border-slate-800 text-slate-400 hover:bg-slate-800'
          }`}
          title="Toggle Orbital Trails"
        >
          <Layers size={15} />
        </button>

        <button
          onClick={() => onUpdateConfig({ showBarycenter: !config.showBarycenter })}
          className={`p-2 rounded-xl border transition ${
            config.showBarycenter
              ? 'bg-amber-500/20 border-amber-400 text-amber-300'
              : 'border-slate-800 text-slate-400 hover:bg-slate-800'
          }`}
          title="Toggle System Barycenter Marker"
        >
          <Crosshair size={15} />
        </button>
      </div>
    </header>
  );
};

