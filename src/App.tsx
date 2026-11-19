import { useState, useRef, useEffect, useCallback } from 'react';
import type { CelestialBody, SimulationConfig, PresetSystem } from './physics/types';
import { G_ASTRONOMICAL, DEFAULT_SOFTENING } from './physics/constants';
import { PhysicsEngine } from './physics/PhysicsEngine';
import { PRESET_SOLAR_SYSTEM } from './presets';
import { ThreeViewport } from './rendering/ThreeViewport';
import { Header } from './components/Header';
import { LeftToolbar } from './components/LeftToolbar';
import { Inspector } from './components/Inspector';
import { PlaybackBar } from './components/PlaybackBar';
import { BottomAnalysis } from './components/BottomAnalysis';
import { StatusBadge } from './components/StatusBadge';
import { SettingsModal } from './components/SettingsModal';
import { AboutModal } from './components/AboutModal';
import { ScenariosModal } from './components/ScenariosModal';

export function App() {
  const initialPreset = PRESET_SOLAR_SYSTEM;

  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<'simulate' | 'analyze' | 'scenarios' | 'about'>('simulate');

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
    showVectors: false,
    showGrid: true,
    showBarycenter: false,
    showLabels: true,
    renderQuality: 'balanced',
    useRealisticTextures: true,
  });

  const [currentPreset, setCurrentPreset] = useState<PresetSystem>(initialPreset);
  const [selectedBodyId, setSelectedBodyId] = useState<string | null>(null);
  const [focusedBodyId, setFocusedBodyId] = useState<string | null>(null);
  const [isFollowingBody, setIsFollowingBody] = useState<boolean>(false);
  const [showAsteroidBelt, setShowAsteroidBelt] = useState<boolean>(true);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [isScenariosOpen, setIsScenariosOpen] = useState<boolean>(false);
  const [fps, setFps] = useState<number>(60);

  // Standalone Physics Engine
  const physicsEngineRef = useRef<PhysicsEngine>(
    new PhysicsEngine(initialPreset.bodies, config)
  );

  // Reactive state for UI
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
    setIsFollowingBody(false);
  }, []);

  // Reset Simulation
  const handleReset = useCallback(() => {
    physicsEngineRef.current.setBodies(currentPreset.bodies);
    physicsEngineRef.current.resetTime();
    setBodies(physicsEngineRef.current.getBodies());
    setMeasurements(physicsEngineRef.current.getMeasurements());
    setSelectedBodyId(null);
    setIsFollowingBody(false);
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
    if (focusedBodyId === id) {
      setFocusedBodyId(null);
      setIsFollowingBody(false);
    }
  }, [selectedBodyId, focusedBodyId]);

  const handleDuplicateBody = useCallback((b: CelestialBody) => {
    const clone: CelestialBody = {
      ...b,
      id: `body-${Date.now()}`,
      name: `${b.name} (Copy)`,
      position: { x: b.position.x * 1.05, y: b.position.y, z: b.position.z * 1.05 },
      velocity: { x: b.velocity.x * 0.98, y: b.velocity.y, z: b.velocity.z * 0.98 },
      trail: [],
    };
    physicsEngineRef.current.addBody(clone);
    setBodies([...physicsEngineRef.current.getBodies()]);
    setSelectedBodyId(clone.id);
  }, []);

  // Focus & Follow Camera
  const handleToggleFocus = useCallback((id: string) => {
    if (focusedBodyId === id) {
      setFocusedBodyId(null);
      setIsFollowingBody(false);
    } else {
      setFocusedBodyId(id);
    }
  }, [focusedBodyId]);

  const handleToggleFollow = useCallback(() => {
    if (!selectedBodyId) return;
    if (isFollowingBody) {
      setIsFollowingBody(false);
    } else {
      setFocusedBodyId(selectedBodyId);
      setIsFollowingBody(true);
    }
  }, [selectedBodyId, isFollowingBody]);

  // Handle Header Tabs
  const handleSelectNavTab = (tab: 'simulate' | 'analyze' | 'scenarios' | 'about') => {
    setCurrentTab(tab);
    if (tab === 'analyze') {
      setIsAnalysisOpen((prev) => !prev);
    } else if (tab === 'scenarios') {
      setIsScenariosOpen(true);
    } else if (tab === 'about') {
      setIsAboutOpen(true);
    }
  };

  // High-Frequency Physics Simulation Loop
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

      // Throttle React UI updates to ~30 FPS
      if (time - uiThrottleTimer >= 33) {
        setBodies([...currentBodies]);
        setMeasurements(physicsEngineRef.current.getMeasurements());
        uiThrottleTimer = time;
      }
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Keyboard Shortcuts
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
        setIsFollowingBody(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [config.isPaused, handleReset, handleUpdateConfig]);

  const selectedBody = bodies.find((b) => b.id === selectedBodyId) || null;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#080B12] text-[#E8EEF7] select-none font-sans">
      {/* 1. Top Navigation Bar */}
      <Header
        currentTab={currentTab}
        onSelectTab={handleSelectNavTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHelp={() => setIsAboutOpen(true)}
      />

      {/* 2. Full-Screen Interactive 3D Viewport */}
      <main className="absolute inset-0">
        <ThreeViewport
          bodies={bodies}
          config={config}
          selectedBodyId={selectedBodyId}
          onSelectBody={setSelectedBodyId}
          focusedBodyId={focusedBodyId}
          isFollowingBody={isFollowingBody}
          barycenter={measurements.barycenter}
          onFpsUpdate={setFps}
          showAsteroidBelt={showAsteroidBelt}
        />
      </main>

      {/* 3. Left Floating Toolstrip */}
      <LeftToolbar
        bodies={bodies}
        selectedBodyId={selectedBodyId}
        onSelectBody={setSelectedBodyId}
        onAddBody={handleAddBody}
        onDeleteBody={handleDeleteBody}
        currentPresetId={currentPreset.id}
        onSelectPreset={handleSelectPreset}
        isFollowingBody={isFollowingBody}
        onToggleFollowBody={handleToggleFollow}
        isAnalysisOpen={isAnalysisOpen}
        onToggleAnalysis={() => setIsAnalysisOpen(!isAnalysisOpen)}
      />

      {/* 4. Right Inspector Panel */}
      {selectedBody && (
        <Inspector
          body={selectedBody}
          allBodies={bodies}
          G={config.G}
          onUpdateBody={handleUpdateBody}
          onDeleteBody={handleDeleteBody}
          onDuplicateBody={handleDuplicateBody}
          onClose={() => setSelectedBodyId(null)}
          isFocused={focusedBodyId === selectedBodyId}
          onToggleFocus={handleToggleFocus}
          isFollowing={isFollowingBody && focusedBodyId === selectedBodyId}
          onToggleFollow={handleToggleFollow}
        />
      )}

      {/* 5. Bottom Left: Floating Analysis Widget */}
      {isAnalysisOpen && (
        <BottomAnalysis
          measurements={measurements}
          simulationTimeYears={physicsEngineRef.current.getTimeYears()}
        />
      )}

      {/* 6. Bottom Center: Floating Playback Controller */}
      <PlaybackBar
        config={config}
        onUpdateConfig={handleUpdateConfig}
        onReset={handleReset}
        onStepFrame={handleStepFrame}
        simulationTimeYears={physicsEngineRef.current.getTimeYears()}
      />

      {/* 7. Bottom Right: Engine Status Badge */}
      <StatusBadge
        bodyCount={bodies.length}
        config={config}
        onUpdateConfig={handleUpdateConfig}
        fps={fps}
      />

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onUpdateConfig={handleUpdateConfig}
        showAsteroidBelt={showAsteroidBelt}
        onToggleAsteroidBelt={() => setShowAsteroidBelt(!showAsteroidBelt)}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      <ScenariosModal
        isOpen={isScenariosOpen}
        onClose={() => setIsScenariosOpen(false)}
        currentPresetId={currentPreset.id}
        onSelectPreset={handleSelectPreset}
      />
    </div>
  );
}

export default App;
