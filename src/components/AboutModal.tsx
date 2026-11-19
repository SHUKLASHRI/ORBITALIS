import React from 'react';
import { X, Orbit, ShieldCheck, Cpu } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans select-none">
      <div className="w-full max-w-lg bg-[#101722] border border-[#263447] rounded-xl shadow-2xl overflow-hidden text-xs text-[#E8EEF7]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#141E2B] border-b border-[#263447]">
          <span className="font-display font-semibold text-sm tracking-[0.1em] text-[#E8EEF7] flex items-center gap-2">
            <Orbit size={16} className="text-[#8797FF]" />
            About ORBITALIS Laboratory
          </span>
          <button
            onClick={onClose}
            className="text-[#8E9BAD] hover:text-[#E8EEF7] p-1 rounded-md transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto leading-relaxed font-sans">
          <p className="text-[#E8EEF7]">
            <strong className="text-white font-display tracking-wider">ORBITALIS</strong> is a real-time, browser-based 3D gravitational physics observatory that simulates multi-body orbital mechanics governed by Newton&apos;s universal law of gravitation.
          </p>

          <div className="p-3 bg-[#141E2B] rounded-lg border border-[#263447] space-y-1.5">
            <span className="font-display text-[#8797FF] font-semibold flex items-center gap-1.5 text-xs tracking-wider">
              <Cpu size={14} /> Symplectic Velocity Verlet Integration
            </span>
            <p className="text-[#8E9BAD] text-[11px] leading-relaxed">
              Unlike classical non-symplectic integrators (Euler or RK4) which suffer from secular artificial energy drift over astronomical epochs, ORBITALIS uses a second-order symplectic Leapfrog / Velocity Verlet scheme that preserves phase-space volume and Hamiltonian mechanical energy.
            </p>
          </div>

          <div className="p-3 bg-[#141E2B] rounded-lg border border-[#263447] space-y-1.5">
            <span className="font-display text-[#53D6A0] font-semibold flex items-center gap-1.5 text-xs tracking-wider">
              <ShieldCheck size={14} /> Astronomical Natural Units System
            </span>
            <p className="text-[#8E9BAD] text-[11px] leading-relaxed">
              The simulation operates in natural astrophysical units where G = 4π² AU³ · M☉⁻¹ · yr⁻², distance is in Astronomical Units (1 AU ≈ 149.6M km), mass is in Solar Masses (1 M☉ ≈ 332,946 M⊕), and time is in Earth years. This completely eradicates floating-point overflow and catastrophic cancellation.
            </p>
          </div>

          <div className="space-y-1 text-[#8E9BAD] text-[11px] font-mono tabular-nums">
            <div>• Core Gravitational Constant: G = 4π² ≈ 39.4784 AU³/(M☉·yr²)</div>
            <div>• Plummer Softening: ε = 0.002 AU (singularity prevention)</div>
            <div>• Collision Model: Completely inelastic momentum-conserving coalescence</div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-[#141E2B] border-t border-[#263447] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#8797FF] hover:bg-[#97a5ff] text-[#080B12] font-semibold rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

