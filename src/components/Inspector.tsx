import React from 'react';
import type { CelestialBody } from '../physics/types';
import { AU_TO_KM, AU_PER_YR_TO_KM_PER_S } from '../physics/constants';
import { computeOrbitalElements } from '../physics/orbital';
import {
  X,
  Target,
  Trash2,
  Lock,
  Unlock,
  RotateCw,
  Gauge,
  Sliders,
  Compass,
  Activity,
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

  // Find primary attractor: heaviest body in the system other than this body
  let primaryAttractor: CelestialBody | null = null;
  for (const b of allBodies) {
    if (b.id !== body.id && (!primaryAttractor || b.mass > primaryAttractor.mass)) {
      primaryAttractor = b;
    }
  }

  // Compute exact Keplerian orbital elements relative to primary
  const orbital = primaryAttractor
    ? computeOrbitalElements(body, primaryAttractor, G)
    : null;

  const speedAU = Math.hypot(body.velocity.x, body.velocity.y, body.velocity.z);
  const speedKms = speedAU * AU_PER_YR_TO_KM_PER_S;
  const radiusKm = body.radius * AU_TO_KM;
  const massEarth = body.mass * 332946;

  // Relative distance to primary
  const distToPrimary = primaryAttractor
    ? Math.hypot(
        body.position.x - primaryAttractor.position.x,
        body.position.y - primaryAttractor.position.y,
        body.position.z - primaryAttractor.position.z
      )
    : Math.hypot(body.position.x, body.position.y, body.position.z);

  // Circularize orbit around the primary attractor
  const handleCircularize = () => {
    if (!primaryAttractor) return;

    const dx = body.position.x - primaryAttractor.position.x;
    const dy = body.position.y - primaryAttractor.position.y;
    const dz = body.position.z - primaryAttractor.position.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (dist > 0.0001) {
      // Circular speed: v_circ = sqrt(G * M / r)
      const circSpeed = Math.sqrt((G * (primaryAttractor.mass + body.mass)) / dist);
      // Perpendicular tangent vector in the X-Z plane
      const vx = primaryAttractor.velocity.x + (-dz / dist) * circSpeed;
      const vy = primaryAttractor.velocity.y;
      const vz = primaryAttractor.velocity.z + (dx / dist) * circSpeed;

      onUpdateBody({
        ...body,
        velocity: { x: vx, y: vy, z: vz },
        trail: [],
      });
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
    <aside className="absolute top-12 right-2 z-30 w-80 bg-[#090d16] border border-[#1b2230] p-3 text-xs text-[#c9d1d9] max-h-[calc(100vh-140px)] overflow-y-auto select-none font-mono">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-[#1b2230] pb-2">
        <div className="flex items-center gap-2 truncate">
          <div
            className="w-3 h-3 border border-[#30363d] shrink-0"
            style={{ backgroundColor: body.color }}
          />
          <div className="truncate">
            <input
              type="text"
              value={body.name}
              onChange={(e) => onUpdateBody({ ...body, name: e.target.value })}
              className="bg-transparent font-bold text-xs text-[#f0f6fc] hover:bg-[#161b22] px-1 py-0.5 border border-transparent focus:border-[#388bfd] focus:outline-none truncate w-full"
            />
            <div className="text-[10px] text-[#58a6ff] uppercase tracking-wider">
              {body.type} {body.isFixed ? '• ANCHORED' : ''}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onToggleFocus(body.id)}
            className={`p-1 border transition ${
              isFocused
                ? 'bg-[#1f2937] border-[#388bfd] text-[#58a6ff]'
                : 'border-[#21262d] text-[#8b949e] hover:bg-[#161b22] hover:text-[#f0f6fc]'
            }`}
            title={isFocused ? 'Unlock Camera Tracking' : 'Track Body with Camera'}
          >
            <Target size={13} />
          </button>
          <button
            onClick={onClose}
            className="p-1 text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#161b22] border border-[#21262d] transition"
            title="Close Telemetry Panel"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Primary Kinematic Telemetry */}
      <div className="grid grid-cols-2 gap-1.5 pt-2 text-center">
        <div className="bg-[#0d111a] border border-[#1b2230] p-1.5">
          <span className="text-[9px] uppercase text-[#8b949e] block">Speed</span>
          <div className="text-xs font-bold text-[#58a6ff]">{speedKms.toFixed(2)} km/s</div>
          <span className="text-[9px] text-[#484f58]">({speedAU.toFixed(3)} AU/yr)</span>
        </div>

        <div className="bg-[#0d111a] border border-[#1b2230] p-1.5">
          <span className="text-[9px] uppercase text-[#8b949e] block">Dist to Primary</span>
          <div className="text-xs font-bold text-[#f0f6fc]">{distToPrimary.toFixed(3)} AU</div>
          <span className="text-[9px] text-[#484f58]">
            {(distToPrimary * AU_TO_KM / 1e6).toFixed(1)}M km
          </span>
        </div>
      </div>

      {/* Keplerian Orbital Elements (if attractor exists) */}
      {orbital && primaryAttractor && (
        <div className="pt-2 border-t border-[#1b2230] space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-[#8b949e] uppercase font-bold">
            <span className="flex items-center gap-1">
              <Compass size={11} className="text-[#388bfd]" /> Keplerian Elements
            </span>
            <span className={orbital.isBound ? 'text-[#3fb950]' : 'text-[#d29922]'}>
              {orbital.isBound ? 'BOUND ORBIT' : 'ESCAPE TRAJECTORY'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1 text-[10px] bg-[#0d111a] border border-[#1b2230] p-1.5">
            <div>
              <span className="text-[#8b949e]">Semi-Major (a):</span>{' '}
              <span className="text-[#f0f6fc] font-bold">{orbital.semiMajorAxis.toFixed(3)} AU</span>
            </div>
            <div>
              <span className="text-[#8b949e]">Eccentricity (e):</span>{' '}
              <span className="text-[#58a6ff] font-bold">{orbital.eccentricity.toFixed(4)}</span>
            </div>
            <div>
              <span className="text-[#8b949e]">Period (T):</span>{' '}
              <span className="text-[#f0f6fc]">
                {orbital.periodYears !== null ? `${orbital.periodYears.toFixed(2)} yr` : '∞ (escape)'}
              </span>
            </div>
            <div>
              <span className="text-[#8b949e]">Period (days):</span>{' '}
              <span className="text-[#f0f6fc]">
                {orbital.periodDays !== null ? `${Math.round(orbital.periodDays)} d` : '—'}
              </span>
            </div>
            <div>
              <span className="text-[#8b949e]">Periapsis:</span>{' '}
              <span className="text-[#f0f6fc]">{orbital.periapsis.toFixed(3)} AU</span>
            </div>
            <div>
              <span className="text-[#8b949e]">Apoapsis:</span>{' '}
              <span className="text-[#f0f6fc]">
                {orbital.apoapsis !== null ? `${orbital.apoapsis.toFixed(3)} AU` : '∞'}
              </span>
            </div>
            <div>
              <span className="text-[#8b949e]">Inclination:</span>{' '}
              <span className="text-[#f0f6fc]">{orbital.inclinationDeg.toFixed(1)}°</span>
            </div>
            <div>
              <span className="text-[#8b949e]">Specific Energy:</span>{' '}
              <span className="text-[#f0f6fc]">{orbital.specificEnergy.toExponential(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Editable Physical Parameters */}
      <div className="pt-2 border-t border-[#1b2230] space-y-2">
        <span className="text-[10px] uppercase font-bold text-[#8b949e] flex items-center gap-1">
          <Sliders size={11} className="text-[#388bfd]" /> Physical Parameters
        </span>

        {/* Mass */}
        <div>
          <div className="flex justify-between text-[#8b949e] mb-0.5 text-[10px]">
            <span>MASS (M☉ / M⊕)</span>
            <span className="text-[#58a6ff]">
              {body.mass >= 0.01 ? `${body.mass.toFixed(4)} M☉` : `${massEarth.toFixed(3)} M⊕`}
            </span>
          </div>
          <input
            type="number"
            step="any"
            value={body.mass}
            onChange={(e) => onUpdateBody({ ...body, mass: Math.max(1e-12, parseFloat(e.target.value) || 0) })}
            className="w-full px-2 py-1 bg-[#0d111a] border border-[#21262d] text-xs text-[#f0f6fc] focus:outline-none focus:border-[#388bfd]"
          />
        </div>

        {/* Physical Radius */}
        <div>
          <div className="flex justify-between text-[#8b949e] mb-0.5 text-[10px]">
            <span>PHYSICAL RADIUS (KM)</span>
            <span className="text-[#f0f6fc]">
              {radiusKm > 1000000 ? `${(radiusKm / 1e6).toFixed(2)}M km` : `${Math.round(radiusKm).toLocaleString()} km`}
            </span>
          </div>
          <input
            type="number"
            step="any"
            value={body.radius}
            onChange={(e) => onUpdateBody({ ...body, radius: Math.max(1e-8, parseFloat(e.target.value) || 0) })}
            className="w-full px-2 py-1 bg-[#0d111a] border border-[#21262d] text-xs text-[#f0f6fc] focus:outline-none focus:border-[#388bfd]"
          />
        </div>

        {/* 3D Visual Scale */}
        <div>
          <div className="flex justify-between text-[#8b949e] mb-0.5 text-[10px]">
            <span>VIEWPORT VISUAL SCALE</span>
            <span className="text-[#e3b341]">{body.visualRadius.toFixed(2)} AU</span>
          </div>
          <input
            type="range"
            min="0.02"
            max="1.5"
            step="0.02"
            value={body.visualRadius}
            onChange={(e) => onUpdateBody({ ...body, visualRadius: parseFloat(e.target.value) })}
            className="w-full accent-[#388bfd] h-1 bg-[#21262d] cursor-pointer"
          />
        </div>

        {/* Position Vector */}
        <div>
          <span className="text-[10px] text-[#8b949e] block mb-0.5">POSITION [X, Y, Z] (AU)</span>
          <div className="grid grid-cols-3 gap-1">
            {(['x', 'y', 'z'] as const).map((axis) => (
              <div key={axis} className="bg-[#0d111a] border border-[#21262d] px-1 py-0.5 text-center">
                <span className="text-[9px] text-[#484f58] uppercase">{axis}: </span>
                <span className="text-[#f0f6fc]">{body.position[axis].toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Velocity Vector */}
        <div>
          <span className="text-[10px] text-[#8b949e] block mb-0.5">VELOCITY [VX, VY, VZ] (AU/YR)</span>
          <div className="grid grid-cols-3 gap-1">
            {(['x', 'y', 'z'] as const).map((axis) => (
              <div key={axis} className="bg-[#0d111a] border border-[#21262d] px-1 py-0.5 text-center">
                <span className="text-[9px] text-[#484f58] uppercase">v{axis}: </span>
                <span className="text-[#58a6ff]">{body.velocity[axis].toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orbital Velocity Operations */}
      <div className="pt-2 border-t border-[#1b2230] space-y-1.5">
        <span className="text-[10px] uppercase font-bold text-[#8b949e] flex items-center gap-1">
          <Activity size={11} className="text-[#388bfd]" /> Orbital Maneuvers
        </span>

        <div className="grid grid-cols-3 gap-1 text-[10px]">
          <button
            onClick={() => handleScaleVelocity(1.15)}
            className="py-1 px-1 bg-[#0d111a] border border-[#21262d] hover:border-[#388bfd] text-[#c9d1d9] hover:text-[#f0f6fc] transition"
          >
            +15% Spd
          </button>
          <button
            onClick={() => handleScaleVelocity(0.85)}
            className="py-1 px-1 bg-[#0d111a] border border-[#21262d] hover:border-[#388bfd] text-[#c9d1d9] hover:text-[#f0f6fc] transition"
          >
            -15% Spd
          </button>
          <button
            onClick={handleReverseVelocity}
            className="py-1 px-1 bg-[#0d111a] border border-[#21262d] hover:border-[#388bfd] text-[#c9d1d9] hover:text-[#f0f6fc] transition flex items-center justify-center gap-0.5"
          >
            <RotateCw size={9} /> 180°
          </button>
        </div>

        {primaryAttractor && (
          <button
            onClick={handleCircularize}
            className="w-full py-1.5 px-2 bg-[#161b22] border border-[#30363d] hover:border-[#388bfd] text-[#58a6ff] hover:text-[#f0f6fc] flex items-center justify-center gap-1.5 transition text-[11px]"
          >
            <Gauge size={12} className="text-[#388bfd]" />
            <span>Circularize Orbit vs {primaryAttractor.name}</span>
          </button>
        )}
      </div>

      {/* State Actions: Anchor & Delete */}
      <div className="pt-2 border-t border-[#1b2230] flex items-center justify-between text-[11px]">
        <button
          onClick={() => onUpdateBody({ ...body, isFixed: !body.isFixed, velocity: { x: 0, y: 0, z: 0 } })}
          className={`flex items-center gap-1 px-2.5 py-1 border transition ${
            body.isFixed
              ? 'bg-[#1f2937] border-[#d29922] text-[#d29922]'
              : 'border-[#21262d] text-[#8b949e] hover:bg-[#161b22] hover:text-[#f0f6fc]'
          }`}
        >
          {body.isFixed ? <Lock size={11} /> : <Unlock size={11} />}
          <span>{body.isFixed ? 'ANCHORED' : 'DYNAMIC'}</span>
        </button>

        <button
          onClick={() => onDeleteBody(body.id)}
          className="flex items-center gap-1 px-2.5 py-1 bg-[#211215] border border-[#672027] hover:bg-[#381a1f] text-[#f85149] transition"
        >
          <Trash2 size={11} />
          <span>DELETE</span>
        </button>
      </div>
    </aside>
  );
};
