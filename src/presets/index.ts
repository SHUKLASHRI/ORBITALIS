import type { PresetSystem, CelestialBody } from '../physics/types';
import { G_ASTRONOMICAL } from '../physics/constants';

export const PRESET_SOLAR_SYSTEM: PresetSystem = {
  id: 'solar-system',
  name: 'Solar System (3D)',
  description: 'Full solar system in astronomical units (AU, M_sun, yr) with Sun, 8 planets, and Earth-Moon sub-orbit.',
  camera: { x: 0, y: 12, z: 24, targetX: 0, targetY: 0, targetZ: 0 },
  config: {
    G: G_ASTRONOMICAL,
    timeStep: 0.002,
    timeMultiplier: 1.0,
    integrator: 'verlet',
    collisionModel: 'merge',
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
      color: '#fbbf24',
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
      color: '#f59e0b',
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
      color: '#38bdf8',
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
      velocity: { x: 0, y: 0, z: 2 * Math.PI + 0.216 }, // Moon orbit around Earth
      color: '#cbd5e1',
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
      color: '#ef4444',
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
      color: '#d97706',
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
      color: '#fcd34d',
      rings: { innerRadius: 0.36, outerRadius: 0.65, color: 'rgba(252, 211, 77, 0.4)' },
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
      color: '#67e8f9',
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
      color: '#3b82f6',
      trail: [],
    },
  ],
};

export const PRESET_BINARY_STARS: PresetSystem = {
  id: 'binary-stars',
  name: 'Binary Stars & Circumbinary Planet',
  description: 'Two massive stars orbiting their mutual barycenter with a stable circumbinary Tatooine world.',
  camera: { x: 0, y: 6, z: 12, targetX: 0, targetY: 0, targetZ: 0 },
  config: {
    G: G_ASTRONOMICAL,
    timeStep: 0.002,
    timeMultiplier: 1.0,
    integrator: 'verlet',
    collisionModel: 'merge',
  },
  bodies: [
    {
      id: 'star-alpha',
      name: 'Alpha Centauri A',
      type: 'star',
      mass: 1.1,
      radius: 0.005,
      visualRadius: 0.35,
      position: { x: -0.6, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: -3.2 },
      color: '#fbbf24',
      trail: [],
    },
    {
      id: 'star-beta',
      name: 'Alpha Centauri B',
      type: 'star',
      mass: 0.9,
      radius: 0.004,
      visualRadius: 0.3,
      position: { x: 0.73, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 3.9 },
      color: '#60a5fa',
      trail: [],
    },
    {
      id: 'circumbinary-planet',
      name: 'Tatooine Prime',
      type: 'planet',
      mass: 4.0e-6,
      radius: 4.5e-5,
      visualRadius: 0.12,
      position: { x: 0, y: 0.1, z: 3.8 },
      velocity: { x: 4.55, y: 0, z: 0 },
      color: '#f59e0b',
      trail: [],
    },
  ],
};

