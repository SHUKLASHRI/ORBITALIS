import React from 'react';
import type { SimulationConfig } from '../physics/types';
import {
  Play,
  Pause,
  RotateCcw,
  Calendar,
  ChevronDown,
} from 'lucide-react';

interface PlaybackBarProps {
  config: SimulationConfig;
  onUpdateConfig: (updated: Partial<SimulationConfig>) => void;
  onReset: () => void;
  onStepFrame: () => void;
  simulationTimeYears: number;
}

export const PlaybackBar: React.FC<PlaybackBarProps> = ({
  config,
  onUpdateConfig,
  onReset,
  onStepFrame,
  simulationTimeYears,
}) => {
  const currentDays = (simulationTimeYears * 365.25).toFixed(1);

  const speedOptions = [0.1, 0.5, 1.0, 2.0, 5.0, 10.0];

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none select-none font-sans">
      <div className="pointer-events-auto flex items-center gap-3 bg-[#101722]/95 backdrop-blur-md border border-[#263447] px-3.5 py-2 rounded-xl shadow-2xl text-xs text-[#E8EEF7]">
        {/* Play / Pause Toggle */}
        <button
          onClick={() => onUpdateConfig({ isPaused: !config.isPaused })}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition shadow-md ${
            config.isPaused
              ? 'bg-[#8797FF] hover:bg-[#97a5ff] text-[#080B12]'
              : 'bg-[#141E2B] hover:bg-[#1a2636] text-[#E8EEF7] border border-[#263447]'
          }`}
          title={config.isPaused ? 'Resume Simulation (Space)' : 'Pause Simulation (Space)'}
        >
          {config.isPaused ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />}
        </button>

        {/* Reset */}
        <button
          onClick={onReset}
          className="p-1.5 text-[#8E9BAD] hover:text-[#E8EEF7] hover:bg-[#141E2B] rounded-lg transition"
          title="Reset Simulation (R)"
        >
          <RotateCcw size={16} />
        </button>

        {/* Time Speed Selector */}
        <div className="relative flex items-center">
          <select
            value={config.timeMultiplier}
            onChange={(e) => onUpdateConfig({ timeMultiplier: parseFloat(e.target.value) })}
            className="appearance-none bg-[#141E2B] border border-[#263447] text-[#E8EEF7] text-xs font-medium pl-2.5 pr-6 py-1.5 rounded-lg focus:outline-none focus:border-[#8797FF] cursor-pointer"
          >
            {speedOptions.map((spd) => (
              <option key={spd} value={spd}>
                Time × {spd.toFixed(spd >= 1 ? 2 : 1)}
              </option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2 text-[#8E9BAD] pointer-events-none" />
        </div>

        {/* Timeline Scrub Slider */}
        <div className="flex items-center gap-2 w-48 sm:w-64">
          <input
            type="range"
            min="0"
            max="100"
            value={(Math.min(100, (parseFloat(currentDays) % 1000) / 10))}
            onChange={() => {}}
            className="w-full accent-[#8797FF] h-1.5 bg-[#141E2B] rounded-full cursor-pointer"
          />
        </div>

        {/* Live Day Counter */}
        <div className="flex items-center gap-1.5 font-mono text-xs text-[#E8EEF7] pl-1 border-l border-[#263447]">
          <span>Day {currentDays}</span>
        </div>

        {/* Step Frame / Calendar Icon */}
        <button
          onClick={onStepFrame}
          className="p-1.5 text-[#8E9BAD] hover:text-[#8797FF] hover:bg-[#141E2B] rounded-lg transition"
          title="Step 1 Numerical Frame"
        >
          <Calendar size={15} />
        </button>
      </div>
    </div>
  );
};
