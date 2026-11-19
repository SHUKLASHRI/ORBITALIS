import React, { useState } from 'react';
import type { PresetSystem, CelestialBody, BodyType } from '../physics/types';
import { ALL_PRESETS } from '../presets';
import { formatDynamicMass } from '../physics/units';
import {
  FolderOpen,
  Save,
  FileSpreadsheet,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  FlaskConical,
  Database,
  PlusSquare,
  FileText,
} from 'lucide-react';

interface SidebarProps {
  currentPresetId: string;
  onSelectPreset: (preset: PresetSystem) => void;
  bodies: CelestialBody[];
  selectedBodyId: string | null;
  onSelectBody: (id: string | null) => void;
  onAddBody: (body: CelestialBody) => void;
  onDeleteBody: (id: string) => void;
  onExportJSON: () => void;
  onImportJSON: (file: File) => void;
  onExportCSV: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPresetId,
  onSelectPreset,
  bodies,
  selectedBodyId,
  onSelectBody,
  onAddBody,
  onDeleteBody,
  onExportJSON,
  onImportJSON,
  onExportCSV,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'experiments' | 'catalog' | 'insert' | 'io'>('experiments');
  const [searchQuery, setSearchQuery] = useState('');

  // Manual body insertion form state
  const [name, setName] = useState('New Planetesimal');
  const [type, setType] = useState<BodyType>('planet');
  const [mass, setMass] = useState(3.0e-6); // ~1 Earth mass
  const [posX, setPosX] = useState(2.0);
  const [posY, setPosY] = useState(0.0);
  const [posZ, setPosZ] = useState(0.0);
  const [velX, setVelX] = useState(0.0);
  const [velY, setVelY] = useState(0.0);
  const [velZ, setVelZ] = useState(4.44); // ~sqrt(4*pi^2 / 2)
  const [color, setColor] = useState('#e4e4e7');

  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
    setActiveTab('catalog');
  };

  return (
    <aside className="absolute top-12 left-0 bottom-0 z-30 flex select-none pointer-events-none font-sans">
      <div
        className={`pointer-events-auto h-full bg-black border-r border-neutral-800 flex flex-col transition-all duration-200 shadow-xl ${
          isOpen ? 'w-80' : 'w-10'
        }`}
      >
        {/* Sidebar Header Bar */}
        <div className="h-10 px-3 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between text-xs font-semibold">
          {isOpen ? (
            <span className="text-white uppercase tracking-wider flex items-center gap-2">
              LABORATORY CONTROL
            </span>
          ) : (
            <span className="text-neutral-400 font-bold text-center w-full">»</span>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-neutral-400 hover:text-white p-1 hover:bg-neutral-800 transition"
            title={isOpen ? 'Collapse Navigation' : 'Expand Navigation'}
          >
            {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {isOpen && (
          <>
            {/* Secondary Tabs */}
            <div className="grid grid-cols-4 bg-neutral-950 border-b border-neutral-800 text-xs">
              {[
                { id: 'experiments', label: 'PRESETS', icon: FlaskConical },
                { id: 'catalog', label: `BODIES (${bodies.length})`, icon: Database },
                { id: 'insert', label: 'INSERT', icon: PlusSquare },
                { id: 'io', label: 'EXPORT', icon: FileText },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`py-2.5 px-1.5 flex flex-col items-center gap-1 border-r border-neutral-800 transition ${
                      isActive
                        ? 'bg-neutral-900 text-white font-bold border-b-2 border-b-white'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
                    }`}
                  >
                    <Icon size={14} />
                    <span className="truncate w-full text-center text-xs font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
              {/* TAB 1: EXPERIMENTS & PRESETS */}
              {activeTab === 'experiments' && (
                <div className="space-y-2">
                  <div className="text-xs uppercase text-neutral-400 pb-1.5 border-b border-neutral-800 flex items-center justify-between font-bold">
                    <span>ASTROPHYSICS SYSTEMS</span>
                    <span className="text-white">{ALL_PRESETS.length} Systems</span>
                  </div>

                  {ALL_PRESETS.map((p, idx) => {
                    const isCurrent = currentPresetId === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => onSelectPreset(p)}
                        className={`p-2.5 border cursor-pointer transition text-left ${
                          isCurrent
                            ? 'bg-neutral-900 border-white text-white'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:bg-neutral-900 hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold flex items-center gap-2">
                            <span className="text-neutral-400">0{idx + 1}.</span> {p.name}
                          </span>
                          <span className="text-xs text-white bg-neutral-800 px-1.5 py-0.5 font-mono">
                            {p.bodies.length} b
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-1 leading-snug">
                          {p.description}
                        </p>
                        {p.objective && (
                          <div className="text-xs text-amber-400 mt-1.5 pt-1.5 border-t border-neutral-800 truncate">
                            OBJ: {p.objective}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 2: CATALOG DATA TABLE */}
              {activeTab === 'catalog' && (
                <div className="space-y-2.5">
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-2.5 text-neutral-500" />
                    <input
                      type="text"
                      placeholder="Filter bodies by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1.5 bg-neutral-950 border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                    />
                  </div>

                  <div className="space-y-1 max-h-[calc(100vh-220px)] overflow-y-auto text-xs">
                    {filteredBodies.map((b) => {
                      const isSelected = selectedBodyId === b.id;
                      const speedAU = Math.hypot(b.velocity.x, b.velocity.y, b.velocity.z);
                      return (
                        <div
                          key={b.id}
                          onClick={() => onSelectBody(b.id)}
                          className={`px-2.5 py-2 flex items-center justify-between border cursor-pointer transition ${
                            isSelected
                              ? 'bg-neutral-900 border-white text-white font-semibold'
                              : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:bg-neutral-900'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span
                              className="w-2.5 h-2.5 shrink-0 border border-white/20"
                              style={{ backgroundColor: b.color }}
                            />
                            <span className="truncate">{b.name}</span>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0 font-mono text-xs">
                            <span className="text-neutral-400 font-sans">
                              {formatDynamicMass(b.mass)}
                            </span>
                            <span className="text-white">
                              {(speedAU * 4.74).toFixed(1)} km/s
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteBody(b.id);
                              }}
                              className="text-neutral-500 hover:text-rose-400 p-1"
                              title="Delete Body"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: NUMERICAL BODY INSERTION */}
              {activeTab === 'insert' && (
                <form onSubmit={handleCreateBody} className="space-y-2.5 text-xs">
                  <div className="text-xs uppercase text-neutral-400 pb-1.5 border-b border-neutral-800 font-bold">
                    MANUAL VECTOR INSERTION
                  </div>

                  <div>
                    <label className="text-neutral-400 block font-medium">DESIGNATION / NAME</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 text-white focus:outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="text-neutral-400 block font-medium">CLASSIFICATION</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as BodyType)}
                      className="w-full mt-1 px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 text-white focus:outline-none focus:border-white cursor-pointer"
                    >
                      <option value="planet">Planet (Planetesimal)</option>
                      <option value="star">Star (Solar Mass Core)</option>
                      <option value="moon">Moon (Natural Satellite)</option>
                      <option value="asteroid">Asteroid (Minor Body)</option>
                      <option value="probe">Spacecraft / Probe</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-neutral-400 block font-medium">MASS (M☉ SOLAR UNITS)</label>
                    <input
                      type="number"
                      step="any"
                      value={mass}
                      onChange={(e) => setMass(parseFloat(e.target.value) || 0)}
                      className="w-full mt-1 px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 text-white font-mono focus:outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="text-neutral-400 block font-medium">POSITION [X, Y, Z] (AU)</label>
                    <div className="grid grid-cols-3 gap-1.5 mt-1">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="X"
                        value={posX}
                        onChange={(e) => setPosX(parseFloat(e.target.value) || 0)}
                        className="px-2 py-1.5 bg-neutral-950 border border-neutral-700 text-white text-center font-mono"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Y"
                        value={posY}
                        onChange={(e) => setPosY(parseFloat(e.target.value) || 0)}
                        className="px-2 py-1.5 bg-neutral-950 border border-neutral-700 text-white text-center font-mono"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Z"
                        value={posZ}
                        onChange={(e) => setPosZ(parseFloat(e.target.value) || 0)}
                        className="px-2 py-1.5 bg-neutral-950 border border-neutral-700 text-white text-center font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-neutral-400 block font-medium">VELOCITY [VX, VY, VZ] (AU/YR)</label>
                    <div className="grid grid-cols-3 gap-1.5 mt-1">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Vx"
                        value={velX}
                        onChange={(e) => setVelX(parseFloat(e.target.value) || 0)}
                        className="px-2 py-1.5 bg-neutral-950 border border-neutral-700 text-white text-center font-mono"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Vy"
                        value={velY}
                        onChange={(e) => setVelY(parseFloat(e.target.value) || 0)}
                        className="px-2 py-1.5 bg-neutral-950 border border-neutral-700 text-white text-center font-mono"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Vz"
                        value={velZ}
                        onChange={(e) => setVelZ(parseFloat(e.target.value) || 0)}
                        className="px-2 py-1.5 bg-neutral-950 border border-neutral-700 text-white text-center font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-neutral-400 block font-medium">COLOR IDENTIFIER</label>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full h-8 mt-1 bg-neutral-950 border border-neutral-700 p-0.5 cursor-pointer"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 px-3 bg-white hover:bg-neutral-200 text-black font-bold text-xs uppercase tracking-wider transition"
                  >
                    INSERT INTO SIMULATION
                  </button>
                </form>
              )}

              {/* TAB 4: I/O EXPORT */}
              {activeTab === 'io' && (
                <div className="space-y-3.5 text-xs">
                  <div className="text-xs uppercase text-neutral-400 pb-1.5 border-b border-neutral-800 font-bold">
                    DATA PERSISTENCE & SCIENTIFIC EXPORT
                  </div>

                  <div className="space-y-2">
                    <span className="text-neutral-400 font-medium block">SYSTEM CONFIGURATION (JSON)</span>
                    <button
                      onClick={onExportJSON}
                      className="w-full py-2 px-3 bg-neutral-900 border border-neutral-700 hover:border-white text-white flex items-center justify-between transition"
                    >
                      <span className="flex items-center gap-2">
                        <Save size={14} className="text-white" /> Export Configuration
                      </span>
                      <span className="text-neutral-400 font-mono text-xs">.JSON</span>
                    </button>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2 px-3 bg-neutral-900 border border-neutral-700 hover:border-white text-white flex items-center justify-between transition"
                    >
                      <span className="flex items-center gap-2">
                        <FolderOpen size={14} className="text-amber-400" /> Load Configuration
                      </span>
                      <span className="text-neutral-400 font-mono text-xs">.JSON</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          onImportJSON(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                  </div>

                  <div className="space-y-2 pt-2.5 border-t border-neutral-800">
                    <span className="text-neutral-400 font-medium block">NUMERICAL TELEMETRY LOG (CSV)</span>
                    <button
                      onClick={onExportCSV}
                      className="w-full py-2 px-3 bg-neutral-900 border border-neutral-700 hover:border-white text-white flex items-center justify-between transition"
                    >
                      <span className="flex items-center gap-2">
                        <FileSpreadsheet size={14} className="text-emerald-400" /> Export Telemetry History
                      </span>
                      <span className="text-neutral-400 font-mono text-xs">.CSV</span>
                    </button>
                    <p className="text-neutral-400 text-xs leading-normal">
                      Exports timestamped Kinetic, Potential, and Hamiltonian Energy time-series.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </aside>
  );
};
