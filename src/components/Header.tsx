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
    <header className="absolute top-0 left-0 right-0 z-40 h-12 bg-black border-b border-neutral-800 px-3.5 flex items-center justify-between text-xs select-none font-sans">
      {/* Left: Brand & Telemetry Status */}
      <div className="flex items-center gap-3.5">
        <div className="flex items-center gap-2.5 pr-3.5 border-r border-neutral-800">
          <span className="font-bold tracking-widest text-white text-sm">ORBITALIS</span>
          <span className="px-1.5 py-0.5 bg-neutral-900 text-white border border-neutral-700 font-mono text-xs uppercase tracking-wider">
            NEC-ASTRO
          </span>
        </div>

        {/* Telemetry Status Line (Monochrome & Off-white) */}
        <div className="hidden lg:flex items-center gap-4 text-xs text-neutral-400">
          <div>
            STATUS: <span className="text-emerald-400 font-bold">NOMINAL</span>
          </div>
          <div>
            SYSTEM: <span className="text-white font-medium">{presetName}</span>
          </div>
          <div>
            BODIES: <span className="text-white font-semibold">{bodyCount}</span>
          </div>
          <div>
            TIME: <span className="text-white font-semibold">{years} yr</span>{' '}
            <span className="text-neutral-500">({days.toLocaleString()} d)</span>
          </div>
        </div>
      </div>

      {/* Center: Mode Switcher Tabs (Pure Black & White) */}
      <div className="flex items-center bg-neutral-950 border border-neutral-800 p-0.5 text-xs">
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
              className={`px-3.5 py-1.5 flex items-center gap-1.5 font-medium transition ${
                isActive
                  ? 'bg-white text-black font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Icon size={13} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right: Engine Playback Controls & Settings */}
      <div className="flex items-center gap-2.5">
        {/* Play/Pause/Step Buttons */}
        <div className="flex items-center bg-neutral-950 border border-neutral-800">
          <button
            onClick={() => onUpdateConfig({ isPaused: !config.isPaused })}
            className={`px-3 py-1.5 text-xs flex items-center gap-1.5 transition ${
              config.isPaused
                ? 'bg-amber-600 text-white font-bold'
                : 'bg-white text-black font-bold hover:bg-neutral-200'
            }`}
            title={config.isPaused ? 'Resume Simulation (Space)' : 'Pause Simulation (Space)'}
          >
            {config.isPaused ? <Play size={12} fill="currentColor" /> : <Pause size={12} fill="currentColor" />}
            <span>{config.isPaused ? 'RESUME' : 'PAUSE'}</span>
          </button>

          <button
            onClick={onStepFrame}
            disabled={!config.isPaused}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-900 disabled:opacity-30 border-l border-neutral-800 transition"
            title="Step 1 Frame"
          >
            <SkipForward size={14} />
          </button>

          <button
            onClick={onReset}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-900 border-l border-neutral-800 transition"
            title="Reset Experiment"
          >
            <RotateCcw size={14} />
          </button>
        </div>

        {/* Speed Slider */}
        <div className="hidden sm:flex items-center gap-2 bg-neutral-950 border border-neutral-800 px-2.5 py-1 text-xs">
          <span className="text-neutral-400 font-medium">SPEED:</span>
          <span className="text-white font-bold w-9 text-right font-mono">
            {config.timeMultiplier.toFixed(1)}x
          </span>
          <input
            type="range"
            min="0.1"
            max="4.0"
            step="0.1"
            value={config.timeMultiplier}
            onChange={(e) => onUpdateConfig({ timeMultiplier: parseFloat(e.target.value) })}
            className="w-16 accent-white h-1.5 bg-neutral-800 cursor-pointer"
          />
        </div>

        {/* Integrator Indicator/Selector */}
        <select
          value={config.integrator}
          onChange={(e) => onUpdateConfig({ integrator: e.target.value as IntegratorType })}
          className="bg-neutral-950 border border-neutral-800 text-white text-xs px-2.5 py-1.5 focus:outline-none cursor-pointer"
        >
          <option value="verlet">Velocity Verlet (Symplectic)</option>
          <option value="rk4">Runge-Kutta 4 (RK4)</option>
          <option value="euler">Euler (Comparison)</option>
        </select>

        {/* Viewport Layers Toggle Buttons */}
        <div className="flex items-center gap-0.5 bg-neutral-950 border border-neutral-800 p-0.5">
          <button
            onClick={() => onUpdateConfig({ showGrid: !config.showGrid })}
            className={`p-1.5 border transition ${
              config.showGrid
                ? 'bg-neutral-800 text-white border-white'
                : 'text-neutral-400 border-transparent hover:text-white'
            }`}
            title="Ecliptic Reference Grid"
          >
            <Compass size={14} />
          </button>

          <button
            onClick={() => onUpdateConfig({ showTrails: !config.showTrails })}
            className={`p-1.5 border transition ${
              config.showTrails
                ? 'bg-neutral-800 text-white border-white'
                : 'text-neutral-400 border-transparent hover:text-white'
            }`}
            title="Orbital Trajectory Trails"
          >
            <Layers size={14} />
          </button>

          <button
            onClick={() => onUpdateConfig({ showBarycenter: !config.showBarycenter })}
            className={`p-1.5 border transition ${
              config.showBarycenter
                ? 'bg-neutral-800 text-white border-white'
                : 'text-neutral-400 border-transparent hover:text-white'
            }`}
            title="System Center of Mass (Barycentre)"
          >
            <Crosshair size={14} />
          </button>

          <button
            onClick={() => onUpdateConfig({ useRealisticTextures: !config.useRealisticTextures })}
            className={`p-1.5 border transition ${
              config.useRealisticTextures
                ? 'bg-neutral-800 text-white border-white'
                : 'text-neutral-400 border-transparent hover:text-white'
            }`}
            title="Photorealistic Web CDN Textures"
          >
            <Image size={14} />
          </button>
        </div>

        {/* FPS badge */}
        <div className="px-2.5 py-1 bg-neutral-950 border border-neutral-800 text-xs font-mono text-emerald-400 font-semibold">
          {fps} FPS
        </div>
      </div>
    </header>
  );
};
