import { describe, it, expect } from 'vitest';
import { handleCollisions } from '../physics/collision';
import type { CelestialBody } from '../physics/types';

describe('Inelastic Collision and Momentum Conservation', () => {
  it('merges overlapping bodies while strictly conserving linear momentum and mass', () => {
    // Body 1: mass 2.0, moving right at (3, 0, 0) AU/yr
    const b1: CelestialBody = {
      id: 'b1',
      name: 'Primary Target',
      type: 'planet',
      mass: 2.0,
      radius: 0.05,
      visualRadius: 0.1,
      position: { x: 0.0, y: 0.0, z: 0.0 },
      velocity: { x: 3.0, y: 0.0, z: 0.0 },
      color: '#38bdf8',
      trail: [],
    };

    // Body 2: mass 1.0, moving left at (-6, 0, 0) AU/yr
    const b2: CelestialBody = {
      id: 'b2',
      name: 'Impactor',
      type: 'asteroid',
      mass: 1.0,
      radius: 0.03,
      visualRadius: 0.06,
      position: { x: 0.04, y: 0.0, z: 0.0 }, // Overlapping (dist = 0.04 <= 0.08)
      velocity: { x: -6.0, y: 0.0, z: 0.0 },
      color: '#ef4444',
      trail: [],
    };

    const initialMomentumX = b1.mass * b1.velocity.x + b2.mass * b2.velocity.x; // 2*3 + 1*(-6) = 0

    const mergedBodies = handleCollisions([b1, b2], 'merge', 1.0);

    expect(mergedBodies.length).toBe(1);
    const merged = mergedBodies[0];

    // Total mass = 2 + 1 = 3
    expect(merged.mass).toBe(3.0);

    // Final velocity = (2*3 + 1*-6) / 3 = 0
    expect(merged.velocity.x).toBeCloseTo(0.0, 6);
    expect(merged.velocity.y).toBeCloseTo(0.0, 6);
    expect(merged.velocity.z).toBeCloseTo(0.0, 6);

    // Final momentum should match initial momentum
    const finalMomentumX = merged.mass * merged.velocity.x;
    expect(finalMomentumX).toBeCloseTo(initialMomentumX, 6);

    // Volume-preserving radius: R_new = (0.05^3 + 0.03^3)^(1/3)
    const expectedRadius = Math.cbrt(Math.pow(0.05, 3) + Math.pow(0.03, 3));
    expect(merged.radius).toBeCloseTo(expectedRadius, 6);
  });
});
