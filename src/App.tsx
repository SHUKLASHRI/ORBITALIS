import { useState, useRef, useEffect, useCallback } from 'react';
import type { CelestialBody, SimulationConfig, PresetSystem } from './physics/types';
import { G_ASTRONOMICAL, DEFAULT_SOFTENING } from './physics/constants';
import { PhysicsEngine } from './physics/PhysicsEngine';
import { PRESET_SOLAR_SYSTEM } from './presets';
import { ThreeViewport } from './rendering/ThreeViewport';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Inspector } from './components/Inspector';
import { Dashboard } from './components/Dashboard';

export function App() {
  const initialPreset = PRESET_SOLAR_SYSTEM;

  // Simulation Configuration
  const [config, setConfig] = useState<SimulationConfig>({
    G: G_ASTRONOMICAL,
    timeStep: initialPreset.config.timeStep || 0.002,
    subSteps: 8,
    timeMultiplier: 1.0,
    isPaused: false,
    integrator: 'verlet',
    collisionModel: 'merge',
    softening: DEFAULT_SOFTENING,
    trailLength: 80,
    showTrails: true,
    showVectors: true,
    showGrid: true,
    showBarycenter: false,
    showLabels: true,
    renderQuality: 'balanced',
  });

  const [currentPreset, setCurrentPreset] = useState<PresetSystem>(initialPreset);
  const [selectedBodyId, setSelectedBodyId] = useState<string | null>(null);
  const [focusedBodyId, setFocusedBodyId] = useState<string | null>(null);
  const [fps, setFps] = useState<number>(60);

  // Initialize standalone Physics Engine
  const physicsEngineRef = useRef<PhysicsEngine>(
    new PhysicsEngine(initialPreset.bodies, config)
  );

  // Reactive state for UI rendering
  const [bodies, setBodies] = useState<CelestialBody[]>(
    physicsEngineRef.current.getBodies()
  );
  const [measurements, setMeasurements] = useState(
    physicsEngineRef.current.getMeasurements()
  );

  // Sync config updates to Physics Engine
  const handleUpdateConfig = useCallback((updated: Partial<SimulationConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...updated };
      physicsEngineRef.current.setConfig(next);
      return next;
    });
  }, []);

  // Preset Selection
  const handleSelectPreset = useCallback((preset: PresetSystem) => {
    setCurrentPreset(preset);
    physicsEngineRef.current.setBodies(preset.bodies);
    physicsEngineRef.current.resetTime();
    if (preset.config) {
      physicsEngineRef.current.setConfig(preset.config);
      setConfig((prev) => ({ ...prev, ...preset.config }));
    }
    setBodies(physicsEngineRef.current.getBodies());
    setMeasurements(physicsEngineRef.current.getMeasurements());
    setSelectedBodyId(null);
    setFocusedBodyId(null);
  }, []);

  // Reset Simulation
  const handleReset = useCallback(() => {
    physicsEngineRef.current.setBodies(currentPreset.bodies);
    physicsEngineRef.current.resetTime();
    setBodies(physicsEngineRef.current.getBodies());
    setMeasurements(physicsEngineRef.current.getMeasurements());
    setSelectedBodyId(null);
  }, [currentPreset]);

  // Step 1 Frame
  const handleStepFrame = useCallback(() => {
    physicsEngineRef.current.step(0.016);
    setBodies([...physicsEngineRef.current.getBodies()]);
    setMeasurements(physicsEngineRef.current.getMeasurements());
  }, []);

  // Body Management
  const handleUpdateBody = useCallback((updated: CelestialBody) => {
    physicsEngineRef.current.updateBody(updated);
    setBodies([...physicsEngineRef.current.getBodies()]);
  }, []);

  const handleAddBody = useCallback((newBody: CelestialBody) => {
    physicsEngineRef.current.addBody(newBody);
    setBodies([...physicsEngineRef.current.getBodies()]);
  }, []);

  const handleDeleteBody = useCallback((id: string) => {
    physicsEngineRef.current.removeBody(id);
    setBodies([...physicsEngineRef.current.getBodies()]);
    if (selectedBodyId === id) setSelectedBodyId(null);
    if (focusedBodyId === id) setFocusedBodyId(null);
  }, [selectedBodyId, focusedBodyId]);

  // Main High-Frequency Physics Simulation Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let uiThrottleTimer = performance.now();

    const loop = (time: number) => {
      animId = requestAnimationFrame(loop);

      const deltaSeconds = Math.min(0.05, (time - lastTime) / 1000);
      lastTime = time;

      // Advance physics simulation
      const currentBodies = physicsEngineRef.current.step(deltaSeconds);

      // Throttle React UI updates to ~30 FPS to avoid unnecessary DOM re-renders while keeping 3D 60 FPS
      if (time - uiThrottleTimer >= 33) {
        setBodies([...currentBodies]);
        setMeasurements(physicsEngineRef.current.getMeasurements());
        uiThrottleTimer = time;
      }
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Export JSON configuration (OR-21)
  const handleExportJSON = () => {
    const data = {
      name: currentPreset.name,
      timestamp: new Date().toISOString(),
      config,
      bodies: physicsEngineRef.current.getBodies(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orbitalis_${currentPreset.id}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON configuration (OR-21)
  const handleImportJSON = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (data.bodies && Array.isArray(data.bodies)) {
        physicsEngineRef.current.setBodies(data.bodies);
        if (data.config) {
          physicsEngineRef.current.setConfig(data.config);
          setConfig((prev) => ({ ...prev, ...data.config }));
        }
        setBodies(physicsEngineRef.current.getBodies());
        setMeasurements(physicsEngineRef.current.getMeasurements());
      }
    } catch (e) {
      alert(`Invalid JSON simulation file: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  };

  // Export CSV scientific telemetry (OR-22)
  const handleExportCSV = () => {
    const history = measurements.history;
    let csv = 'Time (Years),Kinetic Energy (M_sun*AU^2/yr^2),Potential Energy,Total Energy,Energy Drift (%)\n';
    for (const row of history) {
      csv += `${row.time},${row.kinetic},${row.potential},${row.total},${row.drift}\n`;
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orbitalis_telemetry_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Keyboard Shortcuts: Space (pause), R (reset), Esc (deselect)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'SELECT') {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handleUpdateConfig({ isPaused: !config.isPaused });
      } else if (e.key.toLowerCase() === 'r') {
        handleReset();
      } else if (e.key === 'Escape') {
        setSelectedBodyId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [config.isPaused, handleReset, handleUpdateConfig]);

  const selectedBody = bodies.find((b) => b.id === selectedBodyId) || null;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 select-none">
      {/* Top Header */}
      <Header
        config={config}
        onUpdateConfig={handleUpdateConfig}
        onStepFrame={handleStepFrame}
        onReset={handleReset}
        simulationTimeYears={physicsEngineRef.current.getTimeYears()}
        fps={fps}
        presetName={currentPreset.name}
      />

      {/* Main 3D Simulation Viewport */}
      <main className="absolute inset-0 pt-14 pb-10">
        <ThreeViewport
          bodies={bodies}
          config={config}
          selectedBodyId={selectedBodyId}
          onSelectBody={setSelectedBodyId}
          focusedBodyId={focusedBodyId}
          barycenter={measurements.barycenter}
          onFpsUpdate={setFps}
        />
      </main>

      {/* Left Sidebar (Presets, Hierarchy, Add, JSON/CSV) */}
      <Sidebar
        currentPresetId={currentPreset.id}
        onSelectPreset={handleSelectPreset}
        bodies={bodies}
        selectedBodyId={selectedBodyId}
        onSelectBody={setSelectedBodyId}
        onAddBody={handleAddBody}
        onDeleteBody={handleDeleteBody}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        onExportCSV={handleExportCSV}
      />

      {/* Right Inspector (Physical Properties, Orbit Circularizer, Coordinates) */}
      <Inspector
        body={selectedBody}
        allBodies={bodies}
        G={config.G}
        onUpdateBody={handleUpdateBody}
        onDeleteBody={handleDeleteBody}
        onClose={() => setSelectedBodyId(null)}
        isFocused={focusedBodyId === selectedBodyId}
        onToggleFocus={(id) => setFocusedBodyId(focusedBodyId === id ? null : id)}
      />

      {/* Bottom Scientific Panel (Energy & Momentum Telemetry & Graphs) */}
      <Dashboard
        measurements={measurements}
        config={config}
        fps={fps}
      />
    </div>
  );
}

export default App;
