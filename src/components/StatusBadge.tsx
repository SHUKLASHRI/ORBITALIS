import React from 'react';
import type { SimulationConfig, IntegratorType } from '../physics/types';
import { ChevronDown, Orbit, Clock, Cpu } from 'lucide-react';

interface StatusBadgeProps {
  bodyCount: number;
  config: SimulationConfig;
  onUpdateConfig: (updated: Partial<SimulationConfig>) => void;
  fps: number;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  bodyCount,
  config,
  onUpdateConfig,
  fps,
}) => {
  // Convert timeStep (years) to human seconds / minutes / hours
  const dtSeconds = Math.round(config.timeStep * 365.25 * 86400);

  return (
    <div className="absolute bottom-4 right-4 z-30 pointer-events-none select-none font-sans">
      <div className="pointer-events-auto bg-[#101722]/95 backdrop-blur-md border border-[#263447] p-2.5 rounded-xl shadow-2xl text-xs text-[#E8EEF7] space-y-1.5 w-44">
        {/* Bodies Count & Status Dot */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[#8E9BAD]">
            <Orbit size={13} className="text-[#8797FF]" />
            <span>Bodies:</span>
            <span className="font-mono text-[#E8EEF7] font-semibold">{bodyCount}</span>
          </span>

          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#53D6A0] animate-pulse" />
            <span className="font-mono text-[10px] text-[#53D6A0]">{fps} FPS</span>
          </div>
        </div>

        {/* Timestep Δt */}
        <div className="flex items-center justify-between text-[#8E9BAD] font-mono text-[11px]">
          <span className="flex items-center gap-1.5 font-sans text-xs">
            <Clock size={13} className="text-[#8797FF]" />
            <span>Δt:</span>
          </span>
          <span className="text-[#E8EEF7]">
            {dtSeconds > 86400
              ? `${(dtSeconds / 86400).toFixed(1)} days`
              : dtSeconds >= 60
              ? `${Math.round(dtSeconds / 60)} min`
              : `${dtSeconds} s`}
          </span>
        </div>

        {/* Numerical Method Selector */}
        <div className="flex items-center justify-between pt-1 border-t border-[#263447]/60">
          <span className="flex items-center gap-1.5 text-[#8E9BAD] text-xs">
            <Cpu size={13} className="text-[#8797FF]" />
            <span>Method:</span>
          </span>

          <div className="relative">
            <select
              value={config.integrator}
              onChange={(e) => onUpdateConfig({ integrator: e.target.value as IntegratorType })}
              className="appearance-none bg-[#141E2B] border border-[#263447] text-[11px] text-[#E8EEF7] pl-1.5 pr-4 py-0.5 rounded focus:outline-none focus:border-[#8797FF] cursor-pointer"
            >
              <option value="verlet">Leapfrog (Verlet)</option>
              <option value="rk4">Runge-Kutta 4</option>
              <option value="euler">Euler</option>
            </select>
            <ChevronDown size={10} className="absolute right-1 top-1.5 text-[#8E9BAD] pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};
