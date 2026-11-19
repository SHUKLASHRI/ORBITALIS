import type { PresetSystem, CelestialBody } from '../physics/types';
import { G_ASTRONOMICAL } from '../physics/constants';

export const PRESET_SOLAR_SYSTEM: PresetSystem = {
  id: 'solar-system',
  name: 'Solar System Dynamics (3D)',
  description: 'Full solar system in astronomical units (AU, M_sun, yr) with Sun, 8 planets, and Earth-Moon sub-orbit.',
  objective: 'Verify Keplerian orbital velocity v = sqrt(G*M/r) and nested Earth-Moon sub-orbit stability.',
  camera: { x: 0, y: 14, z: 26, targetX: 0, targetY: 0, targetZ: 0 },
  config: {
    G: G_ASTRONOMICAL,
    timeStep: 0.002,
    timeMultiplier: 1.0,
    integrator: 'verlet',
    collisionModel: 'merge',
    useRealisticTextures: true,
  },
  bodies: [
    {
      id: 'sun',
      name: 'Sun',
      type: 'star',
      mass: 1.0,
      radius: 0.00465,
      visualRadius: 0.45,
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      color: '#ffcc33',
      textureUrl: 'sun',
      trail: [],
    },
    {
      id: 'mercury',
      name: 'Mercury',
      type: 'planet',
      mass: 1.66e-7,
      radius: 1.63e-5,
      visualRadius: 0.08,
      position: { x: 0.387, y: 0, z: 0.02 },
      velocity: { x: 0, y: 0, z: 10.09 },
      color: '#94a3b8',
      textureUrl: 'mercury',
      trail: [],
    },
    {
      id: 'venus',
      name: 'Venus',
      type: 'planet',
      mass: 2.45e-6,
      radius: 4.05e-5,
      visualRadius: 0.12,
      position: { x: 0.723, y: 0.02, z: 0 },
      velocity: { x: 0, y: 0, z: 7.38 },
      color: '#e2b36f',
      textureUrl: 'venus',
      trail: [],
    },
    {
      id: 'earth',
      name: 'Earth',
      type: 'planet',
      mass: 3.003e-6,
      radius: 4.26e-5,
      visualRadius: 0.14,
      position: { x: 1.0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 2 * Math.PI }, // 6.283 AU/yr ≈ 29.78 km/s
      color: '#2563eb',
      textureUrl: 'earth',
      trail: [],
    },
    {
      id: 'moon',
      name: 'Moon',
      type: 'moon',
      mass: 3.69e-8,
      radius: 1.16e-5,
      visualRadius: 0.05,
      position: { x: 1.00257, y: 0.0001, z: 0 },
      velocity: { x: 0, y: 0, z: 2 * Math.PI + 0.216 },
      color: '#cbd5e1',
      textureUrl: 'moon',
      trail: [],
    },
    {
      id: 'mars',
      name: 'Mars',
      type: 'planet',
      mass: 3.23e-7,
      radius: 2.27e-5,
      visualRadius: 0.09,
      position: { x: 1.524, y: -0.03, z: 0 },
      velocity: { x: 0, y: 0, z: 5.09 },
      color: '#c2410c',
      textureUrl: 'mars',
      trail: [],
    },
    {
      id: 'jupiter',
      name: 'Jupiter',
      type: 'planet',
      mass: 9.543e-4,
      radius: 4.67e-4,
      visualRadius: 0.32,
      position: { x: 5.204, y: 0.08, z: 0 },
      velocity: { x: 0, y: 0, z: 2.75 },
      color: '#b45309',
      textureUrl: 'jupiter',
      trail: [],
    },
    {
      id: 'saturn',
      name: 'Saturn',
      type: 'planet',
      mass: 2.858e-4,
      radius: 3.89e-4,
      visualRadius: 0.26,
      position: { x: 9.582, y: -0.15, z: 0 },
      velocity: { x: 0, y: 0, z: 2.03 },
      color: '#eab308',
      textureUrl: 'saturn',
      rings: { innerRadius: 0.36, outerRadius: 0.65, color: 'rgba(234, 179, 8, 0.5)' },
      trail: [],
    },
    {
      id: 'uranus',
      name: 'Uranus',
      type: 'planet',
      mass: 4.366e-5,
      radius: 1.7e-4,
      visualRadius: 0.18,
      position: { x: 19.2, y: 0.1, z: 0 },
      velocity: { x: 0, y: 0, z: 1.43 },
      color: '#06b6d4',
      textureUrl: 'uranus',
      trail: [],
    },
    {
      id: 'neptune',
      name: 'Neptune',
      type: 'planet',
      mass: 5.151e-5,
      radius: 1.65e-4,
      visualRadius: 0.18,
      position: { x: 30.05, y: -0.2, z: 0 },
      velocity: { x: 0, y: 0, z: 1.14 },
      color: '#1d4ed8',
      textureUrl: 'neptune',
      trail: [],
    },
  ],
};

