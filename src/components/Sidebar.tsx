import React, { useState } from 'react';
import type { PresetSystem, CelestialBody, BodyType } from '../physics/types';
import { ALL_PRESETS } from '../presets';
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
  const [color, setColor] = useState('#388bfd');

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
    <aside className="absolute top-11 left-0 bottom-0 z-30 flex select-none pointer-events-none">
      <div
        className={`pointer-events-auto h-full bg-[#090d16] border-r border-[#1b2230] flex flex-col transition-all duration-200 ${
          isOpen ? 'w-72' : 'w-8'
        }`}
      >
        {/* Sidebar Header Bar */}
        <div className="h-8 px-2.5 bg-[#0d111a] border-b border-[#1b2230] flex items-center justify-between text-[11px] font-mono">
          {isOpen ? (
            <span className="font-bold text-[#c9d1d9] uppercase tracking-wider flex items-center gap-1.5">
              LABORATORY CONTROL
            </span>
          ) : (
            <span className="text-[#8b949e] font-bold text-center w-full">»</span>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-[#8b949e] hover:text-[#f0f6fc] p-0.5 hover:bg-[#161b22] transition"
            title={isOpen ? 'Collapse Navigation' : 'Expand Navigation'}
          >
            {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>

        {isOpen && (
          <>
            {/* Secondary Tabs */}
            <div className="grid grid-cols-4 bg-[#090d16] border-b border-[#1b2230] text-[10px] font-mono">
              {[
                { id: 'experiments', label: 'EXPERIMENTS', icon: FlaskConical },
                { id: 'catalog', label: `CATALOG (${bodies.length})`, icon: Database },
                { id: 'insert', label: 'INSERT', icon: PlusSquare },
                { id: 'io', label: 'I/O DATA', icon: FileText },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`py-2 px-1 flex flex-col items-center gap-0.5 border-r border-[#1b2230] transition rounded-none ${
                      isActive
                        ? 'bg-[#161b22] text-[#58a6ff] font-bold border-b-2 border-b-[#388bfd]'
                        : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#0d111a]'
                    }`}
                  >
                    <Icon size={12} />
                    <span className="truncate w-full text-center text-[9px]">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-2 text-xs">
              {/* TAB 1: EXPERIMENTS & PRESETS */}
              {activeTab === 'experiments' && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono uppercase text-[#8b949e] pb-1 border-b border-[#1b2230] flex items-center justify-between">
                    <span>ASTROPHYSICS EXPERIMENT LAB</span>
                    <span className="text-[#388bfd] font-bold">{ALL_PRESETS.length} Systems</span>
                  </div>

                  {ALL_PRESETS.map((p, idx) => {
                    const isCurrent = currentPresetId === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => onSelectPreset(p)}
                        className={`p-2 border cursor-pointer transition text-left ${
                          isCurrent
                            ? 'bg-[#161b22] border-[#388bfd] text-[#f0f6fc]'
                            : 'bg-[#0d111a] border-[#21262d] text-[#c9d1d9] hover:bg-[#161b22] hover:border-[#30363d]'
                        }`}
                      >
                        <div className="flex items-center justify-between font-mono text-[11px]">
                          <span className="font-bold flex items-center gap-1.5">
                            <span className="text-[#8b949e]">0{idx + 1}.</span> {p.name}
                          </span>
                          <span className="text-[10px] text-[#58a6ff] bg-[#1f2937] px-1 rounded-none">
                            {p.bodies.length} b
                          </span>
                        </div>
                        <p className="text-[10px] text-[#8b949e] mt-1 leading-snug line-clamp-2">
                          {p.description}
                        </p>
                        {p.objective && (
                          <div className="text-[9px] font-mono text-[#e3b341] mt-1 pt-1 border-t border-[#1b2230] truncate">
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
                <div className="space-y-2">
                  <div className="relative">
                    <Search size={12} className="absolute left-2.5 top-2 text-[#484f58]" />
                    <input
                      type="text"
                      placeholder="Filter bodies by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-7 pr-2 py-1 bg-[#0d111a] border border-[#21262d] text-xs text-[#f0f6fc] placeholder-[#484f58] font-mono rounded-none focus:outline-none focus:border-[#388bfd]"
                    />
                  </div>

                  <div className="space-y-0.5 max-h-[calc(100vh-200px)] overflow-y-auto font-mono text-[11px]">
                    {filteredBodies.map((b) => {
                      const isSelected = selectedBodyId === b.id;
                      const speedAU = Math.hypot(b.velocity.x, b.velocity.y, b.velocity.z);
                      return (
                        <div
                          key={b.id}
                          onClick={() => onSelectBody(b.id)}
                          className={`px-2 py-1.5 flex items-center justify-between border cursor-pointer transition ${
                            isSelected
                              ? 'bg-[#161b22] border-[#388bfd] text-[#f0f6fc]'
                              : 'bg-[#0d111a] border-[#1b2230] text-[#c9d1d9] hover:bg-[#161b22]'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span
                              className="w-2 h-2 shrink-0 rounded-none"
                              style={{ backgroundColor: b.color }}
                            />
                            <span className="truncate">{b.name}</span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] text-[#8b949e]">
                              {b.mass >= 0.01 ? `${b.mass.toFixed(2)} M☉` : `${(b.mass * 332946).toFixed(1)} M⊕`}
                            </span>
                            <span className="text-[10px] text-[#58a6ff]">
                              {(speedAU * 4.74).toFixed(1)} km/s
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteBody(b.id);
                              }}
                              className="text-[#484f58] hover:text-[#f85149] p-0.5"
                              title="Delete Body"
                            >
                              <Trash2 size={11} />
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
                <form onSubmit={handleCreateBody} className="space-y-2 text-[11px] font-mono">
                  <div className="text-[10px] uppercase text-[#8b949e] pb-1 border-b border-[#1b2230]">
                    MANUAL VECTOR INSERTION
                  </div>

                  <div>
                    <label className="text-[#8b949e] block text-[10px]">DESIGNATION / NAME</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full mt-0.5 px-2 py-1 bg-[#0d111a] border border-[#21262d] text-[#f0f6fc] rounded-none focus:outline-none focus:border-[#388bfd]"
                    />
                  </div>

                  <div>
                    <label className="text-[#8b949e] block text-[10px]">CLASSIFICATION</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as BodyType)}
                      className="w-full mt-0.5 px-2 py-1 bg-[#0d111a] border border-[#21262d] text-[#f0f6fc] rounded-none focus:outline-none focus:border-[#388bfd]"
                    >
                      <option value="planet">Planet (Planetesimal)</option>
                      <option value="star">Star (Solar Mass Core)</option>
                      <option value="moon">Moon (Natural Satellite)</option>
                      <option value="asteroid">Asteroid (Minor Body)</option>
                      <option value="probe">Spacecraft / Probe</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[#8b949e] block text-[10px]">MASS (M_SUN)</label>
                    <input
                      type="number"
                      step="any"
                      value={mass}
                      onChange={(e) => setMass(parseFloat(e.target.value) || 0)}
                      className="w-full mt-0.5 px-2 py-1 bg-[#0d111a] border border-[#21262d] text-[#f0f6fc] rounded-none focus:outline-none focus:border-[#388bfd]"
                    />
                  </div>

                  <div>
                    <label className="text-[#8b949e] block text-[10px]">POSITION VECTOR [X, Y, Z] (AU)</label>
                    <div className="grid grid-cols-3 gap-1 mt-0.5">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="X"
                        value={posX}
                        onChange={(e) => setPosX(parseFloat(e.target.value) || 0)}
                        className="px-1.5 py-1 bg-[#0d111a] border border-[#21262d] text-[#f0f6fc] rounded-none text-center"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Y"
                        value={posY}
                        onChange={(e) => setPosY(parseFloat(e.target.value) || 0)}
                        className="px-1.5 py-1 bg-[#0d111a] border border-[#21262d] text-[#f0f6fc] rounded-none text-center"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Z"
                        value={posZ}
                        onChange={(e) => setPosZ(parseFloat(e.target.value) || 0)}
                        className="px-1.5 py-1 bg-[#0d111a] border border-[#21262d] text-[#f0f6fc] rounded-none text-center"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[#8b949e] block text-[10px]">VELOCITY VECTOR [VX, VY, VZ] (AU/YR)</label>
                    <div className="grid grid-cols-3 gap-1 mt-0.5">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Vx"
                        value={velX}
                        onChange={(e) => setVelX(parseFloat(e.target.value) || 0)}
                        className="px-1.5 py-1 bg-[#0d111a] border border-[#21262d] text-[#f0f6fc] rounded-none text-center"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Vy"
                        value={velY}
                        onChange={(e) => setVelY(parseFloat(e.target.value) || 0)}
                        className="px-1.5 py-1 bg-[#0d111a] border border-[#21262d] text-[#f0f6fc] rounded-none text-center"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Vz"
                        value={velZ}
                        onChange={(e) => setVelZ(parseFloat(e.target.value) || 0)}
                        className="px-1.5 py-1 bg-[#0d111a] border border-[#21262d] text-[#f0f6fc] rounded-none text-center"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[#8b949e] block text-[10px]">COLOR IDENTIFIER</label>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full h-7 mt-0.5 bg-[#0d111a] border border-[#21262d] p-0.5 cursor-pointer rounded-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-1.5 px-3 bg-[#238636] hover:bg-[#2ea043] text-white font-bold text-xs uppercase tracking-wider rounded-none transition"
                  >
                    INSERT INTO SYSTEM
                  </button>
                </form>
              )}

              {/* TAB 4: I/O SCIENTIFIC EXPORT */}
              {activeTab === 'io' && (
                <div className="space-y-3 font-mono text-[11px]">
                  <div className="text-[10px] uppercase text-[#8b949e] pb-1 border-b border-[#1b2230]">
                    DATA PERSISTENCE & SCIENTIFIC EXPORT
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[#8b949e] text-[10px] block">SYSTEM ARCHIVAL (JSON)</span>
                    <button
                      onClick={onExportJSON}
                      className="w-full py-1.5 px-2.5 bg-[#161b22] border border-[#30363d] hover:border-[#58a6ff] text-[#f0f6fc] flex items-center justify-between transition rounded-none"
                    >
                      <span className="flex items-center gap-1.5">
                        <Save size={12} className="text-[#58a6ff]" /> Export Configuration
                      </span>
                      <span className="text-[#8b949e] text-[9px]">.JSON</span>
                    </button>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-1.5 px-2.5 bg-[#161b22] border border-[#30363d] hover:border-[#58a6ff] text-[#f0f6fc] flex items-center justify-between transition rounded-none"
                    >
                      <span className="flex items-center gap-1.5">
                        <FolderOpen size={12} className="text-[#e3b341]" /> Load Configuration
                      </span>
                      <span className="text-[#8b949e] text-[9px]">.JSON</span>
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

                  <div className="space-y-1.5 pt-2 border-t border-[#1b2230]">
                    <span className="text-[#8b949e] text-[10px] block">NUMERICAL TELEMETRY LOG (CSV)</span>
                    <button
                      onClick={onExportCSV}
                      className="w-full py-1.5 px-2.5 bg-[#161b22] border border-[#30363d] hover:border-[#3fb950] text-[#f0f6fc] flex items-center justify-between transition rounded-none"
                    >
                      <span className="flex items-center gap-1.5">
                        <FileSpreadsheet size={12} className="text-[#3fb950]" /> Export Telemetry History
                      </span>
                      <span className="text-[#8b949e] text-[9px]">.CSV</span>
                    </button>
                    <p className="text-[9px] text-[#8b949e] leading-snug">
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
