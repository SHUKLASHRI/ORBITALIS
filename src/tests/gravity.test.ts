import { describe, it, expect } from 'vitest';
import { G_ASTRONOMICAL } from '../physics/constants';
import { computeAccelerations } from '../physics/gravity';
import type { CelestialBody } from '../physics/types';

describe('3D Newtonian Gravity Engine', () => {
  it('calculates analytical two-body acceleration correctly', () => {
    // Sun (1 M_sun) at origin, Earth (mass 3e-6) at 1 AU along X axis
    const sun: CelestialBody = {
      id: 'sun',
      name: 'Sun',
      type: 'star',
      mass: 1.0,
      radius: 0.00465,
      visualRadius: 0.05,
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      color: '#fbbf24',
      trail: [],
    };

    const earth: CelestialBody = {
      id: 'earth',
      name: 'Earth',
      type: 'planet',
      mass: 3.003e-6,
      radius: 4.26e-5,
      visualRadius: 0.02,
      position: { x: 1.0, y: 0, z: 0 },
      velocity: { x: 0, y: 2 * Math.PI, z: 0 },
      color: '#38bdf8',
      trail: [],
    };

    const accels = computeAccelerations([sun, earth], G_ASTRONOMICAL, 0.0);

    // Analytical acceleration on Earth: a_x = -G * M_sun / r^2 = -4*pi^2 ≈ -39.4784 AU/yr^2
    const expectedEarthAccX = -G_ASTRONOMICAL;
    expect(accels[1].x).toBeCloseTo(expectedEarthAccX, 4);
    expect(accels[1].y).toBeCloseTo(0, 4);
    expect(accels[1].z).toBeCloseTo(0, 4);

    // Sun acceleration by Newton's 3rd law: a_sun = G * m_earth / r^2
    const expectedSunAccX = G_ASTRONOMICAL * earth.mass;
    expect(accels[0].x).toBeCloseTo(expectedSunAccX, 6);
  });

  it('preserves equal and opposite forces in 3D diagonal arrangements', () => {
    const b1: CelestialBody = {
      id: 'b1',
      name: 'Body 1',
      type: 'star',
      mass: 2.0,
      radius: 0.01,
      visualRadius: 0.05,
      position: { x: 1.0, y: 2.0, z: 3.0 },
      velocity: { x: 0, y: 0, z: 0 },
      color: '#ffffff',
      trail: [],
    };

    const b2: CelestialBody = {
      id: 'b2',
      name: 'Body 2',
      type: 'star',
      mass: 3.0,
      radius: 0.01,
      visualRadius: 0.05,
      position: { x: 4.0, y: 6.0, z: 8.0 },
      velocity: { x: 0, y: 0, z: 0 },
      color: '#ffffff',
      trail: [],
    };

    const accels = computeAccelerations([b1, b2], G_ASTRONOMICAL, 0.0);

    // F1 = m1 * a1, F2 = m2 * a2 => F1 + F2 must be 0
    const f1x = b1.mass * accels[0].x;
    const f2x = b2.mass * accels[1].x;
    const f1y = b1.mass * accels[0].y;
    const f2y = b2.mass * accels[1].y;
    const f1z = b1.mass * accels[0].z;
    const f2z = b2.mass * accels[1].z;

    expect(f1x + f2x).toBeCloseTo(0, 8);
    expect(f1y + f2y).toBeCloseTo(0, 8);
    expect(f1z + f2z).toBeCloseTo(0, 8);
  });
});

