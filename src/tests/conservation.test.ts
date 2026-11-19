import { describe, it, expect } from 'vitest';
import { G_ASTRONOMICAL } from '../physics/constants';
import { stepVerlet } from '../physics/integrators';
import { computeMeasurements } from '../physics/analysis';
import type { CelestialBody } from '../physics/types';

describe('Conservation Laws in 3D N-Body Simulation', () => {
  it('conserves total mechanical energy within tight bound over multiple orbits', () => {
    // Binary star system: two equal stars orbiting mutual center of mass
    const star1: CelestialBody = {
      id: 's1',
      name: 'Star 1',
      type: 'star',
      mass: 1.0,
      radius: 0.01,
      visualRadius: 0.05,
      position: { x: -0.5, y: 0, z: 0 },
      velocity: { x: 0, y: -Math.PI, z: 0 },
      color: '#fbbf24',
      trail: [],
    };

    const star2: CelestialBody = {
      id: 's2',
      name: 'Star 2',
      type: 'star',
      mass: 1.0,
      radius: 0.01,
      visualRadius: 0.05,
      position: { x: 0.5, y: 0, z: 0 },
      velocity: { x: 0, y: Math.PI, z: 0 },
      color: '#38bdf8',
      trail: [],
    };

    const bodies = [star1, star2];
    const initial = computeMeasurements(bodies, G_ASTRONOMICAL, 0.0, 0);

    const dt = 0.001;
    const steps = 1000;

    for (let s = 0; s < steps; s++) {
      stepVerlet(bodies, G_ASTRONOMICAL, 0.0, dt);
    }

    const final = computeMeasurements(bodies, G_ASTRONOMICAL, 0.0, 1.0, initial.totalEnergy);

    // Energy drift should be less than 0.05%
    expect(Math.abs(final.energyDriftPercent)).toBeLessThan(0.05);

    // Linear momentum was zero initially and should remain zero
    expect(final.totalLinearMomentum).toBeCloseTo(0, 5);
  });
});