export const PRESET_THREE_BODY: PresetSystem = {
  id: 'three-body',
  name: 'Figure-8 Three-Body Choreography',
  description: 'Chenciner & Montgomery mathematical choreography: 3 equal-mass stars in perpetual figure-eight loop.',
  camera: { x: 0, y: 2, z: 4.5, targetX: 0, targetY: 0, targetZ: 0 },
  config: {
    G: G_ASTRONOMICAL,
    timeStep: 0.0008,
    timeMultiplier: 0.4,
    integrator: 'verlet',
    collisionModel: 'merge',
  },
  bodies: (() => {
    const m = 1.0;
    // Normalized figure-8 initial parameters scaled to astronomical units
    const scalePos = 1.2;
    const x1 = -0.97000436 * scalePos;
    const y1 = 0.24308753 * scalePos;
    const scaleVel = Math.sqrt(G_ASTRONOMICAL / scalePos);
    const vx1 = 0.46620531 * scaleVel;
    const vy1 = 0.43236573 * scaleVel;

    return [
      {
        id: 'star-1',
        name: 'Choreography Star Alpha',
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
        name: 'Choreography Star Beta',
        type: 'star',
        mass: m,
        radius: 0.006,
        visualRadius: 0.18,
        position: { x: -x1, y: -y1, z: 0 },
        velocity: { x: vx1, y: vy1, z: 0 },
        color: '#ec4899',
        trail: [],
      },
      {
        id: 'star-3',
        name: 'Choreography Star Gamma',
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

export const PRESET_ASTEROID_BELT: PresetSystem = {
  id: 'asteroid-belt',
  name: 'Asteroid Belt & Gas Giant Resonance',
  description: 'Sun, Mars, Jupiter, and 180 asteroid planetesimals demonstrating Kirkwood orbital resonance gaps in 3D.',
  camera: { x: 0, y: 10, z: 16, targetX: 0, targetY: 0, targetZ: 0 },
  config: {
    G: G_ASTRONOMICAL,
    timeStep: 0.003,
    timeMultiplier: 1.2,
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
        color: '#fbbf24',
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
        color: '#ef4444',
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
        color: '#d97706',
        trail: [],
      },
    ];

    // Generate 180 asteroids between 2.1 AU and 3.3 AU with random inclination
    for (let i = 0; i < 180; i++) {
      const r = 2.15 + Math.random() * 1.15;
      const theta = Math.random() * Math.PI * 2;
      const inc = (Math.random() - 0.5) * 0.18; // inclination out of plane
      const speed = Math.sqrt(G_ASTRONOMICAL / r);

      bodies.push({
        id: `asteroid-${i}`,
        name: `Asteroid #${i + 1}`,
        type: 'asteroid',
        mass: 1e-10,
        radius: 1e-6,
        visualRadius: 0.04,
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
        color: ['#94a3b8', '#cbd5e1', '#e2e8f0', '#fdba74'][i % 4],
        trail: [],
      });
    }

    return bodies;
  })(),
};

export const PRESET_SLINGSHOT: PresetSystem = {
  id: 'gravitational-slingshot',
  name: 'Gravitational Slingshot (Voyager Flyby)',
  description: 'Demonstration of hyper-velocity gravitational assist: probe steals orbital angular momentum from Jupiter.',
  camera: { x: 3.5, y: 5, z: 9, targetX: 4.5, targetY: 0, targetZ: 0 },
  config: {
    G: G_ASTRONOMICAL,
    timeStep: 0.001,
    timeMultiplier: 0.8,
    integrator: 'verlet',
    collisionModel: 'merge',
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
      color: '#fbbf24',
      trail: [],
    },
    {
      id: 'jupiter',
      name: 'Jupiter',
      type: 'planet',
      mass: 9.543e-4,
      radius: 4.67e-4,
      visualRadius: 0.35,
      position: { x: 5.204, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 2.75 },
      color: '#d97706',
      trail: [],
    },
    {
      id: 'voyager',
      name: 'Voyager Interstellar Probe',
      type: 'probe',
      mass: 1e-12,
      radius: 1e-6,
      visualRadius: 0.08,
      position: { x: 4.5, y: 0.05, z: -1.2 },
      velocity: { x: 0.85, y: 0, z: 3.65 },
      color: '#34d399',
      trail: [],
    },
  ],
};

/**
 * Benchmark system with N bodies (100 to 500) for performance verification (OR-03)
 */
export function generateRandomCluster(count: number = 200): PresetSystem {
  const bodies: CelestialBody[] = [
    {
      id: 'central-mass',
      name: 'Supermassive Core',
      type: 'black-hole',
      mass: 2.5,
      radius: 0.01,
      visualRadius: 0.5,
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      color: '#a855f7',
      trail: [],
    },
  ];

  for (let i = 0; i < count - 1; i++) {
    const r = 1.0 + Math.random() * 8.0;
    const theta = Math.random() * Math.PI * 2;
    const phi = (Math.random() - 0.5) * 0.4; // 3D disk thickness
    const speed = Math.sqrt((G_ASTRONOMICAL * 2.5) / r);

    bodies.push({
      id: `cluster-star-${i}`,
      name: `Star #${i + 1}`,
      type: Math.random() > 0.85 ? 'star' : 'planet',
      mass: (Math.random() * 0.005 + 0.0001),
      radius: 0.001,
      visualRadius: Math.random() * 0.08 + 0.04,
      position: {
        x: r * Math.cos(theta),
        y: r * Math.sin(phi),
        z: r * Math.sin(theta),
      },
      velocity: {
        x: -speed * Math.sin(theta),
        y: (Math.random() - 0.5) * 0.2,
        z: speed * Math.cos(theta),
      },
      color: ['#38bdf8', '#ec4899', '#facc15', '#4ade80', '#c084fc'][i % 5],
      trail: [],
    });
  }

  return {
    id: `random-cluster-${count}`,
    name: `Star Cluster (${count} Bodies Benchmark)`,
    description: `High-density 3D gravitational cluster testing direct N-body scaling with ${count} bodies.`,
    camera: { x: 0, y: 8, z: 16, targetX: 0, targetY: 0, targetZ: 0 },
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
  PRESET_ASTEROID_BELT,
  PRESET_SLINGSHOT,
  generateRandomCluster(200),
];
