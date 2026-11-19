import { describe, it, expect } from 'vitest';
import { G_ASTRONOMICAL } from '../physics/constants';
import { stepVerlet, stepEuler } from '../physics/integrators';
import type { CelestialBody } from '../physics/types';

describe('Numerical Integrators & Keplerian Orbit Validation', () => {
  it('Velocity Verlet accurately completes an analytical circular 1-year orbit', () => {
    // Fixed Sun at origin, Earth at (1, 0, 0) with circular velocity v = (0, 2*pi, 0) AU/yr
    const sun: CelestialBody = {
      id: 'sun',
      name: 'Sun',
      type: 'star',
      mass: 1.0,
      radius: 0.005,
      visualRadius: 0.05,
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      color: '#fbbf24',
      trail: [],
      isFixed: true,
    };

    const earth: CelestialBody = {
      id: 'earth',
      name: 'Earth',
      type: 'planet',
      mass: 3.003e-6,
      radius: 4.26e-5,
      visualRadius: 0.02,
      position: { x: 1.0, y: 0, z: 0 },
      velocity: { x: 0, y: 2 * Math.PI, z: 0 }, // Circular velocity = sqrt(G*M/r) = 2*pi
      color: '#38bdf8',
      trail: [],
    };

    const bodies = [sun, earth];
    const totalTimeYears = 1.0; // 1 full Earth orbit
    const dt = 0.001;           // 1000 steps per year
    const steps = Math.round(totalTimeYears / dt);

    for (let s = 0; s < steps; s++) {
      stepVerlet(bodies, G_ASTRONOMICAL, 0.0, dt);
    }

    // After exactly 1 orbit, Earth should return to (1, 0, 0) and velocity (0, 2*pi, 0)
    expect(earth.position.x).toBeCloseTo(1.0, 3);
    expect(earth.position.y).toBeCloseTo(0.0, 2);
    expect(earth.position.z).toBeCloseTo(0.0, 4);

    expect(earth.velocity.x).toBeCloseTo(0.0, 2);
    expect(earth.velocity.y).toBeCloseTo(2 * Math.PI, 2);
  });

  it('demonstrates that Velocity Verlet is dramatically more energy-conserving than Euler', () => {
    const makeSystem = () => [
      {
        id: 'sun',
        name: 'Sun',
        type: 'star' as const,
        mass: 1.0,
        radius: 0.005,
        visualRadius: 0.05,
        position: { x: 0, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        color: '#fbbf24',
        trail: [],
        isFixed: true,
      },
      {
        id: 'earth',
        name: 'Earth',
        type: 'planet' as const,
        mass: 3.003e-6,
        radius: 4.26e-5,
        visualRadius: 0.02,
        position: { x: 1.0, y: 0, z: 0 },
        velocity: { x: 0, y: 2 * Math.PI, z: 0 },
        color: '#38bdf8',
        trail: [],
      },
    ];

    const dt = 0.005;
    const steps = 200; // 1 year

    // 1. Verlet run
    const verletBodies = makeSystem();
    for (let i = 0; i < steps; i++) {
      stepVerlet(verletBodies, G_ASTRONOMICAL, 0.0, dt);
    }
    const verletRadius = Math.hypot(verletBodies[1].position.x, verletBodies[1].position.y);
    const verletRadialDrift = Math.abs(verletRadius - 1.0);

    // 2. Euler run
    const eulerBodies = makeSystem();
    for (let i = 0; i < steps; i++) {
      stepEuler(eulerBodies, G_ASTRONOMICAL, 0.0, dt);
    }
    const eulerRadius = Math.hypot(eulerBodies[1].position.x, eulerBodies[1].position.y);
    const eulerRadialDrift = Math.abs(eulerRadius - 1.0);

    // Euler spirals outward artificially because it adds numerical energy every step
    expect(eulerRadialDrift).toBeGreaterThan(verletRadialDrift * 10);
  });
});
