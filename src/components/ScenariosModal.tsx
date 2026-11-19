import React from 'react';
import type { PresetSystem } from '../physics/types';
import { ALL_PRESETS } from '../presets';
import { X, Box, Orbit } from 'lucide-react';

interface ScenariosModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPresetId: string;
  onSelectPreset: (preset: PresetSystem) => void;
}

export const ScenariosModal: React.FC<ScenariosModalProps> = ({
  isOpen,
  onClose,
  currentPresetId,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans select-none">
      <div className="w-full max-w-2xl bg-[#101722] border border-[#263447] rounded-xl shadow-2xl overflow-hidden text-xs text-[#E8EEF7]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#141E2B] border-b border-[#263447]">
          <span className="font-display font-semibold text-sm tracking-[0.1em] text-[#E8EEF7] flex items-center gap-2">
            <Box size={16} className="text-[#8797FF]" />
            Astrophysics Scenarios & Experiments Library
          </span>
          <button
            onClick={onClose}
            className="text-[#8E9BAD] hover:text-[#E8EEF7] p-1 rounded-md transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Preset Cards Grid */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto">
          {ALL_PRESETS.map((p, idx) => {
            const isCurrent = currentPresetId === p.id;
            return (
              <div
                key={p.id}
                onClick={() => {
                  onSelectPreset(p);
                  onClose();
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition text-left flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-[#8797FF]/15 border-[#8797FF]/60 shadow-[0_0_16px_rgba(135,151,255,0.15)]'
                    : 'bg-[#141E2B]/60 border-[#263447] hover:bg-[#141E2B] hover:border-[#3a4d66]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-display font-semibold text-sm tracking-wide flex items-center gap-2 text-white">
                      <span className="font-mono text-[#8797FF] font-semibold">0{idx + 1}.</span> {p.name}
                    </span>
                    <span className="text-[11px] font-mono tabular-nums px-2 py-0.5 rounded-full bg-[#101722] border border-[#263447] text-[#5FD5E8] flex items-center gap-1">
                      <Orbit size={11} />
                      {p.bodies.length} bodies
                    </span>
                  </div>

                  <p className="font-sans text-xs text-[#8E9BAD] leading-relaxed line-clamp-3 mb-2">
                    {p.description}
                  </p>
                </div>

                {p.objective && (
                  <div className="text-[11px] text-[#E8B86B] font-mono tabular-nums pt-2 border-t border-[#263447]/60 truncate">
                    OBJ: {p.objective}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

