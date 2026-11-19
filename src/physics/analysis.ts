import type { CelestialBody, Vector3D, ScientificMeasurements } from './types';

/**
 * Computes comprehensive scientific measurements: Energy, Linear & Angular Momentum, Barycenter
 */
export function computeMeasurements(
  bodies: CelestialBody[],
  G: number,
  softening: number,
  currentTimeYears: number,
  initialEnergy?: number,
  existingHistory: ScientificMeasurements['history'] = []
): ScientificMeasurements {
  let kinetic = 0;
  let potential = 0;
  let totalMass = 0;

  // Linear momentum components
  let Px = 0;
  let Py = 0;
  let Pz = 0;

  // Angular momentum components: L = r x p
  let Lx = 0;
  let Ly = 0;
  let Lz = 0;

  // Barycenter components: R_cm = sum(m*r) / sum(m)
  let cmX = 0;
  let cmY = 0;
  let cmZ = 0;

  const eps2 = softening * softening;
  const n = bodies.length;

  for (let i = 0; i < n; i++) {
    const b1 = bodies[i];
    const m1 = b1.mass;
    const p1 = b1.position;
    const v1 = b1.velocity;

    totalMass += m1;

    // Kinetic Energy: 0.5 * m * v^2
    const vSq = v1.x * v1.x + v1.y * v1.y + v1.z * v1.z;
    kinetic += 0.5 * m1 * vSq;

    // Linear Momentum: P = m * v
    Px += m1 * v1.x;
    Py += m1 * v1.y;
    Pz += m1 * v1.z;

    // Angular Momentum: L = r x (m*v)
    Lx += m1 * (p1.y * v1.z - p1.z * v1.y);
    Ly += m1 * (p1.z * v1.x - p1.x * v1.z);
    Lz += m1 * (p1.x * v1.y - p1.y * v1.x);

    // Barycenter accumulator
    cmX += m1 * p1.x;
    cmY += m1 * p1.y;
    cmZ += m1 * p1.z;

    // Potential Energy: - G * m1 * m2 / dist
    for (let j = i + 1; j < n; j++) {
      const b2 = bodies[j];
      const dx = b2.position.x - p1.x;
      const dy = b2.position.y - p1.y;
      const dz = b2.position.z - p1.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz + eps2);
      potential -= (G * m1 * b2.mass) / dist;
    }
  }

  const total = kinetic + potential;
  const init = initialEnergy !== undefined ? initialEnergy : total;
  const drift = init !== 0 ? ((total - init) / Math.abs(init)) * 100 : 0;

  const barycenter: Vector3D = totalMass > 0
    ? { x: cmX / totalMass, y: cmY / totalMass, z: cmZ / totalMass }
    : { x: 0, y: 0, z: 0 };

  const totalLinearMomentum = Math.sqrt(Px * Px + Py * Py + Pz * Pz);
  const totalAngularMomentum = Math.sqrt(Lx * Lx + Ly * Ly + Lz * Lz);

  // Maintain sliding window history (up to 150 points for real-time charting)
  const history = [...existingHistory];
  history.push({
    time: parseFloat(currentTimeYears.toFixed(3)),
    kinetic,
    potential,
    total,
    drift,
  });
  if (history.length > 150) {
    history.shift();
  }

  return {
    kineticEnergy: kinetic,
    potentialEnergy: potential,
    totalEnergy: total,
    initialEnergy: init,
    energyDriftPercent: drift,
    linearMomentum: { x: Px, y: Py, z: Pz },
    totalLinearMomentum,
    angularMomentum: { x: Lx, y: Ly, z: Lz },
    totalAngularMomentum,
    barycenter,
    timeYears: currentTimeYears,
    bodyCount: n,
    history,
  };
}

