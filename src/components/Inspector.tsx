import React from 'react';
import type { CelestialBody } from '../physics/types';
import { AU_TO_KM, AU_PER_YR_TO_KM_PER_S } from '../physics/constants';
import {
  X,
  Target,
  Trash2,
  Lock,
  Unlock,
  Zap,
  RotateCw,
  Gauge,
  Sliders,
} from 'lucide-react';

interface InspectorProps {
  body: CelestialBody | null;
  allBodies: CelestialBody[];
  G: number;
  onUpdateBody: (updated: CelestialBody) => void;
  onDeleteBody: (id: string) => void;
  onClose: () => void;
  isFocused: boolean;
  onToggleFocus: (id: string) => void;
}

export const Inspector: React.FC<InspectorProps> = ({
  body,
  allBodies,
  G,
  onUpdateBody,
  onDeleteBody,
  onClose,
  isFocused,
  onToggleFocus,
}) => {
  if (!body) return null;

  const speedAU = Math.hypot(body.velocity.x, body.velocity.y, body.velocity.z);
  const speedKms = speedAU * AU_PER_YR_TO_KM_PER_S;
  const radiusKm = body.radius * AU_TO_KM;
  const distFromOrigin = Math.hypot(body.position.x, body.position.y, body.position.z);
  const massEarth = body.mass * 332946;

  // Circularize orbit around the most massive neighbor
  const handleCircularize = () => {
    let heaviest: CelestialBody | null = null;
    for (const b of allBodies) {
      if (b.id !== body.id && (!heaviest || b.mass > heaviest.mass)) {
        heaviest = b;
      }
    }

    if (heaviest) {
      const dx = body.position.x - heaviest.position.x;
      const dy = body.position.y - heaviest.position.y;
      const dz = body.position.z - heaviest.position.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist > 0.0001) {
        const circSpeed = Math.sqrt((G * heaviest.mass) / dist);
        // Perpendicular vector in X-Z orbital plane
        const vx = heaviest.velocity.x + (-dz / dist) * circSpeed;
        const vy = heaviest.velocity.y;
        const vz = heaviest.velocity.z + (dx / dist) * circSpeed;

        onUpdateBody({
          ...body,
          velocity: { x: vx, y: vy, z: vz },
          trail: [],
        });
      }
    }
  };

  const handleScaleVelocity = (factor: number) => {
    onUpdateBody({
      ...body,
      velocity: {
        x: body.velocity.x * factor,
        y: body.velocity.y * factor,
        z: body.velocity.z * factor,
      },
    });
  };

  const handleReverseVelocity = () => {
    onUpdateBody({
      ...body,
      velocity: {
        x: -body.velocity.x,
        y: -body.velocity.y,
        z: -body.velocity.z,
      },
    });
  };

  return (
    <aside className="absolute top-16 right-4 z-30 w-80 bg-slate-950/90 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-4 shadow-2xl shadow-cyan-950/50 space-y-3.5 text-xs text-slate-200 max-h-[calc(100vh-160px)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2 truncate">
          <div
            className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0 shadow-md"
            style={{ backgroundColor: body.color }}
          />
          <div className="truncate">
            <input
              type="text"
              value={body.name}
              onChange={(e) => onUpdateBody({ ...body, name: e.target.value })}
              className="bg-transparent font-bold text-sm text-slate-100 hover:bg-slate-900 px-1 py-0.5 rounded focus:outline-none focus:ring-1 focus:ring-cyan-400 truncate w-full"
            />
            <span className="text-[10px] text-cyan-400 uppercase font-mono tracking-wider">
              {body.type}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onToggleFocus(body.id)}
            className={`p-1.5 rounded-lg border transition ${
              isFocused
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
            title={isFocused ? 'Unlock Camera Focus' : 'Lock Camera to Body'}
          >
            <Target size={14} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Numerical Telemetry Metrics */}
      <div className="grid grid-cols-2 gap-2 text-center font-mono">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2">
          <span className="text-[9px] uppercase font-sans text-slate-400 block">Orbital Speed</span>
          <div className="text-xs font-bold text-cyan-300">{speedKms.toFixed(2)} km/s</div>
          <span className="text-[9px] text-slate-500">({speedAU.toFixed(2)} AU/yr)</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2">
          <span className="text-[9px] uppercase font-sans text-slate-400 block">Distance to Core</span>
          <div className="text-xs font-bold text-purple-300">{distFromOrigin.toFixed(3)} AU</div>
          <span className="text-[9px] text-slate-500">
            {(distFromOrigin * AU_TO_KM / 1e6).toFixed(1)} M km
          </span>
        </div>
      </div>

      {/* Editable Physical Properties */}
      <div className="space-y-2.5 pt-1">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
          <Sliders size={11} className="text-cyan-400" />
          Physical Properties
        </span>

        {/* Mass */}
        <div>
          <div className="flex justify-between text-slate-300 mb-0.5">
            <span>Mass</span>
            <span className="font-mono text-cyan-300">
              {body.mass >= 0.01 ? `${body.mass.toFixed(4)} M☉` : `${massEarth.toFixed(3)} M⊕`}
            </span>
          </div>
          <input
            type="number"
            step="any"
            value={body.mass}
            onChange={(e) => onUpdateBody({ ...body, mass: Math.max(1e-12, parseFloat(e.target.value) || 0) })}
            className="w-full px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Physical Radius */}
        <div>
          <div className="flex justify-between text-slate-300 mb-0.5">
            <span>Physical Radius</span>
            <span className="font-mono text-pink-300">
              {radiusKm > 1000000 ? `${(radiusKm / 1e6).toFixed(2)}M km` : `${Math.round(radiusKm).toLocaleString()} km`}
            </span>
          </div>
          <input
            type="number"
            step="any"
            value={body.radius}
            onChange={(e) => onUpdateBody({ ...body, radius: Math.max(1e-8, parseFloat(e.target.value) || 0) })}
            className="w-full px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* 3D Visual Rendering Radius */}
        <div>
          <div className="flex justify-between text-slate-300 mb-0.5">
            <span>3D Visual Scale (AU)</span>
            <span className="font-mono text-amber-300">{body.visualRadius.toFixed(2)} AU</span>
          </div>
          <input
            type="range"
            min="0.02"
            max="1.5"
            step="0.02"
            value={body.visualRadius}
            onChange={(e) => onUpdateBody({ ...body, visualRadius: parseFloat(e.target.value) })}
            className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded cursor-pointer"
          />
        </div>

        {/* 3D Coordinates (X, Y, Z in AU) */}
        <div className="pt-1">
          <span className="text-[10px] text-slate-400 block mb-1">Position Vector (AU)</span>
          <div className="grid grid-cols-3 gap-1.5 font-mono text-xs">
            {['x', 'y', 'z'].map((axis) => (
              <div key={axis} className="bg-slate-900 border border-slate-800 rounded-lg px-1.5 py-1">
                <span className="text-[9px] text-slate-500 uppercase">{axis}: </span>
                <span className="text-slate-200 font-bold">
                  {body.position[axis as 'x' | 'y' | 'z'].toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 3D Velocity (vx, vy, vz in AU/yr) */}
        <div>
          <span className="text-[10px] text-slate-400 block mb-1">Velocity Vector (AU/yr)</span>
          <div className="grid grid-cols-3 gap-1.5 font-mono text-xs">
            {['x', 'y', 'z'].map((axis) => (
              <div key={axis} className="bg-slate-900 border border-slate-800 rounded-lg px-1.5 py-1">
                <span className="text-[9px] text-slate-500 uppercase">v{axis}: </span>
                <span className="text-cyan-300 font-bold">
                  {body.velocity[axis as 'x' | 'y' | 'z'].toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orbital Mechanics Tools */}
      <div className="pt-2 border-t border-slate-800 space-y-2">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
          <Zap size={11} className="text-amber-400" />
          Orbital Adjusters
        </span>

        <div className="grid grid-cols-3 gap-1 font-mono text-[11px]">
          <button
            onClick={() => handleScaleVelocity(1.15)}
            className="py-1 px-1.5 bg-slate-900 border border-slate-800 hover:border-cyan-500 rounded-xl text-slate-300 hover:text-cyan-200 transition"
          >
            +15% Spd
          </button>
          <button
            onClick={() => handleScaleVelocity(0.85)}
            className="py-1 px-1.5 bg-slate-900 border border-slate-800 hover:border-cyan-500 rounded-xl text-slate-300 hover:text-cyan-200 transition"
          >
            -15% Spd
          </button>
          <button
            onClick={handleReverseVelocity}
            className="py-1 px-1.5 bg-slate-900 border border-slate-800 hover:border-purple-500 rounded-xl text-slate-300 hover:text-purple-200 transition flex items-center justify-center gap-0.5"
          >
            <RotateCw size={10} /> 180°
          </button>
        </div>

        <button
          onClick={handleCircularize}
          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 hover:bg-cyan-500/30 text-cyan-200 font-medium flex items-center justify-center gap-1.5 transition active:scale-98"
        >
          <Gauge size={13} className="text-cyan-400" />
          <span>Circularize Orbit</span>
        </button>
      </div>

      {/* Anchor & Delete Actions */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
        <button
          onClick={() => onUpdateBody({ ...body, isFixed: !body.isFixed, velocity: { x: 0, y: 0, z: 0 } })}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition ${
            body.isFixed
              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
              : 'border-slate-800 text-slate-400 hover:bg-slate-800'
          }`}
        >
          {body.isFixed ? <Lock size={12} /> : <Unlock size={12} />}
          <span>{body.isFixed ? 'Anchored' : 'Dynamic'}</span>
        </button>

        <button
          onClick={() => onDeleteBody(body.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/60 border border-rose-800/50 hover:bg-rose-900/80 text-rose-300 transition"
        >
          <Trash2 size={12} />
          <span>Delete Body</span>
        </button>
      </div>
    </aside>
  );
};
