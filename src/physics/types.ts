export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export type BodyType = 'star' | 'planet' | 'moon' | 'asteroid' | 'probe' | 'black-hole';

export interface CelestialBody {
  id: string;
  name: string;
  type: BodyType;
  mass: number;           // In Solar Masses (M_sun)
  radius: number;         // Physical radius in AU
  visualRadius: number;   // Exaggerated radius in AU for 3D visibility
  position: Vector3D;     // In AU
  velocity: Vector3D;     // In AU/yr
  color: string;          // Hex or CSS color
  trail: Vector3D[];      // Historical 3D orbital trajectory
  isFixed?: boolean;      // Stationary anchor
  rings?: {
    innerRadius: number;
    outerRadius: number;
    color: string;
  };
}

export type IntegratorType = 'verlet' | 'euler' | 'rk4';
export type CollisionModel = 'merge' | 'bounce' | 'none';

export interface SimulationConfig {
  G: number;                      // Gravitational constant (default: 4*pi^2)
  timeStep: number;               // dt in years per sub-step
  subSteps: number;               // Numerical sub-steps per frame
  timeMultiplier: number;         // Visual speed warp (e.g. 1 yr/s, 0.1 yr/s)
  isPaused: boolean;
  integrator: IntegratorType;
  collisionModel: CollisionModel;
  softening: number;              // Plummer softening (AU)
  trailLength: number;
  showTrails: boolean;
  showVectors: boolean;
  showGrid: boolean;
  showBarycenter: boolean;
  showLabels: boolean;
  renderQuality: 'performance' | 'balanced' | 'high';
}

export interface ScientificMeasurements {
  kineticEnergy: number;          // M_sun * AU^2 / yr^2
  potentialEnergy: number;
  totalEnergy: number;
  initialEnergy: number;
  energyDriftPercent: number;     // (E(t) - E(0)) / |E(0)| * 100%
  linearMomentum: Vector3D;
  totalLinearMomentum: number;
  angularMomentum: Vector3D;
  totalAngularMomentum: number;
  barycenter: Vector3D;
  timeYears: number;
  bodyCount: number;
  history: Array<{
    time: number;
    kinetic: number;
    potential: number;
    total: number;
    drift: number;
  }>;
}

export interface PresetSystem {
  id: string;
  name: string;
  description: string;
  camera: { x: number; y: number; z: number; targetX?: number; targetY?: number; targetZ?: number };
  config: Partial<SimulationConfig>;
  bodies: CelestialBody[];
}
