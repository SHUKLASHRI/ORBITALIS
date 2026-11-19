# ORBITALIS — Mathematical Theory & Computational Astrophysics

## 1. Astronomical Simulation Unit System
In real SI units, planetary distances are on the order of $10^{11}\text{ m}$ while planetary masses are $10^{24}\text{ to } 10^{30}\text{ kg}$ and $G \approx 6.6743 \times 10^{-11}\text{ m}^3\text{ kg}^{-1}\text{ s}^{-2}$. This causes extreme floating-point underflow/overflow.

ORBITALIS implements Gaussian astronomical simulation units:
* **Unit of Length:** $1\text{ Astronomical Unit (AU)} = 149,597,870,700\text{ m}$
* **Unit of Mass:** $1\text{ Solar Mass } (M_\odot) = 1.98847 \times 10^{30}\text{ kg}$
* **Unit of Time:** $1\text{ Earth Year } (\text{yr}) = 365.25\text{ days} = 31,557,600\text{ s}$
* **Unit of Velocity:** $1\text{ AU/yr} \approx 4.74047\text{ km/s}$

### Derivation of the Gravitational Constant $G$:
For Earth in a circular orbit around the Sun ($M_\odot = 1$, $r = 1\text{ AU}$, $T = 1\text{ yr}$):
$$v = \frac{2\pi r}{T} = 2\pi\text{ AU/yr}$$
$$a = \frac{v^2}{r} = 4\pi^2\text{ AU/yr}^2$$
Newton's law of gravitation gives:
$$a = \frac{G M}{r^2} = \frac{G \cdot 1}{1^2} = G$$
Therefore, in our unit system:
$$\boxed{G = 4\pi^2 \approx 39.47841760435743\text{ AU}^3 M_\odot^{-1}\text{ yr}^{-2}}$$

---

## 2. 3D Pairwise Newtonian Gravitation with Plummer Softening
For $N$ bodies with masses $m_i$ and positions $\vec{r}_i = (x_i, y_i, z_i)$:
$$\vec{a}_i = G \sum_{j \ne i} m_j \frac{\vec{r}_j - \vec{r}_i}{(|\vec{r}_j - \vec{r}_i|^2 + \epsilon^2)^{3/2}}$$
Where $\epsilon$ is the Plummer softening length ($\sim 0.001\text{ AU}$) preventing numerical singularities when two bodies experience close orbital passes.

By Newton's Third Law:
$$\vec{F}_{ji} = -\vec{F}_{ij}$$
The pairwise force is calculated once for each of the $P = \frac{N(N-1)}{2}$ unique pairs and accumulated simultaneously onto both bodies.

---

## 3. Numerical Integration Algorithms

### 3.1 Velocity Verlet (Default — Symplectic)
Velocity Verlet is second-order accurate ($O(\Delta t^2)$) and symplectic (phase-space volume preserving):
1. **Position half-step & update:**
   $$\vec{r}_{n+1} = \vec{r}_n + \vec{v}_n \Delta t + \frac{1}{2}\vec{a}_n \Delta t^2$$
2. **Compute new accelerations:**
   $$\vec{a}_{n+1} = \vec{a}(\vec{r}_{n+1})$$
3. **Velocity update:**
   $$\vec{v}_{n+1} = \vec{v}_n + \frac{1}{2}(\vec{a}_n + \vec{a}_{n+1}) \Delta t$$

### 3.2 Runge-Kutta 4th Order (RK4)
A four-stage integrator evaluating four intermediate slopes $k_1, k_2, k_3, k_4$ per step. Highly accurate for short durations, though non-symplectic over astronomical epochs.

### 3.3 Forward Euler (Educational Comparison)
$$\vec{r}_{n+1} = \vec{r}_n + \vec{v}_n \Delta t$$
$$\vec{v}_{n+1} = \vec{v}_n + \vec{a}_n \Delta t$$
Forward Euler constantly injects artificial numerical energy, illustrating why non-symplectic integrators fail for orbital mechanics.

---

## 4. Conservation Laws
* **Kinetic Energy:** $K = \sum_i \frac{1}{2} m_i |\vec{v}_i|^2$
* **Potential Energy:** $U = -\sum_{i < j} \frac{G m_i m_j}{\sqrt{|\vec{r}_i - \vec{r}_j|^2 + \epsilon^2}}$
* **Total Hamiltonian:** $E = K + U$
* **Linear Momentum:** $\vec{P} = \sum_i m_i \vec{v}_i$
* **Angular Momentum:** $\vec{L} = \sum_i \vec{r}_i \times (m_i \vec{v}_i)$
* **Center of Mass (Barycenter):** $\vec{R}_{CM} = \frac{\sum m_i \vec{r}_i}{\sum m_i}$

