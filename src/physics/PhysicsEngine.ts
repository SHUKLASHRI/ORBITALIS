import type { CelestialBody, SimulationConfig, ScientificMeasurements, Vector3D } from './types';
import { stepVerlet, stepEuler, stepRK4 } from './integrators';
import { handleCollisions } from './collision';
import type { CollisionEvent } from './collision';
import { computeMeasurements } from './analysis';

export class PhysicsEngine {
  private bodies: CelestialBody[] = [];
  private config: SimulationConfig;
  private currentTimeYears: number = 0;
  private lastAccelerations: Vector3D[] = [];
  private initialEnergy: number | undefined = undefined;
  private measurements: ScientificMeasurements;
  private onCollisionCallback?: (event: CollisionEvent) => void;

  constructor(initialBodies: CelestialBody[], initialConfig: SimulationConfig) {
    this.bodies = JSON.parse(JSON.stringify(initialBodies));
    this.config = { ...initialConfig };
    this.measurements = computeMeasurements(
      this.bodies,
      this.config.G,
      this.config.softening,
      0
    );
    this.initialEnergy = this.measurements.totalEnergy;
  }

  setBodies(newBodies: CelestialBody[]) {
    this.bodies = JSON.parse(JSON.stringify(newBodies));
    this.lastAccelerations = [];
    this.measurements = computeMeasurements(
      this.bodies,
      this.config.G,
      this.config.softening,
      this.currentTimeYears
    );
    this.initialEnergy = this.measurements.totalEnergy;
  }

  getBodies(): CelestialBody[] {
    return this.bodies;
  }

  updateBody(updated: CelestialBody) {
    const idx = this.bodies.findIndex((b) => b.id === updated.id);
    if (idx !== -1) {
      this.bodies[idx] = { ...updated };
    }
  }

  addBody(body: CelestialBody) {
    this.bodies.push({ ...body });
  }

  removeBody(id: string) {
    this.bodies = this.bodies.filter((b) => b.id !== id);
  }

  setConfig(newConfig: Partial<SimulationConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): SimulationConfig {
    return this.config;
  }

  setOnCollision(cb: (event: CollisionEvent) => void) {
    this.onCollisionCallback = cb;
  }

  getTimeYears(): number {
    return this.currentTimeYears;
  }

  getMeasurements(): ScientificMeasurements {
    return this.measurements;
  }

  resetTime() {
    this.currentTimeYears = 0;
    this.lastAccelerations = [];
    this.measurements = computeMeasurements(
      this.bodies,
      this.config.G,
      this.config.softening,
      0
    );
    this.initialEnergy = this.measurements.totalEnergy;
  }

  /**
   * Advances the physical simulation by one animation frame with numerical sub-stepping
   */
  step(frameDeltaSeconds: number): CelestialBody[] {
    if (this.config.isPaused || this.bodies.length === 0) {
      return this.bodies;
    }

    const subSteps = this.config.subSteps || 6;
    // Real astronomical delta time in Earth years
    // E.g. timeMultiplier = 1 means 1 real second = 1 simulation year
    const frameDt = (frameDeltaSeconds * this.config.timeMultiplier);
    const subDt = frameDt / subSteps;

    const G = this.config.G;
    const softening = this.config.softening;
    const integrator = this.config.integrator;

    for (let step = 0; step < subSteps; step++) {
      if (integrator === 'euler') {
        const res = stepEuler(this.bodies, G, softening, subDt);
        this.bodies = res.bodies;
        this.lastAccelerations = res.accelerations;
      } else if (integrator === 'rk4') {
        const res = stepRK4(this.bodies, G, softening, subDt);
        this.bodies = res.bodies;
        this.lastAccelerations = res.accelerations;
      } else {
        // Default: Velocity Verlet (Symplectic)
        const res = stepVerlet(
          this.bodies,
          G,
          softening,
          subDt,
          this.lastAccelerations.length === this.bodies.length ? this.lastAccelerations : undefined
        );
        this.bodies = res.bodies;
        this.lastAccelerations = res.accelerations;
      }

      // Resolve collisions
      if (this.config.collisionModel !== 'none') {
        this.bodies = handleCollisions(
          this.bodies,
          this.config.collisionModel,
          1.0,
          this.onCollisionCallback
        );
      }

      this.currentTimeYears += subDt;
    }

    // Append orbital trail points
    if (this.config.showTrails) {
      for (let i = 0; i < this.bodies.length; i++) {
        const b = this.bodies[i];
        if (!b.trail) b.trail = [];
        b.trail.push({ x: b.position.x, y: b.position.y, z: b.position.z });
        if (b.trail.length > this.config.trailLength) {
          b.trail.shift();
        }
      }
    }

    // Update scientific telemetry
    this.measurements = computeMeasurements(
      this.bodies,
      G,
      softening,
      this.currentTimeYears,
      this.initialEnergy,
      this.measurements.history
    );

    return this.bodies;
  }
}
