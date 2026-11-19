import React, { useState, useEffect } from 'react';
import type { CelestialBody } from '../physics/types';
import { AU_PER_YR_TO_KM_PER_S } from '../physics/constants';
import { computeOrbitalElements } from '../physics/orbital';
import {
  formatDynamicMass,
  formatDynamicDistance,
  formatRadiusKm,
  formatDynamicEnergy,
  type MassUnit,
  convertMassFromSolar,
  convertMassToSolar,
  type DistanceUnit,
  convertRadiusFromAU,
  convertRadiusToAU,
} from '../physics/units';
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
  Plus,
  Minus,
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

  // Selected editable units
  const [massUnit, setMassUnit] = useState<MassUnit>(() => {
    if (body.mass >= 0.1) return 'solar';
    if (body.mass >= 0.0005) return 'jupiter';
    if (body.mass >= 0.00000005) return 'earth';
    return 'moon';
  });

  const [radiusUnit, setRadiusUnit] = useState<DistanceUnit>('km');

  // Local display values to prevent string conversion jitter & scientific 'e' notation
  const [localMassValue, setLocalMassValue] = useState<string>('');
  const [localRadiusValue, setLocalRadiusValue] = useState<string>('');

  // Sync local inputs when body or unit changes
  useEffect(() => {
    const m = convertMassFromSolar(body.mass, massUnit);
    setLocalMassValue(m >= 1000 ? Math.round(m).toString() : m >= 1 ? m.toFixed(3) : m.toFixed(4));
  }, [body.id, body.mass, massUnit]);

  useEffect(() => {
    const r = convertRadiusFromAU(body.radius, radiusUnit);
    setLocalRadiusValue(r >= 100 ? Math.round(r).toString() : r.toFixed(2));
  }, [body.id, body.radius, radiusUnit]);

  // Find primary attractor (heaviest other body)
  let primaryAttractor: CelestialBody | null = null;
  for (const b of allBodies) {
    if (b.id !== body.id && (!primaryAttractor || b.mass > primaryAttractor.mass)) {
      primaryAttractor = b;
    }
  }

  // Exact Keplerian elements
  const orbital = primaryAttractor ? computeOrbitalElements(body, primaryAttractor, G) : null;

  const speedAU = Math.hypot(body.velocity.x, body.velocity.y, body.velocity.z);
  const speedKms = speedAU * AU_PER_YR_TO_KM_PER_S;

  const distToPrimary = primaryAttractor
    ? Math.hypot(
        body.position.x - primaryAttractor.position.x,
        body.position.y - primaryAttractor.position.y,
        body.position.z - primaryAttractor.position.z
      )
    : Math.hypot(body.position.x, body.position.y, body.position.z);

  // Stepping Mass cleanly without 'e' or negative clamping
  const handleStepMass = (stepMultiplier: number) => {
    const current = parseFloat(localMassValue) || convertMassFromSolar(body.mass, massUnit);
    let delta = 1;
    if (massUnit === 'solar') delta = current >= 1 ? 0.1 : 0.01;
    else if (massUnit === 'jupiter') delta = current >= 10 ? 1 : 0.1;
    else if (massUnit === 'earth') delta = current >= 10 ? 1 : 0.1;
    else if (massUnit === 'moon') delta = current >= 5 ? 1 : 0.1;

    const next = Math.max(0.001, current + delta * stepMultiplier);
    const newSolarMass = convertMassToSolar(next, massUnit);
    setLocalMassValue(next >= 1 ? next.toFixed(3) : next.toFixed(4));
    onUpdateBody({ ...body, mass: newSolarMass });
  };

  // Direct mass change handler
  const handleMassInputChange = (text: string) => {
    setLocalMassValue(text);
    const num = parseFloat(text);
    if (!isNaN(num) && num > 0) {
      const newSolarMass = convertMassToSolar(num, massUnit);
      onUpdateBody({ ...body, mass: newSolarMass });
    }
  };

  // Stepping Radius cleanly in km
  const handleStepRadius = (stepMultiplier: number) => {
    const current = parseFloat(localRadiusValue) || convertRadiusFromAU(body.radius, radiusUnit);
    let delta = 100;
    if (radiusUnit === 'km') delta = current >= 10000 ? 500 : current >= 1000 ? 100 : 10;
    else if (radiusUnit === 'million_km') delta = 0.05;
    else if (radiusUnit === 'au') delta = 0.001;

    const next = Math.max(1, current + delta * stepMultiplier);
    const newRadiusAU = convertRadiusToAU(next, radiusUnit);
    setLocalRadiusValue(next >= 100 ? Math.round(next).toString() : next.toFixed(2));
    onUpdateBody({ ...body, radius: newRadiusAU });
  };

  // Direct radius change handler
  const handleRadiusInputChange = (text: string) => {
    setLocalRadiusValue(text);
    const num = parseFloat(text);
    if (!isNaN(num) && num > 0) {
      const newAU = convertRadiusToAU(num, radiusUnit);
      onUpdateBody({ ...body, radius: newAU });
    }
  };

  // Circularize orbit
  const handleCircularize = () => {
    if (!primaryAttractor) return;

    const dx = body.position.x - primaryAttractor.position.x;
    const dy = body.position.y - primaryAttractor.position.y;
    const dz = body.position.z - primaryAttractor.position.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (dist > 0.0001) {
      const circSpeed = Math.sqrt((G * (primaryAttractor.mass + body.mass)) / dist);
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
    <aside className="absolute top-14 right-3 z-30 w-84 bg-black border border-neutral-700 p-3.5 text-neutral-200 max-h-[calc(100vh-160px)] overflow-y-auto select-none font-sans shadow-xl">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
        <div className="flex items-center gap-2.5 truncate">
          <div
            className="w-4 h-4 border border-white/40 shrink-0"
            style={{ backgroundColor: body.color }}
          />
          <div className="truncate">
            <input
              type="text"
              value={body.name}
              onChange={(e) => onUpdateBody({ ...body, name: e.target.value })}
              className="bg-transparent font-bold text-sm text-white hover:bg-neutral-900 px-1 py-0.5 border border-transparent focus:border-white focus:outline-none truncate w-full"
            />
            <div className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">
              {body.type} {body.isFixed ? '• ANCHORED' : ''}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onToggleFocus(body.id)}
            className={`p-1.5 border transition ${
              isFocused
                ? 'bg-white text-black border-white'
                : 'border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white'
            }`}
            title={isFocused ? 'Unlock Camera Tracking' : 'Track Body with Camera'}
          >
            <Target size={14} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-700 transition"
            title="Close Panel"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Primary Kinematic Telemetry */}
      <div className="grid grid-cols-2 gap-2 pt-2.5 text-center">
        <div className="bg-neutral-950 border border-neutral-800 p-2">
          <span className="text-xs uppercase text-neutral-400 font-medium block">Speed</span>
          <div className="text-sm font-bold text-white mt-0.5">{speedKms.toFixed(2)} km/s</div>
          <span className="text-xs text-neutral-400">({speedAU.toFixed(3)} AU/yr)</span>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-2">
          <span className="text-xs uppercase text-neutral-400 font-medium block">Dist to Primary</span>
          <div className="text-sm font-bold text-white mt-0.5">
            {formatDynamicDistance(distToPrimary)}
          </div>
          <span className="text-xs text-neutral-400">
            {primaryAttractor ? primaryAttractor.name : 'Origin'}
          </span>
        </div>
      </div>

      {/* Keplerian Orbital Elements (if attractor exists) */}
      {orbital && primaryAttractor && (
        <div className="pt-3 border-t border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs uppercase font-bold">
            <span className="flex items-center gap-1.5 text-neutral-300">
              <Compass size={13} className="text-white" /> Keplerian Elements
            </span>
            <span className={orbital.isBound ? 'text-emerald-400' : 'text-amber-400'}>
              {orbital.isBound ? 'BOUND ORBIT' : 'ESCAPE'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-xs bg-neutral-950 border border-neutral-800 p-2">
            <div>
              <span className="text-neutral-400">Semi-Major (a):</span>{' '}
              <span className="text-white font-semibold">
                {formatDynamicDistance(orbital.semiMajorAxis)}
              </span>
            </div>
            <div>
              <span className="text-neutral-400">Eccentricity (e):</span>{' '}
              <span className="text-white font-semibold">{orbital.eccentricity.toFixed(4)}</span>
            </div>
            <div>
              <span className="text-neutral-400">Period (T):</span>{' '}
              <span className="text-white">
                {orbital.periodYears !== null ? `${orbital.periodYears.toFixed(2)} yr` : 'Escape'}
              </span>
            </div>
            <div>
              <span className="text-neutral-400">Period (days):</span>{' '}
              <span className="text-white">
                {orbital.periodDays !== null ? `${Math.round(orbital.periodDays)} d` : '—'}
              </span>
            </div>
            <div>
              <span className="text-neutral-400">Periapsis:</span>{' '}
              <span className="text-white">{formatDynamicDistance(orbital.periapsis)}</span>
            </div>
            <div>
              <span className="text-neutral-400">Apoapsis:</span>{' '}
              <span className="text-white">
                {orbital.apoapsis !== null ? formatDynamicDistance(orbital.apoapsis) : '∞'}
              </span>
            </div>
            <div>
              <span className="text-neutral-400">Inclination:</span>{' '}
              <span className="text-white">{orbital.inclinationDeg.toFixed(1)}°</span>
            </div>
            <div>
              <span className="text-neutral-400">Specific Energy:</span>{' '}
              <span className="text-white font-semibold">
                {formatDynamicEnergy(orbital.specificEnergy).value}{' '}
                {formatDynamicEnergy(orbital.specificEnergy).unit}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Editable Physical Parameters (Zero 'e' Notation) */}
      <div className="pt-3 border-t border-neutral-800 space-y-3">
        <span className="text-xs uppercase font-bold text-neutral-300 flex items-center gap-1.5">
          <Sliders size={13} className="text-white" /> Physical Parameters
        </span>

        {/* Mass with Dynamic Unit Selector and Steppers */}
        <div>
          <div className="flex items-center justify-between text-neutral-300 mb-1 text-xs">
            <span className="font-medium">MASS</span>
            <span className="text-white font-bold">{formatDynamicMass(body.mass)}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleStepMass(-1)}
              className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 transition"
              title="Decrease mass"
            >
              <Minus size={13} />
            </button>

            <input
              type="text"
              value={localMassValue}
              onChange={(e) => handleMassInputChange(e.target.value)}
              className="flex-1 px-2.5 py-1.5 bg-black border border-neutral-700 text-white font-mono text-xs focus:outline-none focus:border-white"
            />

            <button
              type="button"
              onClick={() => handleStepMass(1)}
              className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 transition"
              title="Increase mass"
            >
              <Plus size={13} />
            </button>

            <select
              value={massUnit}
              onChange={(e) => setMassUnit(e.target.value as MassUnit)}
              className="px-2 py-1.5 bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none cursor-pointer"
            >
              <option value="solar">M☉ (Solar)</option>
              <option value="jupiter">M_Jup</option>
              <option value="earth">M⊕ (Earth)</option>
              <option value="moon">M_Moon</option>
              <option value="trillion_tonnes">Trillion tonnes</option>
            </select>
          </div>
        </div>

        {/* Physical Radius in Kilometers with Steppers */}
        <div>
          <div className="flex items-center justify-between text-neutral-300 mb-1 text-xs">
            <span className="font-medium">PHYSICAL RADIUS</span>
            <span className="text-white font-bold">{formatRadiusKm(body.radius)}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleStepRadius(-1)}
              className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 transition"
              title="Decrease radius"
            >
              <Minus size={13} />
            </button>

            <input
              type="text"
              value={localRadiusValue}
              onChange={(e) => handleRadiusInputChange(e.target.value)}
              className="flex-1 px-2.5 py-1.5 bg-black border border-neutral-700 text-white font-mono text-xs focus:outline-none focus:border-white"
            />

            <button
              type="button"
              onClick={() => handleStepRadius(1)}
              className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 transition"
              title="Increase radius"
            >
              <Plus size={13} />
            </button>

            <select
              value={radiusUnit}
              onChange={(e) => setRadiusUnit(e.target.value as DistanceUnit)}
              className="px-2 py-1.5 bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none cursor-pointer"
            >
              <option value="km">Kilometers (km)</option>
              <option value="million_km">Million km</option>
              <option value="au">AU</option>
            </select>
          </div>
        </div>

        {/* Viewport Visual Scale */}
        <div>
          <div className="flex justify-between text-neutral-300 mb-1 text-xs">
            <span>3D VISUAL SCALE</span>
            <span className="text-white font-semibold">{body.visualRadius.toFixed(2)} AU</span>
          </div>
          <input
            type="range"
            min="0.02"
            max="1.5"
            step="0.02"
            value={body.visualRadius}
            onChange={(e) => onUpdateBody({ ...body, visualRadius: parseFloat(e.target.value) })}
            className="w-full accent-white h-1.5 bg-neutral-800 cursor-pointer"
          />
        </div>

        {/* Position Vector */}
        <div>
          <span className="text-xs text-neutral-400 block mb-1 font-medium">POSITION [X, Y, Z] (AU)</span>
          <div className="grid grid-cols-3 gap-1.5 font-mono text-xs">
            {(['x', 'y', 'z'] as const).map((axis) => (
              <div key={axis} className="bg-neutral-950 border border-neutral-800 px-2 py-1 text-center">
                <span className="text-neutral-500 uppercase">{axis}: </span>
                <span className="text-white font-semibold">{body.position[axis].toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Velocity Vector */}
        <div>
          <span className="text-xs text-neutral-400 block mb-1 font-medium">VELOCITY [VX, VY, VZ] (AU/YR)</span>
          <div className="grid grid-cols-3 gap-1.5 font-mono text-xs">
            {(['x', 'y', 'z'] as const).map((axis) => (
              <div key={axis} className="bg-neutral-950 border border-neutral-800 px-2 py-1 text-center">
                <span className="text-neutral-500 uppercase">v{axis}: </span>
                <span className="text-white font-semibold">{body.velocity[axis].toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orbital Velocity Operations */}
      <div className="pt-3 border-t border-neutral-800 space-y-2">
        <span className="text-xs uppercase font-bold text-neutral-300 flex items-center gap-1.5">
          <Activity size={13} className="text-white" /> Orbital Maneuvers
        </span>

        <div className="grid grid-cols-3 gap-1.5 text-xs">
          <button
            onClick={() => handleScaleVelocity(1.15)}
            className="py-1.5 px-1 bg-neutral-900 border border-neutral-700 hover:border-white text-neutral-200 hover:text-white transition"
          >
            +15% Spd
          </button>
          <button
            onClick={() => handleScaleVelocity(0.85)}
            className="py-1.5 px-1 bg-neutral-900 border border-neutral-700 hover:border-white text-neutral-200 hover:text-white transition"
          >
            -15% Spd
          </button>
          <button
            onClick={handleReverseVelocity}
            className="py-1.5 px-1 bg-neutral-900 border border-neutral-700 hover:border-white text-neutral-200 hover:text-white transition flex items-center justify-center gap-1"
          >
            <RotateCw size={11} /> 180°
          </button>
        </div>

        {primaryAttractor && (
          <button
            onClick={handleCircularize}
            className="w-full py-2 px-3 bg-white text-black hover:bg-neutral-200 font-bold flex items-center justify-center gap-2 transition text-xs"
          >
            <Gauge size={14} className="text-black" />
            <span>Circularize Orbit vs {primaryAttractor.name}</span>
          </button>
        )}
      </div>

      {/* State Actions: Anchor & Delete */}
      <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
        <button
          onClick={() => onUpdateBody({ ...body, isFixed: !body.isFixed, velocity: { x: 0, y: 0, z: 0 } })}
          className={`flex items-center gap-1.5 px-3 py-1.5 border transition ${
            body.isFixed
              ? 'bg-amber-950/60 border-amber-500 text-amber-300 font-semibold'
              : 'border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white'
          }`}
        >
          {body.isFixed ? <Lock size={12} /> : <Unlock size={12} />}
          <span>{body.isFixed ? 'ANCHORED' : 'DYNAMIC'}</span>
        </button>

        <button
          onClick={() => onDeleteBody(body.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/80 border border-rose-700 hover:bg-rose-900 text-rose-200 font-semibold transition"
        >
          <Trash2 size={12} />
          <span>DELETE</span>
        </button>
      </div>
    </aside>
  );
};
