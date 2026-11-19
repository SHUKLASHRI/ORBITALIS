import React from 'react';
import type { SimulationConfig, IntegratorType, AppMode } from '../physics/types';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Compass,
  Layers,
  Crosshair,
  Image,
  Sliders,
  FlaskConical,
  Eye,
} from 'lucide-react';

interface HeaderProps {
  config: SimulationConfig;
  onUpdateConfig: (updated: Partial<SimulationConfig>) => void;
  onStepFrame: () => void;
  onReset: () => void;
  simulationTimeYears: number;
  fps: number;
  presetName: string;
  appMode: AppMode;
  onSetAppMode: (mode: AppMode) => void;
  bodyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  onUpdateConfig,
  onStepFrame,
  onReset,
  simulationTimeYears,
  fps,
  presetName,
  appMode,
  onSetAppMode,
  bodyCount,
}) => {
  const days = Math.round(simulationTimeYears * 365.25);
  const years = simulationTimeYears.toFixed(3);

  return (
    <header className="absolute top-0 left-0 right-0 z-40 h-11 bg-[#090d16] border-b border-[#1b2230] px-3 flex items-center justify-between text-xs select-none">
      {/* Left: Brand Identity & Telemetry Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 pr-3 border-r border-[#1b2230]">
          <span className="font-mono font-bold tracking-widest text-[#f0f6fc] text-xs">ORBITALIS</span>
          <span className="px-1.5 py-0.2 bg-[#161b22] text-[#388bfd] border border-[#30363d] rounded-none font-mono text-[9px] uppercase tracking-wider">
            v1.0-NEC
          </span>
        </div>

        {/* Telemetry Status Line */}
        <div className="hidden lg:flex items-center gap-3 font-mono text-[11px] text-[#8b949e]">
          <div>
            STATUS: <span className="text-[#3fb950] font-bold">NOMINAL</span>
          </div>
          <div>
            EXPERIMENT: <span className="text-[#f0f6fc]">{presetName}</span>
          </div>
          <div>
            BODIES: <span className="text-[#58a6ff]">{bodyCount}</span>
          </div>
          <div>
            T: <span className="text-[#f0f6fc]">{years} yr</span> <span className="text-[#484f58]">({days} d)</span>
          </div>
        </div>
      </div>

      {/* Center: Mode Switcher Tabs */}
      <div className="flex items-center bg-[#0d1117] border border-[#21262d] rounded-none p-0.5 text-[11px]">
        {[
          { id: 'explorer', label: '01. Explorer', icon: Eye },
          { id: 'laboratory', label: '02. Laboratory', icon: Sliders },
          { id: 'research', label: '03. Research', icon: FlaskConical },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = appMode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSetAppMode(tab.id as AppMode)}
              className={`px-3 py-1 flex items-center gap-1.5 font-mono text-[11px] transition rounded-none ${
                isActive
                  ? 'bg-[#1f2937] text-[#f0f6fc] font-bold border border-[#388bfd]'
                  : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#161b22]'
              }`}
            >
              <Icon size={11} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right: Engine Playback Controls & Settings */}
      <div className="flex items-center gap-2">
        {/* Play/Pause/Step Buttons */}
        <div className="flex items-center bg-[#0d1117] border border-[#21262d] rounded-none">
          <button
            onClick={() => onUpdateConfig({ isPaused: !config.isPaused })}
            className={`px-2.5 py-1 text-[11px] font-mono flex items-center gap-1 transition ${
              config.isPaused
                ? 'bg-[#d29922] text-[#0d1117] font-bold'
                : 'bg-[#238636] text-[#ffffff] font-bold'
            }`}
            title={config.isPaused ? 'Resume Simulation (Space)' : 'Pause Simulation (Space)'}
          >
            {config.isPaused ? <Play size={11} fill="currentColor" /> : <Pause size={11} fill="currentColor" />}
            <span>{config.isPaused ? 'RESUME' : 'PAUSE'}</span>
          </button>

          <button
            onClick={onStepFrame}
            disabled={!config.isPaused}
            className="p-1.5 text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#161b22] disabled:opacity-30 border-l border-[#21262d] transition"
            title="Step 1 Numerical Frame"
          >
            <SkipForward size={12} />
          </button>

          <button
            onClick={onReset}
            className="p-1.5 text-[#8b949e] hover:text-[#58a6ff] hover:bg-[#161b22] border-l border-[#21262d] transition"
            title="Reset Experiment"
          >
            <RotateCcw size={12} />
          </button>
        </div>

        {/* Speed Slider */}
        <div className="hidden sm:flex items-center gap-1.5 bg-[#0d1117] border border-[#21262d] px-2 py-0.5 font-mono text-[10px]">
          <span className="text-[#8b949e]">SPEED:</span>
          <span className="text-[#58a6ff] font-bold w-9 text-right">
            {config.timeMultiplier.toFixed(1)}x
          </span>
          <input
            type="range"
            min="0.1"
            max="4.0"
            step="0.1"
            value={config.timeMultiplier}
            onChange={(e) => onUpdateConfig({ timeMultiplier: parseFloat(e.target.value) })}
            className="w-14 accent-[#388bfd] h-1 bg-[#21262d] rounded-none cursor-pointer"
          />
        </div>

        {/* Integrator Indicator/Selector */}
        <select
          value={config.integrator}
          onChange={(e) => onUpdateConfig({ integrator: e.target.value as IntegratorType })}
          className="bg-[#0d1117] border border-[#21262d] text-[#c9d1d9] font-mono text-[10px] px-2 py-1 rounded-none focus:outline-none cursor-pointer"
        >
          <option value="verlet">Velocity Verlet (Symplectic)</option>
          <option value="rk4">Runge-Kutta 4 (RK4)</option>
          <option value="euler">Euler (Comparison)</option>
        </select>

        {/* Viewport Layers Toggle Buttons */}
        <div className="flex items-center gap-0.5 bg-[#0d1117] border border-[#21262d] p-0.5">
          <button
            onClick={() => onUpdateConfig({ showGrid: !config.showGrid })}
            className={`p-1 border transition ${
              config.showGrid
                ? 'bg-[#1f2937] text-[#58a6ff] border-[#388bfd]'
                : 'text-[#8b949e] border-transparent hover:text-[#f0f6fc]'
            }`}
            title="Ecliptic Reference Grid"
          >
            <Compass size={13} />
          </button>

          <button
            onClick={() => onUpdateConfig({ showTrails: !config.showTrails })}
            className={`p-1 border transition ${
              config.showTrails
                ? 'bg-[#1f2937] text-[#58a6ff] border-[#388bfd]'
                : 'text-[#8b949e] border-transparent hover:text-[#f0f6fc]'
            }`}
            title="Orbital Trajectory Trails"
          >
            <Layers size={13} />
          </button>

          <button
            onClick={() => onUpdateConfig({ showBarycenter: !config.showBarycenter })}
            className={`p-1 border transition ${
              config.showBarycenter
                ? 'bg-[#1f2937] text-[#d29922] border-[#d29922]'
                : 'text-[#8b949e] border-transparent hover:text-[#f0f6fc]'
            }`}
            title="System Center of Mass (Barycentre)"
          >
            <Crosshair size={13} />
          </button>

          <button
            onClick={() => onUpdateConfig({ useRealisticTextures: !config.useRealisticTextures })}
            className={`p-1 border transition ${
              config.useRealisticTextures
                ? 'bg-[#1f2937] text-[#3fb950] border-[#238636]'
                : 'text-[#8b949e] border-transparent hover:text-[#f0f6fc]'
            }`}
            title="Photorealistic Web CDN Textures"
          >
            <Image size={13} />
          </button>
        </div>

        {/* FPS badge */}
        <div className="px-2 py-0.5 bg-[#0d1117] border border-[#21262d] text-[10px] font-mono text-[#3fb950]">
          {fps} FPS
        </div>
      </div>
    </header>
  );
};
