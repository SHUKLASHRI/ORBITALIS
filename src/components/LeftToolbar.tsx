import React, { useState } from 'react';
import type { CelestialBody, BodyType, PresetSystem } from '../physics/types';
import { ALL_PRESETS } from '../presets';
import { formatDynamicMass } from '../physics/units';
import {
  MousePointer2,
  Plus,
  Orbit,
  Box,
  Camera,
  LineChart,
  Sliders,
  X,
  Search,
  Trash2,
} from 'lucide-react';

interface LeftToolbarProps {
  bodies: CelestialBody[];
  selectedBodyId: string | null;
  onSelectBody: (id: string | null) => void;
  onAddBody: (body: CelestialBody) => void;
  onDeleteBody: (id: string) => void;
  currentPresetId: string;
  onSelectPreset: (preset: PresetSystem) => void;
  isFollowingBody: boolean;
  onToggleFollowBody: () => void;
  isAnalysisOpen: boolean;
  onToggleAnalysis: () => void;
  onOpenEditSimulation: () => void;
}

export const LeftToolbar: React.FC<LeftToolbarProps> = ({
  bodies,
  selectedBodyId,
  onSelectBody,
  onAddBody,
  onDeleteBody,
  currentPresetId,
  onSelectPreset,
  isFollowingBody,
  onToggleFollowBody,
  isAnalysisOpen,
  onToggleAnalysis,
  onOpenEditSimulation,
}) => {
  const [activeFlyout, setActiveFlyout] = useState<'hierarchy' | 'add' | 'presets' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Add Body Form state
  const [name, setName] = useState('New Planetesimal');
  const [type, setType] = useState<BodyType>('planet');
  const [mass, setMass] = useState(3.0e-6);
  const [posX, setPosX] = useState(2.0);
  const [posY, setPosY] = useState(0.0);
  const [posZ, setPosZ] = useState(0.0);
  const [velX, setVelX] = useState(0.0);
  const [velY, setVelY] = useState(0.0);
  const [velZ, setVelZ] = useState(4.44);
  const [color, setColor] = useState('#8797FF');

  const filteredBodies = bodies.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateBody = (e: React.FormEvent) => {
    e.preventDefault();
    const newBody: CelestialBody = {
      id: `body-${Date.now()}`,
      name,
      type,
      mass: Math.max(1e-12, mass),
      radius: mass > 0.01 ? 0.005 : 4e-5,
      visualRadius: type === 'star' ? 0.35 : 0.12,
      position: { x: posX, y: posY, z: posZ },
      velocity: { x: velX, y: velY, z: velZ },
      color,
      trail: [],
    };
    onAddBody(newBody);
    onSelectBody(newBody.id);
    setActiveFlyout('hierarchy');
  };

  return (
    <div className="absolute top-20 left-4 z-30 flex items-start gap-2.5 pointer-events-none select-none font-sans">
      {/* Floating Vertical Icon Rack */}
      <div className="pointer-events-auto flex flex-col items-center bg-[#101722]/90 backdrop-blur-md border border-[#263447] p-1.5 rounded-xl shadow-xl space-y-1">
        {/* 1. Selection / Pointer */}
        <button
          onClick={() => setActiveFlyout(null)}
          className={`p-2 rounded-lg transition ${
            activeFlyout === null
              ? 'bg-[#8797FF]/20 text-[#8797FF] border border-[#8797FF]/40'
              : 'text-[#8E9BAD] hover:text-[#E8EEF7] hover:bg-[#141E2B]'
          }`}
          title="Select Body Mode"
        >
          <MousePointer2 size={16} />
        </button>

        {/* 2. Add Celestial Body */}
        <button
          onClick={() => setActiveFlyout(activeFlyout === 'add' ? null : 'add')}
          className={`p-2 rounded-lg transition ${
            activeFlyout === 'add'
              ? 'bg-[#8797FF]/20 text-[#8797FF] border border-[#8797FF]/40'
              : 'text-[#8E9BAD] hover:text-[#E8EEF7] hover:bg-[#141E2B]'
          }`}
          title="Add Celestial Body (+)"
        >
          <Plus size={16} />
        </button>

        {/* 3. Celestial Hierarchy */}
        <button
          onClick={() => setActiveFlyout(activeFlyout === 'hierarchy' ? null : 'hierarchy')}
          className={`p-2 rounded-lg transition ${
            activeFlyout === 'hierarchy'
              ? 'bg-[#8797FF]/20 text-[#8797FF] border border-[#8797FF]/40'
              : 'text-[#8E9BAD] hover:text-[#E8EEF7] hover:bg-[#141E2B]'
          }`}
          title="Object Hierarchy & List"
        >
          <Orbit size={16} />
        </button>

        {/* 4. Edit Simulation & Physics */}
        <button
          onClick={onOpenEditSimulation}
          className="p-2 rounded-lg text-[#8797FF] hover:text-white hover:bg-[#8797FF]/20 transition"
          title="Edit Simulation & Physics Parameters"
        >
          <Sliders size={16} />
        </button>

        {/* 5. Presets / Scenarios */}
        <button
          onClick={() => setActiveFlyout(activeFlyout === 'presets' ? null : 'presets')}
          className={`p-2 rounded-lg transition ${
            activeFlyout === 'presets'
              ? 'bg-[#8797FF]/20 text-[#8797FF] border border-[#8797FF]/40'
              : 'text-[#8E9BAD] hover:text-[#E8EEF7] hover:bg-[#141E2B]'
          }`}
          title="Scenarios & Presets"
        >
          <Box size={16} />
        </button>

        {/* 6. Camera Follow Toggle */}
        <button
          onClick={onToggleFollowBody}
          disabled={!selectedBodyId}
          className={`p-2 rounded-lg transition disabled:opacity-30 ${
            isFollowingBody
              ? 'bg-[#53D6A0]/20 text-[#53D6A0] border border-[#53D6A0]/40'
              : 'text-[#8E9BAD] hover:text-[#E8EEF7] hover:bg-[#141E2B]'
          }`}
          title={isFollowingBody ? 'Cancel Follow Camera' : 'Follow Selected Body with Camera'}
        >
          <Camera size={16} />
        </button>

        {/* 7. Analysis Toggle */}
        <button
          onClick={onToggleAnalysis}
          className={`p-2 rounded-lg transition ${
            isAnalysisOpen
              ? 'bg-[#8797FF]/20 text-[#8797FF] border border-[#8797FF]/40'
              : 'text-[#8E9BAD] hover:text-[#E8EEF7] hover:bg-[#141E2B]'
          }`}
          title="Toggle Scientific Analysis Graph"
        >
          <LineChart size={16} />
        </button>
      </div>

      {/* Floating Flyout Panel when an icon is active */}
      {activeFlyout && (
        <div className="pointer-events-auto w-76 bg-[#101722]/95 backdrop-blur-md border border-[#263447] rounded-xl p-3 shadow-2xl text-xs text-[#E8EEF7]">
          {/* Flyout Header */}
          <div className="flex items-center justify-between border-b border-[#263447] pb-2 mb-2.5">
            <span className="font-display font-semibold text-xs tracking-[0.14em] uppercase text-[#E8EEF7]">
              {activeFlyout === 'hierarchy' && `Celestial Hierarchy (${bodies.length})`}
              {activeFlyout === 'add' && 'Create Celestial Body'}
              {activeFlyout === 'presets' && 'Astrophysics Scenarios'}
            </span>
            <button
              onClick={() => setActiveFlyout(null)}
              className="text-[#8E9BAD] hover:text-[#E8EEF7] p-1 rounded-md transition"
            >
              <X size={14} />
            </button>
          </div>

          {/* 1. HIERARCHY */}
          {activeFlyout === 'hierarchy' && (
            <div className="space-y-2">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-2 text-[#8E9BAD]" />
                <input
                  type="text"
                  placeholder="Filter objects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-7 pr-2 py-1 bg-[#141E2B] border border-[#263447] text-xs text-[#E8EEF7] rounded-lg focus:outline-none focus:border-[#8797FF]"
                />
              </div>

              <div className="space-y-1 max-h-72 overflow-y-auto">
                {filteredBodies.map((b) => {
                  const isSelected = selectedBodyId === b.id;
                  const speedAU = Math.hypot(b.velocity.x, b.velocity.y, b.velocity.z);
                  return (
                    <div
                      key={b.id}
                      onClick={() => onSelectBody(b.id)}
                      className={`px-2.5 py-1.5 flex items-center justify-between rounded-lg border cursor-pointer transition ${
                        isSelected
                          ? 'bg-[#8797FF]/15 border-[#8797FF]/60 text-white font-medium'
                          : 'bg-[#141E2B]/50 border-transparent text-[#8E9BAD] hover:bg-[#141E2B] hover:text-[#E8EEF7]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: b.color }}
                        />
                        <span className="truncate">{b.name}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
                        <span className="text-[#8E9BAD] font-sans">{formatDynamicMass(b.mass)}</span>
                        <span className="text-[#5FD5E8]">{(speedAU * 4.74).toFixed(1)} km/s</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteBody(b.id);
                          }}
                          className="text-[#8E9BAD] hover:text-rose-400 p-0.5"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. ADD BODY */}
          {activeFlyout === 'add' && (
            <form onSubmit={handleCreateBody} className="space-y-2">
              <div>
                <label className="text-[#8E9BAD] block text-xs mb-0.5">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-2 py-1 bg-[#141E2B] border border-[#263447] rounded-lg text-[#E8EEF7] focus:outline-none focus:border-[#8797FF]"
                />
              </div>

              <div>
                <label className="text-[#8E9BAD] block text-xs mb-0.5">Classification</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as BodyType)}
                  className="w-full px-2 py-1 bg-[#141E2B] border border-[#263447] rounded-lg text-[#E8EEF7] focus:outline-none focus:border-[#8797FF]"
                >
                  <option value="planet">Planet</option>
                  <option value="star">Star</option>
                  <option value="moon">Moon</option>
                  <option value="asteroid">Asteroid</option>
                  <option value="probe">Spacecraft / Probe</option>
                </select>
              </div>

              <div>
                <label className="text-[#8E9BAD] block text-xs mb-0.5">Mass (Solar Units M☉)</label>
                <input
                  type="number"
                  step="any"
                  value={mass}
                  onChange={(e) => setMass(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-[#141E2B] border border-[#263447] rounded-lg text-[#E8EEF7] font-mono focus:outline-none focus:border-[#8797FF]"
                />
              </div>

              <div>
                <label className="text-[#8E9BAD] block text-xs mb-0.5">Position Vector [X, Y, Z] (AU)</label>
                <div className="grid grid-cols-3 gap-1">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="X"
                    value={posX}
                    onChange={(e) => setPosX(parseFloat(e.target.value) || 0)}
                    className="px-1.5 py-1 bg-[#141E2B] border border-[#263447] rounded-lg text-center text-[#E8EEF7] font-mono"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Y"
                    value={posY}
                    onChange={(e) => setPosY(parseFloat(e.target.value) || 0)}
                    className="px-1.5 py-1 bg-[#141E2B] border border-[#263447] rounded-lg text-center text-[#E8EEF7] font-mono"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Z"
                    value={posZ}
                    onChange={(e) => setPosZ(parseFloat(e.target.value) || 0)}
                    className="px-1.5 py-1 bg-[#141E2B] border border-[#263447] rounded-lg text-center text-[#E8EEF7] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#8E9BAD] block text-xs mb-0.5">Velocity Vector [Vx, Vy, Vz] (AU/yr)</label>
                <div className="grid grid-cols-3 gap-1">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Vx"
                    value={velX}
                    onChange={(e) => setVelX(parseFloat(e.target.value) || 0)}
                    className="px-1.5 py-1 bg-[#141E2B] border border-[#263447] rounded-lg text-center text-[#E8EEF7] font-mono"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Vy"
                    value={velY}
                    onChange={(e) => setVelY(parseFloat(e.target.value) || 0)}
                    className="px-1.5 py-1 bg-[#141E2B] border border-[#263447] rounded-lg text-center text-[#E8EEF7] font-mono"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Vz"
                    value={velZ}
                    onChange={(e) => setVelZ(parseFloat(e.target.value) || 0)}
                    className="px-1.5 py-1 bg-[#141E2B] border border-[#263447] rounded-lg text-center text-[#E8EEF7] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#8E9BAD] block text-xs mb-0.5">Color Identifier</label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full h-7 bg-[#141E2B] border border-[#263447] rounded-lg p-0.5 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                className="w-full py-1.5 bg-[#8797FF] hover:bg-[#97a5ff] text-[#080B12] font-medium text-xs rounded-lg transition tracking-wide font-sans shadow-md"
              >
                Insert Celestial Body
              </button>
            </form>
          )}

          {/* 3. PRESETS */}
          {activeFlyout === 'presets' && (
            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {ALL_PRESETS.map((p) => {
                const isCurrent = currentPresetId === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      onSelectPreset(p);
                      setActiveFlyout(null);
                    }}
                    className={`p-2 rounded-lg border cursor-pointer transition ${
                      isCurrent
                        ? 'bg-[#8797FF]/15 border-[#8797FF]/60 text-white font-medium'
                        : 'bg-[#141E2B]/50 border-transparent text-[#8E9BAD] hover:bg-[#141E2B] hover:text-[#E8EEF7]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display font-semibold text-xs tracking-wide text-[#E8EEF7]">{p.name}</span>
                      <span className="text-[10px] text-[#8797FF] font-mono tabular-nums">{p.bodies.length} bodies</span>
                    </div>
                    <p className="text-[11px] text-[#8E9BAD] mt-0.5 line-clamp-2 leading-tight font-sans">
                      {p.description}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
