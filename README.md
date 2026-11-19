# ORBITALIS — Real-Time 3D N-Body Gravitational Dynamics Simulator 🪐🌌

> **REAL-TIME COMPUTATIONAL ASTROPHYSICS LABORATORY**  
> An interactive three-dimensional gravitational simulation platform that models the motion of multiple celestial bodies using Newtonian mechanics and numerical integration.

🌐 **Live Web Application:** [https://shuklashri.github.io/ORBITALIS/](https://shuklashri.github.io/ORBITALIS/)  
📦 **GitHub Repository:** [https://github.com/SHUKLASHRI/ORBITALIS](https://github.com/SHUKLASHRI/ORBITALIS)

---

## 🌟 Overview & Key Features

* **Real-Time 3D Newtonian Mechanics:** Gravitational forces are calculated dynamically using pairwise interactions:
  $$\vec{a}_i = G \sum_{j \ne i} m_j \frac{\vec{r}_j - \vec{r}_i}{(|\vec{r}_j - \vec{r}_i|^2 + \epsilon^2)^{3/2}}$$
* **Astronomical Simulation Unit System:** Uses natural astronomical units ($1\text{ AU}$, $1 M_\odot$, $1\text{ yr}$) where $G = 4\pi^2 \approx 39.4784$, preventing floating-point overflow.
* **Separation of Physical vs Visual Scales:** Exaggerates visual rendering radius for deep-space perspective without altering physical collision radii.
* **Three Integrators:**
  * **Velocity Verlet (Default):** Symplectic, time-reversible, strictly conserves total phase space.
  * **Runge-Kutta 4th Order (RK4):** 4-stage high-order solver.
  * **Forward Euler:** Educational baseline illustrating orbital energy decay and numerical drift.
* **Scientific Analysis Laboratory:**
  * Real-time tracking of Kinetic ($K$), Potential ($U$), Total Mechanical Energy ($E = K + U$), and Energy Drift ($\Delta E / E_0$).
  * Linear Momentum $\vec{P}$ and Angular Momentum $\vec{L}$ conservation telemetry.
  * Center of Mass (Barycenter) tracking and camera lock.
  * Real-time HTML5 Canvas energy history graph.
* **Inelastic Collision & Merger:** Overlapping bodies merge with linear momentum conservation ($\vec{v} = \frac{m_1\vec{v}_1 + m_2\vec{v}_2}{M}$) and volume-preserving radius scaling ($R = \sqrt[3]{R_1^3 + R_2^3}$).
* **100–500 Bodies Benchmark:** Supports high-density gravitational clusters with 60 FPS performance.
* **Data Management:** Export/Import simulation systems as formatted JSON; export telemetry time-series as scientific CSV.

---

## 🚀 Quick Start

```bash
# Navigate to project directory
cd C:

# Install dependencies
npm install

# Run automated physics tests (Vitest)
npm test

# Start local development server
npm run dev
```

Open your browser at:  
👉 **`http://localhost:5173`**

---

## 🧪 Automated Numerical Physics Test Suite

All physical equations are verified using unit tests in `src/tests/`:

```
 ✓ src/tests/gravity.test.ts (2 tests)
   - Calculates analytical two-body acceleration correctly (Sun-Earth)
   - Preserves equal and opposite forces in 3D (Newton's 3rd Law)
 ✓ src/tests/integrators.test.ts (2 tests)
   - Velocity Verlet accurately completes an analytical circular 1-year orbit (drift < 0.005 AU)
   - Demonstrates Velocity Verlet is dramatically more energy-conserving than Euler
 ✓ src/tests/conservation.test.ts (1 test)
   - Conserves total mechanical energy (drift < 0.05%) and momentum in binary stars
 ✓ src/tests/collision.test.ts (1 test)
   - Merges overlapping bodies with linear momentum conservation and volume preservation
```

---

## 🔭 Included Celestial Presets
1. **Our Solar System (3D):** Sun, Mercury, Venus, Earth + nested Moon sub-orbit, Mars, Jupiter, Saturn (with rings), Uranus, Neptune.
2. **Binary Stars & Circumbinary Planet:** Alpha Centauri A & B orbiting common barycenter with outer Tatooine world.
3. **Figure-8 Three-Body Choreography:** Chenciner & Montgomery mathematical choreography in 3D.
4. **Asteroid Belt & Resonance:** Sun, Mars, Jupiter, and 180 asteroid planetesimals.
5. **Gravitational Slingshot:** Hyperbolic Jupiter gravity assist demonstrating interstellar probe momentum theft.
6. **Star Cluster Benchmark:** 200–500 interacting bodies testing direct N-body performance.

---

## 📂 Documentation
* [Mathematical Theory & Derivations](docs/theory.md)
* [Software Architecture & Decoupling](docs/architecture.md)
* [Astrophysical Presets & Experiments Guide](docs/experiments.md)
