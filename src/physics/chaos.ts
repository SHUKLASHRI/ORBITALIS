import type { CelestialBody, SimulationConfig } from './types';
import { stepVerlet } from './integrators';

export interface ChaosDivergencePoint {
  timeYears: number;
  divergenceAU: number;
  logDivergence: number;
}

export class ChaosExperiment {
  private unperturbedBodies: CelestialBody[] = [];
  private perturbedBodies: CelestialBody[] = [];
  private history: ChaosDivergencePoint[] = [];
  private initialSeparation: number = 1e-6; // 10^-6 perturbation
  private trackingBodyId: string = '';

  constructor(initialBodies: CelestialBody[], trackingBodyId?: string) {
    this.reset(initialBodies, trackingBodyId);
  }

  reset(initialBodies: CelestialBody[], trackingBodyId?: string) {
    this.unperturbedBodies = JSON.parse(JSON.stringify(initialBodies));
    this.perturbedBodies = JSON.parse(JSON.stringify(initialBodies));
    this.history = [];

    // Target tracking body (first non-star or second body)
    const target = trackingBodyId
      ? this.perturbedBodies.find(b => b.id === trackingBodyId)
      : this.perturbedBodies[1] || this.perturbedBodies[0];

    if (target) {
      this.trackingBodyId = target.id;
      // Introduce tiny velocity perturbation: v = v * (1 + 10^-6)
      target.velocity.x *= (1 + 1e-6);
      target.velocity.y *= (1 + 1e-6);
      target.velocity.z *= (1 + 1e-6);
    }
  }

  step(config: SimulationConfig, dt: number, currentTimeYears: number): ChaosDivergencePoint | null {
    if (this.unperturbedBodies.length === 0 || this.perturbedBodies.length === 0) return null;

    stepVerlet(this.unperturbedBodies, config.G, config.softening, dt);
    stepVerlet(this.perturbedBodies, config.G, config.softening, dt);

    const b1 = this.unperturbedBodies.find(b => b.id === this.trackingBodyId);
    const b2 = this.perturbedBodies.find(b => b.id === this.trackingBodyId);

    if (b1 && b2) {
      const dx = b2.position.x - b1.position.x;
      const dy = b2.position.y - b1.position.y;
      const dz = b2.position.z - b1.position.z;
      const divergenceAU = Math.max(1e-12, Math.sqrt(dx * dx + dy * dy + dz * dz));
      const logDivergence = Math.log10(divergenceAU);

      const pt: ChaosDivergencePoint = {
        timeYears: currentTimeYears,
        divergenceAU,
        logDivergence,
      };

      this.history.push(pt);
      if (this.history.length > 200) {
        this.history.shift();
      }

      return pt;
    }

    return null;
  }

  getHistory(): ChaosDivergencePoint[] {
    return this.history;
  }

  getInitialSeparation(): number {
    return this.initialSeparation;
  }

  getTrackingBodyId(): string {
    return this.trackingBodyId;
  }
}