export const PRESET_BINARY_STARS: PresetSystem = {
  id: 'binary-stars',
  name: 'Binary Stars & Barycentre Dynamics',
  description: 'Two massive stars orbiting their mutual barycentre with an outer circumbinary world.',
  objective: 'Observe how the system barycentre shifts with mass ratio m1/m2 and test orbital resonance.',
  camera: { x: 0, y: 7, z: 14, targetX: 0, targetY: 0, targetZ: 0 },
  config: {
    G: G_ASTRONOMICAL,
    timeStep: 0.002,
    timeMultiplier: 1.0,
    integrator: 'verlet',
    collisionModel: 'merge',
    showBarycenter: true,
  },
  bodies: [
    {
      id: 'star-alpha',
      name: 'Primary Star (Alpha)',
      type: 'star',
      mass: 1.1,
      radius: 0.005,
      visualRadius: 0.35,
      position: { x: -0.6, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: -3.2 },
      color: '#f59e0b',
      trail: [],
    },
    {
      id: 'star-beta',
      name: 'Secondary Star (Beta)',
      type: 'star',
      mass: 0.9,
      radius: 0.004,
      visualRadius: 0.3,
      position: { x: 0.73, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 3.9 },
      color: '#38bdf8',
      trail: [],
    },
    {
      id: 'circumbinary-planet',
      name: 'Circumbinary World',
      type: 'planet',
      mass: 4.0e-6,
      radius: 4.5e-5,
      visualRadius: 0.12,
      position: { x: 0, y: 0.1, z: 3.8 },
      velocity: { x: 4.55, y: 0, z: 0 },
      color: '#10b981',
      trail: [],
    },
  ],
};

export const PRESET_THREE_BODY: PresetSystem = {
  id: 'three-body',
  name: 'Three-Body Figure-8 Choreography',
  description: 'Chenciner & Montgomery mathematical choreography: 3 equal-mass stars in a perpetual figure-eight loop.',
  objective: 'Investigate the delicate balance of periodic 3-body solutions and vulnerability to perturbations.',
  camera: { x: 0, y: 2, z: 5, targetX: 0, targetY: 0, targetZ: 0 },
  config: {
    G: G_ASTRONOMICAL,
    timeStep: 0.0006,
    timeMultiplier: 0.4,
    integrator: 'verlet',
    collisionModel: 'merge',
  },
  bodies: (() => {
    const m = 1.0;
    const scalePos = 1.2;
    const x1 = -0.97000436 * scalePos;
    const y1 = 0.24308753 * scalePos;
    const scaleVel = Math.sqrt(G_ASTRONOMICAL / scalePos);
    const vx1 = 0.46620531 * scaleVel;
    const vy1 = 0.43236573 * scaleVel;

    return [
      {
        id: 'star-1',
        name: 'Choreography Star 1',
        type: 'star',
        mass: m,
        radius: 0.006,
        visualRadius: 0.18,
        position: { x: x1, y: y1, z: 0 },
        velocity: { x: vx1, y: vy1, z: 0 },
        color: '#38bdf8',
        trail: [],
      },
      {
        id: 'star-2',
        name: 'Choreography Star 2',
        type: 'star',
        mass: m,
        radius: 0.006,
        visualRadius: 0.18,
        position: { x: -x1, y: -y1, z: 0 },
        velocity: { x: vx1, y: vy1, z: 0 },
        color: '#f43f5e',
        trail: [],
      },
      {
        id: 'star-3',
        name: 'Choreography Star 3',
        type: 'star',
        mass: m,
        radius: 0.006,
        visualRadius: 0.18,
        position: { x: 0, y: 0, z: 0 },
        velocity: { x: -2 * vx1, y: -2 * vy1, z: 0 },
        color: '#a855f7',
        trail: [],
      },
    ];
  })(),
};

