import type { CelestialBody, CollisionModel, Vector3D } from './types';

export interface CollisionEvent {
  position: Vector3D;
  body1Name: string;
  body2Name: string;
  absorbedName: string;
  mass: number;
  color: string;
}

/**
 * Detects and resolves collisions between celestial bodies
 */
export function handleCollisions(
  bodies: CelestialBody[],
  model: CollisionModel,
  collisionScale: number = 1.0,
  onCollision?: (event: CollisionEvent) => void
): CelestialBody[] {
  if (model === 'none' || bodies.length < 2) return bodies;

  let activeBodies = [...bodies];

  if (model === 'merge') {
    const toRemove = new Set<string>();

    for (let i = 0; i < activeBodies.length; i++) {
      const b1 = activeBodies[i];
      if (toRemove.has(b1.id)) continue;

      for (let j = i + 1; j < activeBodies.length; j++) {
        const b2 = activeBodies[j];
        if (toRemove.has(b2.id)) continue;

        const dx = b2.position.x - b1.position.x;
        const dy = b2.position.y - b1.position.y;
        const dz = b2.position.z - b1.position.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // Effective collision threshold using physical radius
        const threshold = (b1.radius + b2.radius) * collisionScale;

        if (dist <= threshold) {
          const primary = b1.mass >= b2.mass ? b1 : b2;
          const secondary = b1.mass >= b2.mass ? b2 : b1;

          const totalMass = primary.mass + secondary.mass;

          // Conservation of linear momentum: v_new = (m1*v1 + m2*v2) / (m1+m2)
          const newVx = (primary.mass * primary.velocity.x + secondary.mass * secondary.velocity.x) / totalMass;
          const newVy = (primary.mass * primary.velocity.y + secondary.mass * secondary.velocity.y) / totalMass;
          const newVz = (primary.mass * primary.velocity.z + secondary.mass * secondary.velocity.z) / totalMass;

          // Center of mass position
          const newX = (primary.mass * primary.position.x + secondary.mass * secondary.position.x) / totalMass;
          const newY = (primary.mass * primary.position.y + secondary.mass * secondary.position.y) / totalMass;
          const newZ = (primary.mass * primary.position.z + secondary.mass * secondary.position.z) / totalMass;

          // Volume-preserving radius: R_new = (R1^3 + R2^3)^(1/3)
          const newRadius = Math.cbrt(Math.pow(primary.radius, 3) + Math.pow(secondary.radius, 3));
          const newVisualRadius = Math.cbrt(Math.pow(primary.visualRadius, 3) + Math.pow(secondary.visualRadius, 3));

          primary.mass = totalMass;
          primary.radius = newRadius;
          primary.visualRadius = newVisualRadius;
          primary.position.x = newX;
          primary.position.y = newY;
          primary.position.z = newZ;
          primary.velocity.x = newVx;
          primary.velocity.y = newVy;
          primary.velocity.z = newVz;

          toRemove.add(secondary.id);

          onCollision?.({
            position: { x: newX, y: newY, z: newZ },
            body1Name: primary.name,
            body2Name: secondary.name,
            absorbedName: secondary.name,
            mass: totalMass,
            color: secondary.color,
          });
        }
      }
    }

    if (toRemove.size > 0) {
      activeBodies = activeBodies.filter((b) => !toRemove.has(b.id));
    }
  } else if (model === 'bounce') {
    // Elastic impulse collision resolution
    for (let i = 0; i < activeBodies.length; i++) {
      const b1 = activeBodies[i];
      for (let j = i + 1; j < activeBodies.length; j++) {
        const b2 = activeBodies[j];
        const dx = b2.position.x - b1.position.x;
        const dy = b2.position.y - b1.position.y;
        const dz = b2.position.z - b1.position.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const minDist = (b1.radius + b2.radius) * collisionScale;

        if (dist <= minDist && dist > 1e-12) {
          const nx = dx / dist;
          const ny = dy / dist;
          const nz = dz / dist;

          const kx = b1.velocity.x - b2.velocity.x;
          const ky = b1.velocity.y - b2.velocity.y;
          const kz = b1.velocity.z - b2.velocity.z;
          const impulse = (2 * (nx * kx + ny * ky + nz * kz)) / (b1.mass + b2.mass);

          if (!b1.isFixed) {
            b1.velocity.x -= impulse * b2.mass * nx;
            b1.velocity.y -= impulse * b2.mass * ny;
            b1.velocity.z -= impulse * b2.mass * nz;
          }
          if (!b2.isFixed) {
            b2.velocity.x += impulse * b1.mass * nx;
            b2.velocity.y += impulse * b1.mass * ny;
            b2.velocity.z += impulse * b1.mass * nz;
          }
        }
      }
    }
  }

  return activeBodies;
}
