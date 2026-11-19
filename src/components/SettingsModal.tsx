import React from 'react';
import type { SimulationConfig, RenderQuality } from '../physics/types';
import { X, Sliders } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SimulationConfig;
  onUpdateConfig: (updated: Partial<SimulationConfig>) => void;
  showAsteroidBelt: boolean;
  onToggleAsteroidBelt: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  showAsteroidBelt,
  onToggleAsteroidBelt,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans select-none">
      <div className="w-full max-w-md bg-[#101722] border border-[#263447] rounded-xl shadow-2xl overflow-hidden text-xs text-[#E8EEF7]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#141E2B] border-b border-[#263447]">
          <span className="font-display font-semibold text-sm tracking-[0.1em] text-[#E8EEF7] flex items-center gap-2">
            <Sliders size={16} className="text-[#8797FF]" />
            Simulation & Viewport Settings
          </span>
          <button
            onClick={onClose}
            className="text-[#8E9BAD] hover:text-[#E8EEF7] p-1 rounded-md transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Settings Form */}
        <div className="p-4 space-y-3.5">
          {/* Graphics Quality */}
          <div>
            <label className="font-display text-xs tracking-[0.12em] text-[#8E9BAD] uppercase block mb-1 font-semibold">
              Graphics Render Quality
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-[#141E2B] p-1 rounded-lg border border-[#263447]">
              {(['performance', 'balanced', 'high'] as RenderQuality[]).map((q) => (
                <button
                  key={q}
                  onClick={() => onUpdateConfig({ renderQuality: q })}
                  className={`py-1.5 rounded-md capitalize transition font-sans text-xs font-medium ${config.renderQuality === q
                    ? 'bg-[#8797FF]/20 text-[#8797FF] border border-[#8797FF]/40 font-semibold'
                    : 'text-[#8E9BAD] hover:text-[#E8EEF7]'
                    }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Viewport Layers Toggles */}
          <div className="space-y-2 pt-2 border-t border-[#263447]">
            <span className="font-display text-xs tracking-[0.12em] text-[#8E9BAD] uppercase block font-semibold">
              Viewport Visualization Layers
            </span>

            <label className="flex items-center justify-between cursor-pointer py-1">
              <span>Orbital Trajectory Trails</span>
              <input
                type="checkbox"
                checked={config.showTrails}
                onChange={(e) => onUpdateConfig({ showTrails: e.target.checked })}
                className="accent-[#8797FF] w-4 h-4 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer py-1">
              <span>Ecliptic Reference Grid</span>
              <input
                type="checkbox"
                checked={config.showGrid}
                onChange={(e) => onUpdateConfig({ showGrid: e.target.checked })}
                className="accent-[#8797FF] w-4 h-4 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer py-1">
              <span>Velocity Vector Arrows</span>
              <input
                type="checkbox"
                checked={config.showVectors}
                onChange={(e) => onUpdateConfig({ showVectors: e.target.checked })}
                className="accent-[#8797FF] w-4 h-4 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer py-1">
              <span>Main Asteroid Belt Population</span>
              <input
                type="checkbox"
                checked={showAsteroidBelt}
                onChange={onToggleAsteroidBelt}
                className="accent-[#8797FF] w-4 h-4 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer py-1">
              <span>Realistic Web CDN Planetary Textures</span>
              <input
                type="checkbox"
                checked={config.useRealisticTextures}
                onChange={(e) => onUpdateConfig({ useRealisticTextures: e.target.checked })}
                className="accent-[#8797FF] w-4 h-4 cursor-pointer"
              />
            </label>
          </div>

          {/* Sub-steps */}
          <div className="pt-2 border-t border-[#263447]">
            <div className="flex justify-between mb-1">
              <span className="text-[#8E9BAD]">Numerical Sub-steps per Frame</span>
              <span className="font-mono text-[#8797FF]">{config.subSteps} sub-steps</span>
            </div>
            <input
              type="range"
              min="2"
              max="24"
              step="2"
              value={config.subSteps}
              onChange={(e) => onUpdateConfig({ subSteps: parseInt(e.target.value) })}
              className="w-full accent-[#8797FF] h-1.5 bg-[#141E2B] rounded-full cursor-pointer"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-[#141E2B] border-t border-[#263447] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#8797FF] hover:bg-[#97a5ff] text-[#080B12] font-semibold rounded-lg transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

