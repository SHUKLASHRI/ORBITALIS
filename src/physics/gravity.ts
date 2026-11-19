import type { CelestialBody, Vector3D } from './types';

/**
 * Computes 3D pairwise Newtonian gravitational accelerations with Plummer softening
 * Formula: a_i = G * sum_{j != i} m_j * (r_j - r_i) / (|r_j - r_i|^2 + eps^2)^(3/2)
 * Pairwise optimization: computes each interaction once and applies equal-and-opposite reaction
 */
export function computeAccelerations(
  bodies: CelestialBody[],
  G: number,
  softening: number = 0.001
): Vector3D[] {
  const n = bodies.length;
  const accels: Vector3D[] = Array.from({ length: n }, () => ({ x: 0, y: 0, z: 0 }));
  const eps2 = softening * softening;

  for (let i = 0; i < n; i++) {
    const b1 = bodies[i];
    const p1 = b1.position;

    for (let j = i + 1; j < n; j++) {
      const b2 = bodies[j];
      const p2 = b2.position;

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dz = p2.z - p1.z;

      const distSq = dx * dx + dy * dy + dz * dz + eps2;
      const dist = Math.sqrt(distSq);
      const invDist3 = 1 / (distSq * dist);

      // F_unit = G / (r^2 + eps^2)^(3/2)
      // a1 += G * m2 * dr / r^3
      // a2 -= G * m1 * dr / r^3
      const f1 = G * b2.mass * invDist3;
      if (!b1.isFixed) {
        accels[i].x += dx * f1;
        accels[i].y += dy * f1;
        accels[i].z += dz * f1;
      }

      if (!b2.isFixed) {
        const f2 = G * b1.mass * invDist3;
        accels[j].x -= dx * f2;
        accels[j].y -= dy * f2;
        accels[j].z -= dz * f2;
      }
    }
  }

  return accels;
}

/**
 * Fast acceleration calculation on flat Float64Array (pos: 3N, mass: N, acc: 3N)
 * Ideal for 100-500 body high-performance benchmarks
 */
export function computeAccelerationsFlat(
  positions: Float64Array,
  masses: Float64Array,
  n: number,
  G: number,
  softening: number,
  outAccels: Float64Array
): void {
  outAccels.fill(0);
  const eps2 = softening * softening;

  for (let i = 0; i < n; i++) {
    const i3 = i * 3;
    const x1 = positions[i3];
    const y1 = positions[i3 + 1];
    const z1 = positions[i3 + 2];
    const m1 = masses[i];

    for (let j = i + 1; j < n; j++) {
      const j3 = j * 3;
      const dx = positions[j3] - x1;
      const dy = positions[j3 + 1] - y1;
      const dz = positions[j3 + 2] - z1;
      const m2 = masses[j];

      const distSq = dx * dx + dy * dy + dz * dz + eps2;
      const dist = Math.sqrt(distSq);
      const invDist3 = 1 / (distSq * dist);

      const f1 = G * m2 * invDist3;
      const f2 = G * m1 * invDist3;

      outAccels[i3] += dx * f1;
      outAccels[i3 + 1] += dy * f1;
      outAccels[i3 + 2] += dz * f1;

      outAccels[j3] -= dx * f2;
      outAccels[j3 + 1] -= dy * f2;
      outAccels[j3 + 2] -= dz * f2;
    }
  }
}
