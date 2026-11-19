import type { CelestialBody } from './types';
import { G_ASTRONOMICAL } from './constants';

export interface OrbitalElements {
  semiMajorAxis: number;      // a (AU)
  eccentricity: number;       // e (dimensionless)
  periodYears: number | null; // T (years) — null if hyperbolic/parabolic
  periodDays: number | null;  // T (days)
  periapsis: number;          // closest approach (AU)
  apoapsis: number | null;    // farthest distance (AU) — null if hyperbolic
  inclinationDeg: number;     // inclination relative to X-Z plane (deg)
  specificEnergy: number;     // epsilon (AU^2/yr^2)
  isBound: boolean;           // bound elliptical vs escape trajectory
}

/**
 * Computes exact Keplerian orbital elements for a body relative to a primary attractor
 * Handles circular, elliptical, parabolic, and hyperbolic trajectories without NaN or overflow
 */
export function computeOrbitalElements(
  body: CelestialBody,
  primary: CelestialBody,
  G: number = G_ASTRONOMICAL
): OrbitalElements {
  // Relative position vector r = r_body - r_primary
  const rx = body.position.x - primary.position.x;
  const ry = body.position.y - primary.position.y;
  const rz = body.position.z - primary.position.z;
  const r = Math.sqrt(rx * rx + ry * ry + rz * rz);

  // Relative velocity vector v = v_body - v_primary
  const vx = body.velocity.x - primary.velocity.x;
  const vy = body.velocity.y - primary.velocity.y;
  const vz = body.velocity.z - primary.velocity.z;
  const vSq = vx * vx + vy * vy + vz * vz;

  // Standard gravitational parameter mu = G * (M + m)
  const mu = Math.max(1e-12, G * (primary.mass + body.mass));

  // If r is virtually 0 (co-located bodies)
  if (r < 1e-9) {
    return {
      semiMajorAxis: 0,
      eccentricity: 0,
      periodYears: 0,
      periodDays: 0,
      periapsis: 0,
      apoapsis: 0,
      inclinationDeg: 0,
      specificEnergy: 0,
      isBound: true,
    };
  }

  // Specific orbital energy: epsilon = v^2 / 2 - mu / r
  const specificEnergy = vSq * 0.5 - mu / r;

  // Specific angular momentum vector h = r x v
  const hx = ry * vz - rz * vy;
  const hy = rz * vx - rx * vz;
  const hz = rx * vy - ry * vx;
  const hSq = hx * hx + hy * hy + hz * hz;
  const h = Math.sqrt(hSq);

  // Inclination: angle between orbital plane normal (h) and reference Z/Y axis
  // Using X-Z as reference plane, Y as normal
  const incRad = h > 1e-12 ? Math.acos(Math.max(-1, Math.min(1, hy / h))) : 0;
  const inclinationDeg = incRad * (180 / Math.PI);

  // Eccentricity: e = sqrt(1 + 2 * epsilon * h^2 / mu^2)
  const eTerm = 1 + (2 * specificEnergy * hSq) / (mu * mu);
  const eccentricity = eTerm >= 0 ? Math.sqrt(eTerm) : 0;

  // Semi-major axis: a = -mu / (2 * epsilon)
  let semiMajorAxis = 0;
  let periodYears: number | null = null;
  let periodDays: number | null = null;
  let periapsis = 0;
  let apoapsis: number | null = null;
  const isBound = specificEnergy < -1e-12 && eccentricity < 1.0;

  if (Math.abs(specificEnergy) > 1e-12) {
    semiMajorAxis = -mu / (2 * specificEnergy);
  }

  if (isBound && semiMajorAxis > 0) {
    // Bound Elliptical Orbit
    periapsis = Math.max(0, semiMajorAxis * (1 - eccentricity));
    apoapsis = semiMajorAxis * (1 + eccentricity);
    // Kepler's Third Law: T = 2 * pi * sqrt(a^3 / mu)
    periodYears = 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxis, 3) / mu);
    periodDays = periodYears * 365.25;
  } else {
    // Hyperbolic or Parabolic Escape Trajectory
    periapsis = Math.abs(semiMajorAxis * (eccentricity - 1));
    apoapsis = null;
    periodYears = null;
    periodDays = null;
  }

  return {
    semiMajorAxis: Math.abs(semiMajorAxis),
    eccentricity,
    periodYears,
    periodDays,
    periapsis,
    apoapsis,
    inclinationDeg,
    specificEnergy,
    isBound,
  };
}
