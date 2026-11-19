import type { CelestialBody, Vector3D } from './types';
import { computeAccelerations } from './gravity';

/**
 * Velocity Verlet Integration Step (Symplectic 2nd Order)
 * Strictly conserves phase space volume and Hamiltonian energy
 */
export function stepVerlet(
  bodies: CelestialBody[],
  G: number,
  softening: number,
  dt: number,
  initialAccelerations?: Vector3D[]
): { bodies: CelestialBody[]; accelerations: Vector3D[] } {
  const n = bodies.length;
  if (n === 0) return { bodies, accelerations: [] };

  // 1. Initial acceleration a(t)
  const a0 = initialAccelerations || computeAccelerations(bodies, G, softening);

  // 2. Position update: r(t + dt) = r(t) + v(t)*dt + 0.5*a(t)*dt^2
  // and half-step velocity: v(t + 0.5dt) = v(t) + 0.5*a(t)*dt
  const halfVel: Vector3D[] = [];
  for (let i = 0; i < n; i++) {
    const b = bodies[i];
    if (b.isFixed) {
      halfVel.push({ x: 0, y: 0, z: 0 });
      continue;
    }

    b.position.x += b.velocity.x * dt + 0.5 * a0[i].x * dt * dt;
    b.position.y += b.velocity.y * dt + 0.5 * a0[i].y * dt * dt;
    b.position.z += b.velocity.z * dt + 0.5 * a0[i].z * dt * dt;

    halfVel.push({
      x: b.velocity.x + 0.5 * a0[i].x * dt,
      y: b.velocity.y + 0.5 * a0[i].y * dt,
      z: b.velocity.z + 0.5 * a0[i].z * dt,
    });
  }

  // 3. New acceleration a(t + dt) from updated positions
  const a1 = computeAccelerations(bodies, G, softening);

  // 4. Final velocity: v(t + dt) = v(t + 0.5dt) + 0.5*a(t + dt)*dt
  for (let i = 0; i < n; i++) {
    const b = bodies[i];
    if (b.isFixed) continue;

    b.velocity.x = halfVel[i].x + 0.5 * a1[i].x * dt;
    b.velocity.y = halfVel[i].y + 0.5 * a1[i].y * dt;
    b.velocity.z = halfVel[i].z + 0.5 * a1[i].z * dt;
  }

  return { bodies, accelerations: a1 };
}

/**
 * Standard Forward Euler Integration (1st Order)
 * Used as a baseline to demonstrate orbital energy dissipation and decay
 */
export function stepEuler(
  bodies: CelestialBody[],
  G: number,
  softening: number,
  dt: number
): { bodies: CelestialBody[]; accelerations: Vector3D[] } {
  const n = bodies.length;
  if (n === 0) return { bodies, accelerations: [] };

  const a = computeAccelerations(bodies, G, softening);

  for (let i = 0; i < n; i++) {
    const b = bodies[i];
    if (b.isFixed) continue;

    b.position.x += b.velocity.x * dt;
    b.position.y += b.velocity.y * dt;
    b.position.z += b.velocity.z * dt;

    b.velocity.x += a[i].x * dt;
    b.velocity.y += a[i].y * dt;
    b.velocity.z += a[i].z * dt;
  }

  return { bodies, accelerations: a };
}

/**
 * Runge-Kutta 4th Order (RK4) Integration
 * High-accuracy 4-stage numerical solver
 */
