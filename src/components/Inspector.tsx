import React, { useState, useEffect } from 'react';
import type { CelestialBody } from '../physics/types';
import { AU_PER_YR_TO_KM_PER_S } from '../physics/constants';
import { computeOrbitalElements } from '../physics/orbital';
import {
  formatDynamicMass,
  formatDynamicDistance,
  formatRadiusKm,
  formatDynamicEnergy,
  formatDynamicMomentum,
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
  Copy,
  Video,
  Lock,
  Unlock,
  Gauge,
  Sliders,
  Plus,
  Minus,
} from 'lucide-react';

interface InspectorProps {
  body: CelestialBody | null;
  allBodies: CelestialBody[];
  G: number;
  onUpdateBody: (updated: CelestialBody) => void;
  onDeleteBody: (id: string) => void;
  onDuplicateBody: (body: CelestialBody) => void;
  onClose: () => void;
  isFocused: boolean;
  onToggleFocus: (id: string) => void;
  isFollowing: boolean;
  onToggleFollow: () => void;
  onOpenEditSimulation?: () => void;
}

export const Inspector: React.FC<InspectorProps> = ({
  body,
  allBodies,
  G,
  onUpdateBody,
  onDeleteBody,
  onDuplicateBody,
  onClose,
  isFocused,
  onToggleFocus,
  isFollowing,
  onToggleFollow,
  onOpenEditSimulation,
}) => {
  if (!body) return null;

  const [activeTab, setActiveTab] = useState<'properties' | 'orbit' | 'advanced'>('properties');

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

  const handleRadiusInputChange = (text: string) => {
    setLocalRadiusValue(text);
    const num = parseFloat(text);
    if (!isNaN(num) && num > 0) {
      const newAU = convertRadiusToAU(num, radiusUnit);
      onUpdateBody({ ...body, radius: newAU });
    }
  };

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
  const speedMs = speedKms * 1000;

  const distToPrimaryAU = primaryAttractor
    ? Math.hypot(
        body.position.x - primaryAttractor.position.x,
        body.position.y - primaryAttractor.position.y,
        body.position.z - primaryAttractor.position.z
      )
    : Math.hypot(body.position.x, body.position.y, body.position.z);

  const escapeVelocityKms = primaryAttractor && distToPrimaryAU > 0.001
    ? Math.sqrt((2 * G * primaryAttractor.mass) / distToPrimaryAU) * AU_PER_YR_TO_KM_PER_S
    : 0;

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

  return (
    <aside className="absolute top-20 right-4 z-30 w-84 bg-[#101722]/95 backdrop-blur-md border border-[#263447] rounded-xl p-4 shadow-2xl text-xs text-[#E8EEF7] select-none font-sans">
      {/* Header: Avatar, Name, Type, Close */}
      <div className="flex items-center justify-between pb-3 border-b border-[#263447]">
        <div className="flex items-center gap-2.5 truncate">
          {/* Avatar Thumbnail */}
          <div
            className="w-8 h-8 rounded-full border border-white/30 shrink-0 overflow-hidden flex items-center justify-center shadow-md"
            style={{ backgroundColor: body.color }}
          >
            {body.textureUrl ? (
              <img
                src={body.textureUrl}
                alt={body.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full rounded-full opacity-80" />
            )}
          </div>

          <div className="truncate">
            <h2 className="font-display font-semibold text-sm tracking-wider text-[#E8EEF7] truncate">{body.name}</h2>
            <p className="font-sans text-[11px] text-[#8E9BAD] capitalize tracking-wide">
              {body.type} • <span className="text-[#8797FF] font-medium">Selected</span>
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-[#8E9BAD] hover:text-[#E8EEF7] hover:bg-[#141E2B] rounded-lg transition"
          title="Deselect"
        >
          <X size={15} />
        </button>
      </div>

      {/* Segmented Tabs: Properties / Orbit / Advanced */}
      <div className="grid grid-cols-3 bg-[#141E2B] p-0.5 rounded-lg my-3 border border-[#263447]">
        {[
          { id: 'properties', label: 'Properties' },
          { id: 'orbit', label: 'Orbit' },
          { id: 'advanced', label: 'Advanced' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-1 text-xs rounded-md transition font-medium ${
                isActive
                  ? 'bg-[#8797FF]/20 text-[#8797FF] font-semibold border border-[#8797FF]/40 shadow-sm'
                  : 'text-[#8E9BAD] hover:text-[#E8EEF7]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: PROPERTIES (DIRECTLY EDITABLE) */}
      {activeTab === 'properties' && (
        <div className="space-y-3 text-xs">
          {/* Editable Mass */}
          <div>
            <div className="flex items-center justify-between text-[#8E9BAD] mb-1">
              <span className="font-medium">Mass</span>
              <span className="font-mono text-[#E8EEF7] font-semibold">{formatDynamicMass(body.mass)}</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleStepMass(-1)}
                className="p-1.5 bg-[#141E2B] hover:bg-[#1f2d3d] text-[#E8EEF7] border border-[#263447] rounded-lg transition"
                title="Decrease Mass"
              >
                <Minus size={12} />
              </button>

              <input
                type="text"
                value={localMassValue}
                onChange={(e) => handleMassInputChange(e.target.value)}
                className="flex-1 px-2 py-1 bg-[#141E2B] border border-[#263447] text-[#E8EEF7] font-mono rounded-lg focus:outline-none focus:border-[#8797FF]"
              />

              <button
                type="button"
                onClick={() => handleStepMass(1)}
                className="p-1.5 bg-[#141E2B] hover:bg-[#1f2d3d] text-[#E8EEF7] border border-[#263447] rounded-lg transition"
                title="Increase Mass"
              >
                <Plus size={12} />
              </button>

              <select
                value={massUnit}
                onChange={(e) => setMassUnit(e.target.value as MassUnit)}
                className="px-2 py-1 bg-[#141E2B] border border-[#263447] text-[#E8EEF7] rounded-lg focus:outline-none cursor-pointer"
              >
                <option value="solar">M☉ (Solar)</option>
                <option value="jupiter">M_Jup</option>
                <option value="earth">M⊕ (Earth)</option>
                <option value="moon">M_Moon</option>
                <option value="trillion_tonnes">Trillion tonnes</option>
              </select>
            </div>
          </div>

          {/* Editable Radius */}
          <div>
            <div className="flex items-center justify-between text-[#8E9BAD] mb-1">
              <span className="font-medium">Physical Radius</span>
              <span className="font-mono text-[#E8EEF7] font-semibold">{formatRadiusKm(body.radius)}</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleStepRadius(-1)}
                className="p-1.5 bg-[#141E2B] hover:bg-[#1f2d3d] text-[#E8EEF7] border border-[#263447] rounded-lg transition"
                title="Decrease Radius"
              >
                <Minus size={12} />
              </button>

              <input
                type="text"
                value={localRadiusValue}
                onChange={(e) => handleRadiusInputChange(e.target.value)}
                className="flex-1 px-2 py-1 bg-[#141E2B] border border-[#263447] text-[#E8EEF7] font-mono rounded-lg focus:outline-none focus:border-[#8797FF]"
              />

              <button
                type="button"
                onClick={() => handleStepRadius(1)}
                className="p-1.5 bg-[#141E2B] hover:bg-[#1f2d3d] text-[#E8EEF7] border border-[#263447] rounded-lg transition"
                title="Increase Radius"
              >
                <Plus size={12} />
              </button>

              <select
                value={radiusUnit}
                onChange={(e) => setRadiusUnit(e.target.value as DistanceUnit)}
                className="px-2 py-1 bg-[#141E2B] border border-[#263447] text-[#E8EEF7] rounded-lg focus:outline-none cursor-pointer"
              >
                <option value="km">km</option>
                <option value="million_km">M km</option>
                <option value="au">AU</option>
              </select>
            </div>
          </div>

          {/* Position (x, y, z) */}
          <div>
            <span className="text-[#8E9BAD] block mb-1">Position Vector [X, Y, Z] (AU)</span>
            <div className="grid grid-cols-3 gap-1 font-mono text-[11px]">
              {(['x', 'y', 'z'] as const).map((axis) => (
                <div key={axis} className="bg-[#141E2B] border border-[#263447] rounded-lg px-2 py-1 text-center">
                  <span className="text-[#8E9BAD]">{axis}:</span>{' '}
                  <span className="text-[#E8EEF7] font-medium">{body.position[axis].toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Velocity (vx, vy, vz) */}
          <div>
            <span className="text-[#8E9BAD] block mb-1">Velocity Vector [Vx, Vy, Vz] (AU/yr)</span>
            <div className="grid grid-cols-3 gap-1 font-mono text-[11px]">
              {(['x', 'y', 'z'] as const).map((axis) => (
                <div key={axis} className="bg-[#141E2B] border border-[#263447] rounded-lg px-2 py-1 text-center">
                  <span className="text-[#8E9BAD]">v{axis}:</span>{' '}
                  <span className="text-[#5FD5E8] font-medium">{body.velocity[axis].toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Speed */}
          <div className="flex items-center justify-between py-1 bg-[#141E2B]/50 px-2 rounded-lg border border-[#263447]/60">
            <span className="text-[#8E9BAD]">Orbital Speed</span>
            <span className="font-mono text-[#E8EEF7] font-semibold">
              {speedKms.toFixed(2)} km/s <span className="text-[#8E9BAD] font-normal">({Math.round(speedMs).toLocaleString()} m/s)</span>
            </span>
          </div>
        </div>
      )}

      {/* TAB 2: ORBIT */}
      {activeTab === 'orbit' && (
        <div className="space-y-2 text-xs">
          {orbital && primaryAttractor ? (
            <>
              <div className="flex items-center justify-between py-1 border-b border-[#263447]/60">
                <span className="text-[#8E9BAD]">Primary Attractor</span>
                <span className="text-[#E8EEF7] font-medium">{primaryAttractor.name}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[#263447]/60">
                <span className="text-[#8E9BAD]">Orbital Distance</span>
                <span className="font-mono text-[#E8EEF7]">{distToPrimaryAU.toFixed(3)} AU</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[#263447]/60">
                <span className="text-[#8E9BAD]">Orbital Period (T)</span>
                <span className="font-mono text-[#E8EEF7]">
                  {orbital.periodDays !== null
                    ? `${orbital.periodDays.toFixed(1)} days (${orbital.periodYears?.toFixed(2)} yr)`
                    : 'Escape'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[#263447]/60">
                <span className="text-[#8E9BAD]">Eccentricity (e)</span>
                <span className="font-mono text-[#5FD5E8]">{orbital.eccentricity.toFixed(4)}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[#263447]/60">
                <span className="text-[#8E9BAD]">Periapsis</span>
                <span className="font-mono text-[#E8EEF7]">{formatDynamicDistance(orbital.periapsis)}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[#263447]/60">
                <span className="text-[#8E9BAD]">Apoapsis</span>
                <span className="font-mono text-[#E8EEF7]">
                  {orbital.apoapsis !== null ? formatDynamicDistance(orbital.apoapsis) : '∞'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[#263447]/60">
                <span className="text-[#8E9BAD]">Escape Velocity</span>
                <span className="font-mono text-[#E8B86B]">{escapeVelocityKms.toFixed(2)} km/s</span>
              </div>

              <button
                onClick={handleCircularize}
                className="w-full mt-2 py-1.5 bg-[#141E2B] hover:bg-[#8797FF]/20 text-[#8797FF] border border-[#263447] hover:border-[#8797FF]/50 rounded-lg font-medium flex items-center justify-center gap-1.5 transition"
              >
                <Gauge size={13} />
                <span>Circularize Orbit vs {primaryAttractor.name}</span>
              </button>
            </>
          ) : (
            <p className="text-center text-[#8E9BAD] py-4">No dominant primary attractor found.</p>
          )}
        </div>
      )}

      {/* TAB 3: ADVANCED */}
      {activeTab === 'advanced' && (
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between py-1 border-b border-[#263447]/60">
            <span className="text-[#8E9BAD]">Specific Energy</span>
            <span className="font-mono text-[#E8EEF7]">
              {orbital ? formatDynamicEnergy(orbital.specificEnergy).value : '0.00'}{' '}
              {orbital ? formatDynamicEnergy(orbital.specificEnergy).unit : ''}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-[#263447]/60">
            <span className="text-[#8E9BAD]">Angular Momentum |L|</span>
            <span className="font-mono text-[#E8B86B]">
              {formatDynamicMomentum(speedAU * distToPrimaryAU * body.mass, true)}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-[#263447]/60">
            <span className="text-[#8E9BAD]">Collision Dynamics</span>
            <span className="text-[#53D6A0] font-medium">Inelastic Merger</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-[#8E9BAD]">State</span>
            <button
              onClick={() => onUpdateBody({ ...body, isFixed: !body.isFixed, velocity: { x: 0, y: 0, z: 0 } })}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition ${
                body.isFixed
                  ? 'bg-[#E8B86B]/20 border-[#E8B86B]/50 text-[#E8B86B] font-medium'
                  : 'bg-[#141E2B] border-[#263447] text-[#8E9BAD] hover:text-[#E8EEF7]'
              }`}
            >
              {body.isFixed ? <Lock size={12} /> : <Unlock size={12} />}
              <span>{body.isFixed ? 'Anchored' : 'Dynamic'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions Grid */}
      <div className="mt-4 pt-3 border-t border-[#263447] space-y-2">
        <span className="font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8E9BAD] block">
          Quick Actions
        </span>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => onToggleFocus(body.id)}
            className={`py-2 px-2.5 rounded-lg border text-xs flex items-center justify-center gap-1.5 transition font-medium ${
              isFocused
                ? 'bg-[#8797FF]/20 border-[#8797FF]/60 text-[#8797FF]'
                : 'bg-[#141E2B] border-[#263447] text-[#E8EEF7] hover:bg-[#1a2636]'
            }`}
          >
            <Target size={14} />
            <span>Focus</span>
          </button>

          <button
            onClick={onToggleFollow}
            className={`py-2 px-2.5 rounded-lg border text-xs flex items-center justify-center gap-1.5 transition font-medium ${
              isFollowing
                ? 'bg-[#53D6A0]/20 border-[#53D6A0]/60 text-[#53D6A0]'
                : 'bg-[#141E2B] border-[#263447] text-[#E8EEF7] hover:bg-[#1a2636]'
            }`}
          >
            <Video size={14} />
            <span>Follow</span>
          </button>

          <button
            onClick={() => onDuplicateBody(body)}
            className="py-2 px-2.5 bg-[#141E2B] border border-[#263447] hover:bg-[#1a2636] text-[#E8EEF7] rounded-lg text-xs flex items-center justify-center gap-1.5 transition font-medium"
          >
            <Copy size={14} />
            <span>Duplicate</span>
          </button>

          <button
            onClick={() => onDeleteBody(body.id)}
            className="py-2 px-2.5 bg-[#141E2B] border border-[#263447] hover:bg-rose-950/40 hover:border-rose-600/50 text-rose-300 rounded-lg text-xs flex items-center justify-center gap-1.5 transition font-medium"
          >
            <Trash2 size={14} />
            <span>Remove</span>
          </button>
        </div>

        {onOpenEditSimulation && (
          <button
            onClick={onOpenEditSimulation}
            className="w-full mt-1.5 py-1.5 bg-[#141E2B] hover:bg-[#8797FF]/20 text-[#8797FF] hover:text-white border border-[#263447] hover:border-[#8797FF]/50 rounded-lg transition flex items-center justify-center gap-1.5 text-xs font-medium"
          >
            <Sliders size={13} />
            <span>Edit Global Simulation Parameters</span>
          </button>
        )}
      </div>
    </aside>
  );
};
