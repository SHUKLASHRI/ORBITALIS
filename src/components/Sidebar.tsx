import React, { useState } from 'react';
import type { PresetSystem, CelestialBody, BodyType } from '../physics/types';
import { ALL_PRESETS, generateRandomCluster } from '../presets';
import {
  FolderOpen,
  Save,
  FileSpreadsheet,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Search,
  Compass,
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
  const [activeTab, setActiveTab] = useState<'presets' | 'objects' | 'add'>('presets');
  const [searchQuery, setSearchQuery] = useState('');

  // Add body form state
  const [newBodyName, setNewBodyName] = useState('New Planet');
  const [newBodyType, setNewBodyType] = useState<BodyType>('planet');
  const [newBodyMass, setNewBodyMass] = useState(1.0e-5);
  const [newBodyDist, setNewBodyDist] = useState(2.0);
  const [newBodyColor, setNewBodyColor] = useState('#38bdf8');

  const filteredBodies = bodies.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateBody = (e: React.FormEvent) => {
    e.preventDefault();
    const speed = Math.sqrt((4 * Math.PI * Math.PI * 1.0) / Math.max(0.1, newBodyDist));
    const newBody: CelestialBody = {
      id: `body-${Date.now()}`,
      name: newBodyName,
      type: newBodyType,
      mass: newBodyMass,
      radius: newBodyMass > 0.01 ? 0.005 : 4e-5,
      visualRadius: newBodyType === 'star' ? 0.35 : 0.12,
      position: { x: newBodyDist, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: speed },
      color: newBodyColor,
      trail: [],
    };
    onAddBody(newBody);
    onSelectBody(newBody.id);
    setActiveTab('objects');
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="absolute top-14 left-0 bottom-0 z-30 flex pointer-events-none">
      <div
        className={`pointer-events-auto h-full bg-slate-950/90 backdrop-blur-md border-r border-cyan-500/30 shadow-2xl transition-all duration-300 flex flex-col ${
          isOpen ? 'w-64' : 'w-12'
        }`}
      >
        {/* Toggle Ribbon */}
        <div className="px-3 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          {isOpen ? (
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <Compass size={14} /> Astrophysics Lab
            </span>
          ) : (
            <Compass size={18} className="text-cyan-400 mx-auto" />
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {isOpen && (
          <>
            {/* Tabs */}
            <div className="grid grid-cols-3 bg-slate-900 border-b border-slate-800 p-1 text-[11px] font-medium">
              <button
                onClick={() => setActiveTab('presets')}
                className={`py-1.5 rounded-lg transition ${
                  activeTab === 'presets'
                    ? 'bg-slate-800 text-cyan-300 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Presets
              </button>
              <button
                onClick={() => setActiveTab('objects')}
                className={`py-1.5 rounded-lg transition ${
                  activeTab === 'objects'
                    ? 'bg-slate-800 text-cyan-300 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Bodies ({bodies.length})
              </button>
              <button
                onClick={() => setActiveTab('add')}
                className={`py-1.5 rounded-lg transition ${
                  activeTab === 'add'
                    ? 'bg-slate-800 text-cyan-300 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                + Add
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
              {/* TAB 1: PRESETS */}
              {activeTab === 'presets' && (
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Astro Presets
                  </span>
                  {ALL_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => onSelectPreset(p)}
                      className={`w-full text-left p-2.5 rounded-xl border transition ${
                        currentPresetId === p.id
                          ? 'bg-cyan-500/15 border-cyan-400 text-cyan-200 shadow-md'
                          : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="font-semibold text-xs flex items-center justify-between">
                        <span>{p.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {p.bodies.length} b
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">
                        {p.description}
                      </p>
                    </button>
                  ))}

                  {/* 500-Body Stress Test Benchmark */}
                  <div className="pt-2 border-t border-slate-800">
                    <button
                      onClick={() => onSelectPreset(generateRandomCluster(500))}
                      className="w-full py-2 px-3 rounded-xl bg-purple-950/60 border border-purple-600/50 hover:bg-purple-900/70 text-purple-200 font-medium text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <Sparkles size={13} className="text-purple-400" />
                      <span>500-Body Direct Benchmark</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: OBJECT HIERARCHY */}
              {activeTab === 'objects' && (
                <div className="space-y-2">
                  <div className="relative">
                    <Search size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search celestial bodies..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1 max-h-[calc(100vh-320px)] overflow-y-auto">
                    {filteredBodies.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => onSelectBody(b.id)}
                        className={`px-2.5 py-2 rounded-xl flex items-center justify-between cursor-pointer border transition ${
                          selectedBodyId === b.id
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-semibold'
                            : 'border-slate-800/60 bg-slate-900/40 text-slate-300 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: b.color }}
                          />
                          <span className="truncate text-xs">{b.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 font-mono shrink-0">
                            {b.mass >= 0.01 ? `${b.mass.toFixed(1)} M☉` : `${(b.mass * 333000).toFixed(1)} M⊕`}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteBody(b.id);
                            }}
                            className="p-1 hover:text-rose-400 text-slate-500 rounded transition"
                            title="Delete Body"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: ADD CELESTIAL BODY */}
              {activeTab === 'add' && (
                <form onSubmit={handleCreateBody} className="space-y-2.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Spawn Body
                  </span>

                  <div>
                    <label className="text-[10px] text-slate-400">Name</label>
                    <input
                      type="text"
                      value={newBodyName}
                      onChange={(e) => setNewBodyName(e.target.value)}
                      className="w-full mt-0.5 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400">Type</label>
                    <select
                      value={newBodyType}
                      onChange={(e) => setNewBodyType(e.target.value as BodyType)}
                      className="w-full mt-0.5 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                    >
                      <option value="planet">Planet</option>
                      <option value="star">Star</option>
                      <option value="moon">Moon</option>
                      <option value="asteroid">Asteroid</option>
                      <option value="probe">Probe</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400">Mass (Solar Masses)</label>
                    <input
                      type="number"
                      step="any"
                      value={newBodyMass}
                      onChange={(e) => setNewBodyMass(parseFloat(e.target.value) || 0)}
                      className="w-full mt-0.5 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400">Initial Distance (AU)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newBodyDist}
                      onChange={(e) => setNewBodyDist(parseFloat(e.target.value) || 0)}
                      className="w-full mt-0.5 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400">Color</label>
                    <input
                      type="color"
                      value={newBodyColor}
                      onChange={(e) => setNewBodyColor(e.target.value)}
                      className="w-full h-8 mt-0.5 bg-slate-900 border border-slate-800 rounded-xl p-0.5 cursor-pointer"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition active:scale-98 shadow-lg shadow-cyan-500/25"
                  >
                    Insert Into Orbit
                  </button>
                </form>
              )}
            </div>

            {/* Bottom Data Tools (JSON / CSV) */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 grid grid-cols-3 gap-1.5 text-slate-400">
              <button
                onClick={onExportJSON}
                className="py-1.5 rounded-lg hover:bg-slate-800 hover:text-cyan-300 border border-slate-800 flex flex-col items-center justify-center gap-0.5 text-[10px]"
                title="Export System as JSON"
              >
                <Save size={13} />
                <span>JSON</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="py-1.5 rounded-lg hover:bg-slate-800 hover:text-purple-300 border border-slate-800 flex flex-col items-center justify-center gap-0.5 text-[10px]"
                title="Import System from JSON"
              >
                <FolderOpen size={13} />
                <span>Load</span>
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

              <button
                onClick={onExportCSV}
                className="py-1.5 rounded-lg hover:bg-slate-800 hover:text-emerald-300 border border-slate-800 flex flex-col items-center justify-center gap-0.5 text-[10px]"
                title="Export Scientific Measurement Telemetry as CSV"
              >
                <FileSpreadsheet size={13} />
                <span>CSV</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