export const PRESET_CHAOS_DIVERGENCE: PresetSystem = {
  id: 'chaos-experiment',
  name: 'Chaos & Lyapunov Sensitivity Experiment',
  description: 'Two identical 3-body systems with a microscopic 10^-6 initial velocity difference demonstrate exponential orbital divergence.',
  objective: 'Measure the Lyapunov exponent and observe sensitivity to initial conditions in non-linear gravity.',
  camera: { x: 0, y: 4, z: 8, targetX: 0, targetY: 0, targetZ: 0 },
  config: {
    G: G_ASTRONOMICAL,
    timeStep: 0.0008,
    timeMultiplier: 0.5,
    integrator: 'verlet',
    collisionModel: 'merge',
  },
  bodies: [
    {
      id: 'chaos-star-a',
      name: 'Alpha Core',
      type: 'star',
      mass: 1.2,
      radius: 0.006,
      visualRadius: 0.22,
      position: { x: -1.0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: -2.8 },
      color: '#f59e0b',
      trail: [],
    },
    {
      id: 'chaos-star-b',
      name: 'Beta Core',
      type: 'star',
      mass: 1.0,
      radius: 0.005,
      visualRadius: 0.2,
      position: { x: 1.0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 3.2 },
      color: '#38bdf8',
      trail: [],
    },
    {
      id: 'chaotic-prober',
      name: 'Chaotic Body (10^-6 Perturbation)',
      type: 'planet',
      mass: 0.05,
      radius: 0.001,
      visualRadius: 0.1,
      position: { x: 0, y: 0.5, z: 2.2 },
      velocity: { x: 2.1, y: 0, z: 0.4 },
      color: '#ec4899',
      trail: [],
    },
  ],
};

export const PRESET_SLINGSHOT: PresetSystem = {
  id: 'gravitational-slingshot',
  name: 'Gravitational Slingshot & Momentum Theft',
  description: 'Hyperbolic Jupiter flyby: probe steals angular momentum from the gas giant to exceed system escape velocity.',
  objective: 'Quantify kinetic energy transfer Delta K and velocity gain during a planetary gravity assist.',
  camera: { x: 4.8, y: 4, z: 8, targetX: 5.2, targetY: 0, targetZ: 0 },
  config: {
    G: G_ASTRONOMICAL,
    timeStep: 0.0008,
    timeMultiplier: 0.6,
    integrator: 'verlet',
    collisionModel: 'merge',
    showVectors: true,
  },
  bodies: [
    {
      id: 'sun',
      name: 'Sun',
      type: 'star',
      mass: 1.0,
      radius: 0.00465,
      visualRadius: 0.45,
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      color: '#ffcc33',
      textureUrl: 'sun',
      trail: [],
    },
    {
      id: 'jupiter',
      name: 'Jupiter (Primary Assist)',
      type: 'planet',
      mass: 9.543e-4,
      radius: 4.67e-4,
      visualRadius: 0.35,
      position: { x: 5.204, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 2.75 },
      color: '#b45309',
      textureUrl: 'jupiter',
      trail: [],
    },
    {
      id: 'voyager',
      name: 'Interstellar Probe',
      type: 'probe',
      mass: 1e-12,
      radius: 1e-6,
      visualRadius: 0.08,
      position: { x: 4.5, y: 0.05, z: -1.2 },
      velocity: { x: 0.85, y: 0, z: 3.65 },
      color: '#10b981',
      trail: [],
    },
  ],
};

