import React from 'react';
import type { SimulationConfig, IntegratorType, CollisionModel } from '../physics/types';
import { G_ASTRONOMICAL, DEFAULT_SOFTENING } from '../physics/constants';
import {
  X,
  Sliders,
  Cpu,
  Layers,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';

interface EditSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SimulationConfig;
  onUpdateConfig: (updated: Partial<SimulationConfig>) => void;
  showAsteroidBelt: boolean;
  onToggleAsteroidBelt: () => void;
}

export const EditSimulationModal: React.FC<EditSimulationModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  showAsteroidBelt,
  onToggleAsteroidBelt,
}) => {
  if (!isOpen) return null;

  const dtDays = (config.timeStep * 365.25).toFixed(2);
  const dtSeconds = Math.round(config.timeStep * 365.25 * 86400);

  const handleResetDefaults = () => {
    onUpdateConfig({
      G: G_ASTRONOMICAL,
      timeStep: 0.002,
      subSteps: 8,
      timeMultiplier: 1.0,
      integrator: 'verlet',
      collisionModel: 'merge',
      softening: DEFAULT_SOFTENING,
      showTrails: true,
      showGrid: true,
      showVectors: false,
      useRealisticTextures: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 font-sans select-none">
      <div className="w-full max-w-xl bg-[#101722] border border-[#263447] rounded-xl shadow-2xl overflow-hidden text-xs text-[#E8EEF7]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#141E2B] border-b border-[#263447]">
          <span className="font-semibold text-sm flex items-center gap-2">
            <Sliders size={16} className="text-[#8797FF]" />
            Edit Simulation & Physics Parameters
          </span>
          <button
            onClick={onClose}
            className="text-[#8E9BAD] hover:text-[#E8EEF7] p-1 rounded-md transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Tabs / Body */}
        <div className="p-5 space-y-4 max-h-[72vh] overflow-y-auto">
          {/* 1. GRAVITATIONAL DYNAMICS */}
          <div className="p-3.5 bg-[#141E2B]/80 rounded-xl border border-[#263447] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-[#8797FF] flex items-center gap-1.5 uppercase tracking-wider">
                Gravitational Parameters
              </span>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="text-[11px] text-[#8E9BAD] hover:text-[#E8EEF7] flex items-center gap-1 transition"
                title="Reset to Astronomical standard G = 4*pi^2"
              >
                <RotateCcw size={11} /> Reset Defaults
              </button>
            </div>

            {/* Gravitational Constant G */}
            <div>
              <div className="flex justify-between text-[#8E9BAD] mb-1">
                <span>Universal Gravitational Constant (G)</span>
                <span className="font-mono text-[#E8EEF7] font-semibold">
                  {config.G.toFixed(3)} AU³/(M☉·yr²)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="0.5"
                  value={config.G}
                  onChange={(e) => onUpdateConfig({ G: parseFloat(e.target.value) })}
                  className="flex-1 accent-[#8797FF] h-1.5 bg-[#101722] rounded-full cursor-pointer"
                />
                <input
                  type="number"
                  step="0.1"
                  value={config.G}
                  onChange={(e) => onUpdateConfig({ G: Math.max(0.01, parseFloat(e.target.value) || 0) })}
                  className="w-20 px-2 py-1 bg-[#101722] border border-[#263447] text-right font-mono rounded text-[#E8EEF7]"
                />
              </div>
            </div>

            {/* Softening Parameter */}
            <div>
              <div className="flex justify-between text-[#8E9BAD] mb-1">
                <span>Plummer Softening (ε) — Singularity Guard</span>
                <span className="font-mono text-[#E8EEF7] font-semibold">
                  {config.softening.toFixed(4)} AU
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.0001"
                  max="0.05"
                  step="0.0005"
                  value={config.softening}
                  onChange={(e) => onUpdateConfig({ softening: parseFloat(e.target.value) })}
                  className="flex-1 accent-[#8797FF] h-1.5 bg-[#101722] rounded-full cursor-pointer"
                />
                <span className="w-20 text-right font-mono text-[#8E9BAD]">
                  {(config.softening * 149.6).toFixed(1)}M km
                </span>
              </div>
            </div>

            {/* Collision Model */}
            <div>
              <label className="text-[#8E9BAD] block mb-1">Celestial Collision Solver</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'merge', label: 'Inelastic Merger', desc: 'Conserves mass & momentum' },
                  { id: 'bounce', label: 'Elastic Bounce', desc: 'Momentum transfer' },
                  { id: 'none', label: 'Pass-Through', desc: 'Ghost flyby' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => onUpdateConfig({ collisionModel: m.id as CollisionModel })}
                    className={`p-2 rounded-lg border text-left transition ${
                      config.collisionModel === m.id
                        ? 'bg-[#8797FF]/20 border-[#8797FF]/60 text-white font-medium'
                        : 'bg-[#101722] border-[#263447] text-[#8E9BAD] hover:text-[#E8EEF7]'
                    }`}
                  >
                    <div className="font-semibold text-xs">{m.label}</div>
                    <div className="text-[10px] text-[#8E9BAD] leading-tight">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. NUMERICAL INTEGRATOR & TIME ENGINE */}
          <div className="p-3.5 bg-[#141E2B]/80 rounded-xl border border-[#263447] space-y-3">
            <span className="font-semibold text-xs text-[#53D6A0] flex items-center gap-1.5 uppercase tracking-wider">
              <Cpu size={14} /> Integration Algorithm & Time Engine
            </span>

            {/* Integrator Picker */}
            <div>
              <label className="text-[#8E9BAD] block mb-1">Numerical Integrator</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'verlet', name: 'Velocity Verlet', desc: 'Symplectic 2nd Order • Conserves Phase Space' },
                  { id: 'rk4', name: 'Runge-Kutta 4', desc: 'Classical 4th Order • High Single-Step Accuracy' },
                  { id: 'euler', name: 'Explicit Euler', desc: '1st Order Benchmark • Secular Energy Drift' },
                ].map((intg) => (
                  <button
                    key={intg.id}
                    onClick={() => onUpdateConfig({ integrator: intg.id as IntegratorType })}
                    className={`p-2 rounded-lg border text-left transition ${
                      config.integrator === intg.id
                        ? 'bg-[#53D6A0]/15 border-[#53D6A0]/60 text-white font-medium'
                        : 'bg-[#101722] border-[#263447] text-[#8E9BAD] hover:text-[#E8EEF7]'
                    }`}
                  >
                    <div className="font-semibold text-xs">{intg.name}</div>
                    <div className="text-[10px] text-[#8E9BAD] leading-tight mt-0.5">{intg.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Timestep dt */}
            <div>
              <div className="flex justify-between text-[#8E9BAD] mb-1">
                <span>Timestep per Sub-step (Δt)</span>
                <span className="font-mono text-[#E8EEF7] font-semibold">
                  {config.timeStep.toFixed(4)} yr ({dtDays} days • {dtSeconds}s)
                </span>
              </div>
              <input
                type="range"
                min="0.0005"
                max="0.01"
                step="0.0005"
                value={config.timeStep}
                onChange={(e) => onUpdateConfig({ timeStep: parseFloat(e.target.value) })}
                className="w-full accent-[#53D6A0] h-1.5 bg-[#101722] rounded-full cursor-pointer"
              />
            </div>

            {/* Sub-steps */}
            <div>
              <div className="flex justify-between text-[#8E9BAD] mb-1">
                <span>Physics Sub-steps per Animation Frame</span>
                <span className="font-mono text-[#E8EEF7] font-semibold">{config.subSteps} sub-steps</span>
              </div>
              <input
                type="range"
                min="2"
                max="32"
                step="2"
                value={config.subSteps}
                onChange={(e) => onUpdateConfig({ subSteps: parseInt(e.target.value) })}
                className="w-full accent-[#53D6A0] h-1.5 bg-[#101722] rounded-full cursor-pointer"
              />
            </div>
          </div>

          {/* 3. VISUAL LAYERS & OBSERVATORY SETTINGS */}
          <div className="p-3.5 bg-[#141E2B]/80 rounded-xl border border-[#263447] space-y-2.5">
            <span className="font-semibold text-xs text-[#5FD5E8] flex items-center gap-1.5 uppercase tracking-wider">
              <Layers size={14} /> Viewport & Visualization Layers
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center justify-between p-2 rounded-lg bg-[#101722] border border-[#263447] cursor-pointer">
                <span>Orbital Trajectory Trails</span>
                <input
                  type="checkbox"
                  checked={config.showTrails}
                  onChange={(e) => onUpdateConfig({ showTrails: e.target.checked })}
                  className="accent-[#8797FF] w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-[#101722] border border-[#263447] cursor-pointer">
                <span>Ecliptic Reference Grid</span>
                <input
                  type="checkbox"
                  checked={config.showGrid}
                  onChange={(e) => onUpdateConfig({ showGrid: e.target.checked })}
                  className="accent-[#8797FF] w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-[#101722] border border-[#263447] cursor-pointer">
                <span>Velocity Vector Arrows</span>
                <input
                  type="checkbox"
                  checked={config.showVectors}
                  onChange={(e) => onUpdateConfig({ showVectors: e.target.checked })}
                  className="accent-[#8797FF] w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-[#101722] border border-[#263447] cursor-pointer">
                <span>Main Asteroid Belt (1,200)</span>
                <input
                  type="checkbox"
                  checked={showAsteroidBelt}
                  onChange={onToggleAsteroidBelt}
                  className="accent-[#8797FF] w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-[#101722] border border-[#263447] cursor-pointer">
                <span>Barycentre Marker</span>
                <input
                  type="checkbox"
                  checked={config.showBarycenter}
                  onChange={(e) => onUpdateConfig({ showBarycenter: e.target.checked })}
                  className="accent-[#8797FF] w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-[#101722] border border-[#263447] cursor-pointer">
                <span>Web Photorealistic Textures</span>
                <input
                  type="checkbox"
                  checked={config.useRealisticTextures}
                  onChange={(e) => onUpdateConfig({ useRealisticTextures: e.target.checked })}
                  className="accent-[#8797FF] w-4 h-4 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#141E2B] border-t border-[#263447] flex items-center justify-between">
          <span className="text-[11px] text-[#8E9BAD] flex items-center gap-1">
            <ShieldAlert size={13} className="text-[#53D6A0]" />
            Real-time updates apply immediately to live physics engine
          </span>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#8797FF] hover:bg-[#97a5ff] text-[#080B12] font-semibold rounded-lg transition"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
