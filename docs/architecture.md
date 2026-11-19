# ORBITALIS — Software Architecture

## Core Decoupling Principle
The physics calculation engine is completely decoupled from Three.js and React.

```
┌────────────────────────────────────────────────────────┐
│                   React 19 / UI Layer                  │
│   Header · Sidebar · Inspector · Dashboard · Toolbar   │
└──────────────────────────┬─────────────────────────────┘
                           │ State Sync (~30 FPS)
┌──────────────────────────▼─────────────────────────────┐
│                 PhysicsEngine Controller               │
│     Time Clock · Configuration · Body State Management │
└─────────────┬───────────────────────────┬──────────────┘
              │                           │
┌─────────────▼──────────────┐ ┌──────────▼──────────────┐
│  Astrophysical 3D Physics  │ │ Three.js 3D Viewport    │
│  - 3D Pairwise Gravity     │ │ - WebGLRenderer         │
│  - Velocity Verlet / RK4   │ │ - Perspective Camera    │
│  - Inelastic Collision/Merge│ │ - OrbitControls        │
│  - Conservation Telemetry  │ │ - 3D Trails & Starfield │
└────────────────────────────┘ └─────────────────────────┘
```

### Performance Strategies
1. **Sub-Stepping**: The physics tick subdivides frame time into 6–8 sub-steps, allowing accurate trajectory calculations during close hyperbolic passes.
2. **Resource Reuse**: Sphere geometries and materials in Three.js are created once and reused via instance matrices / scale adjustments.
3. **Throttled State Propagation**: Physics calculations run at 60 FPS while heavy DOM updates are throttled to 30 FPS to prevent unnecessary React re-renders.