export const PRESET_ASTEROID_BELT: PresetSystem = {
  id: 'asteroid-belt',
  name: 'Asteroid Belt & Kirkwood Resonances',
  description: '180 asteroid planetesimals perturbed by Sun and Jupiter demonstrating gravitational resonance gaps.',
  objective: 'Observe resonant clearing of asteroids at 3:1, 5:2, and 2:1 mean-motion orbital resonance ratios.',
  camera: { x: 0, y: 12, z: 18, targetX: 0, targetY: 0, targetZ: 0 },
  config: {
    G: G_ASTRONOMICAL,
    timeStep: 0.003,
    timeMultiplier: 1.5,
    integrator: 'verlet',
    collisionModel: 'merge',
  },
  bodies: (() => {
    const bodies: CelestialBody[] = [
      {
        id: 'sun',
        name: 'Sun',
        type: 'star',
        mass: 1.0,
        radius: 0.00465,
        visualRadius: 0.45,
        position: { x: 0, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        color: '#ffcc33',
        textureUrl: 'sun',
        trail: [],
      },
      {
        id: 'mars',
        name: 'Mars',
        type: 'planet',
        mass: 3.23e-7,
        radius: 2.27e-5,
        visualRadius: 0.09,
        position: { x: 1.524, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 5.09 },
        color: '#c2410c',
        textureUrl: 'mars',
        trail: [],
      },
      {
        id: 'jupiter',
        name: 'Jupiter',
        type: 'planet',
        mass: 9.543e-4,
        radius: 4.67e-4,
        visualRadius: 0.32,
        position: { x: 5.204, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 2.75 },
        color: '#b45309',
        textureUrl: 'jupiter',
        trail: [],
      },
    ];

    for (let i = 0; i < 180; i++) {
      const r = 2.15 + Math.random() * 1.15;
      const theta = Math.random() * Math.PI * 2;
      const inc = (Math.random() - 0.5) * 0.15;
      const speed = Math.sqrt(G_ASTRONOMICAL / r);

      bodies.push({
        id: `asteroid-${i}`,
        name: `Asteroid #${i + 1}`,
        type: 'asteroid',
        mass: 1e-10,
        radius: 1e-6,
        visualRadius: 0.035,
        position: {
          x: r * Math.cos(theta),
          y: r * Math.sin(inc),
          z: r * Math.sin(theta),
        },
        velocity: {
          x: -speed * Math.sin(theta),
          y: 0,
          z: speed * Math.cos(theta),
        },
        color: ['#94a3b8', '#cbd5e1', '#d1d5db', '#e5e7eb'][i % 4],
        trail: [],
      });
    }

    return bodies;
  })(),
};

export function generateRandomCluster(count: number = 200): PresetSystem {
  const bodies: CelestialBody[] = [
    {
      id: 'central-mass',
      name: 'Central Massive Core',
      type: 'black-hole',
      mass: 3.0,
      radius: 0.01,
      visualRadius: 0.45,
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      color: '#475569',
      trail: [],
    },
  ];

  for (let i = 0; i < count - 1; i++) {
    const r = 1.2 + Math.random() * 8.5;
    const theta = Math.random() * Math.PI * 2;
    const phi = (Math.random() - 0.5) * 0.35;
    const speed = Math.sqrt((G_ASTRONOMICAL * 3.0) / r);

    bodies.push({
      id: `cluster-star-${i}`,
      name: `Star #${i + 1}`,
      type: 'star',
      mass: (Math.random() * 0.005 + 0.0001),
      radius: 0.001,
      visualRadius: Math.random() * 0.07 + 0.04,
      position: {
        x: r * Math.cos(theta),
        y: r * Math.sin(phi),
        z: r * Math.sin(theta),
      },
      velocity: {
        x: -speed * Math.sin(theta),
        y: (Math.random() - 0.5) * 0.15,
        z: speed * Math.cos(theta),
      },
      color: ['#38bdf8', '#f59e0b', '#f43f5e', '#10b981', '#cbd5e1'][i % 5],
      trail: [],
    });
  }

  return {
    id: `cluster-${count}`,
    name: `Direct N-Body Cluster (${count} Bodies)`,
    description: `High-density gravitational collapse testing direct N-body scaling with ${count} bodies.`,
    objective: `Verify O(N^2) direct force calculation with ${count} interacting bodies at 60 FPS.`,
    camera: { x: 0, y: 10, z: 20, targetX: 0, targetY: 0, targetZ: 0 },
    config: {
      G: G_ASTRONOMICAL,
      timeStep: 0.002,
      timeMultiplier: 1.0,
      integrator: 'verlet',
      collisionModel: 'merge',
    },
    bodies,
  };
}

export const ALL_PRESETS: PresetSystem[] = [
  PRESET_SOLAR_SYSTEM,
  PRESET_BINARY_STARS,
  PRESET_THREE_BODY,
  PRESET_CHAOS_DIVERGENCE,
  PRESET_SLINGSHOT,
  PRESET_ASTEROID_BELT,
  generateRandomCluster(200),
  generateRandomCluster(500),
];