export function stepRK4(
  bodies: CelestialBody[],
  G: number,
  softening: number,
  dt: number
): { bodies: CelestialBody[]; accelerations: Vector3D[] } {
  const n = bodies.length;
  if (n === 0) return { bodies, accelerations: [] };

  // Helper to clone positions and velocities
  const getStates = () => bodies.map(b => ({
    pos: { ...b.position },
    vel: { ...b.velocity }
  }));

  const initialStates = getStates();

  // k1 = f(t, y)
  const a1 = computeAccelerations(bodies, G, softening);
  const k1_v = a1;
  const k1_r = bodies.map(b => ({ ...b.velocity }));

  // k2 = f(t + dt/2, y + k1*dt/2)
  for (let i = 0; i < n; i++) {
    if (bodies[i].isFixed) continue;
    bodies[i].position.x = initialStates[i].pos.x + 0.5 * dt * k1_r[i].x;
    bodies[i].position.y = initialStates[i].pos.y + 0.5 * dt * k1_r[i].y;
    bodies[i].position.z = initialStates[i].pos.z + 0.5 * dt * k1_r[i].z;

    bodies[i].velocity.x = initialStates[i].vel.x + 0.5 * dt * k1_v[i].x;
    bodies[i].velocity.y = initialStates[i].vel.y + 0.5 * dt * k1_v[i].y;
    bodies[i].velocity.z = initialStates[i].vel.z + 0.5 * dt * k1_v[i].z;
  }
  const a2 = computeAccelerations(bodies, G, softening);
  const k2_v = a2;
  const k2_r = bodies.map(b => ({ ...b.velocity }));

  // k3 = f(t + dt/2, y + k2*dt/2)
  for (let i = 0; i < n; i++) {
    if (bodies[i].isFixed) continue;
    bodies[i].position.x = initialStates[i].pos.x + 0.5 * dt * k2_r[i].x;
    bodies[i].position.y = initialStates[i].pos.y + 0.5 * dt * k2_r[i].y;
    bodies[i].position.z = initialStates[i].pos.z + 0.5 * dt * k2_r[i].z;

    bodies[i].velocity.x = initialStates[i].vel.x + 0.5 * dt * k2_v[i].x;
    bodies[i].velocity.y = initialStates[i].vel.y + 0.5 * dt * k2_v[i].y;
    bodies[i].velocity.z = initialStates[i].vel.z + 0.5 * dt * k2_v[i].z;
  }
  const a3 = computeAccelerations(bodies, G, softening);
  const k3_v = a3;
  const k3_r = bodies.map(b => ({ ...b.velocity }));

  // k4 = f(t + dt, y + k3*dt)
  for (let i = 0; i < n; i++) {
    if (bodies[i].isFixed) continue;
    bodies[i].position.x = initialStates[i].pos.x + dt * k3_r[i].x;
    bodies[i].position.y = initialStates[i].pos.y + dt * k3_r[i].y;
    bodies[i].position.z = initialStates[i].pos.z + dt * k3_r[i].z;

    bodies[i].velocity.x = initialStates[i].vel.x + dt * k3_v[i].x;
    bodies[i].velocity.y = initialStates[i].vel.y + dt * k3_v[i].y;
    bodies[i].velocity.z = initialStates[i].vel.z + dt * k3_v[i].z;
  }
  const a4 = computeAccelerations(bodies, G, softening);
  const k4_v = a4;
  const k4_r = bodies.map(b => ({ ...b.velocity }));

  // Final weighted update: y = y0 + dt/6 * (k1 + 2k2 + 2k3 + k4)
  for (let i = 0; i < n; i++) {
    const b = bodies[i];
    if (b.isFixed) continue;

    b.position.x = initialStates[i].pos.x + (dt / 6) * (k1_r[i].x + 2 * k2_r[i].x + 2 * k3_r[i].x + k4_r[i].x);
    b.position.y = initialStates[i].pos.y + (dt / 6) * (k1_r[i].y + 2 * k2_r[i].y + 2 * k3_r[i].y + k4_r[i].y);
    b.position.z = initialStates[i].pos.z + (dt / 6) * (k1_r[i].z + 2 * k2_r[i].z + 2 * k3_r[i].z + k4_r[i].z);

    b.velocity.x = initialStates[i].vel.x + (dt / 6) * (k1_v[i].x + 2 * k2_v[i].x + 2 * k3_v[i].x + k4_v[i].x);
    b.velocity.y = initialStates[i].vel.y + (dt / 6) * (k1_v[i].y + 2 * k2_v[i].y + 2 * k3_v[i].y + k4_v[i].y);
    b.velocity.z = initialStates[i].vel.z + (dt / 6) * (k1_v[i].z + 2 * k2_v[i].z + 2 * k3_v[i].z + k4_v[i].z);
  }

  return { bodies, accelerations: a1 };
}
