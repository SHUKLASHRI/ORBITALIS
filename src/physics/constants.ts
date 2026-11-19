/**
 * ORBITALIS — Astrophysical Constants, Conversion Factors, and Numerical Bounds
 */

export const G_ASTRONOMICAL = 4 * Math.PI * Math.PI; // 39.47841760435743 AU^3 / (M_sun * yr^2)

// Physical Conversions
export const AU_TO_KM = 149597870.7;
export const KM_TO_AU = 1 / AU_TO_KM;
export const SOLAR_MASS_TO_KG = 1.98847e30;
export const EARTH_MASS_IN_SOLAR = 5.9722e24 / SOLAR_MASS_TO_KG; // ≈ 3.003e-6 M_sun
export const JUPITER_MASS_IN_SOLAR = 1.898e27 / SOLAR_MASS_TO_KG; // ≈ 9.543e-4 M_sun
export const SECONDS_PER_YEAR = 365.25 * 86400; // 31,557,600 s

// Velocity Conversions
export const AU_PER_YR_TO_KM_PER_S = AU_TO_KM / SECONDS_PER_YEAR; // ≈ 4.74047 km/s
export const KM_PER_S_TO_AU_PER_YR = 1 / AU_PER_YR_TO_KM_PER_S;   // ≈ 0.210945 (AU/yr) / (km/s)

// Default Softening Parameter (Plummer epsilon in AU)
export const DEFAULT_SOFTENING = 0.002;

// Energy in Joules conversion: 1 M_sun * AU^2 / yr^2
// 1.98847e30 kg * (1.495978707e11 m)^2 / (31557600 s)^2 ≈ 4.469e37 Joules
export const SIM_ENERGY_TO_JOULES = (SOLAR_MASS_TO_KG * Math.pow(1.495978707e11, 2)) / Math.pow(SECONDS_PER_YEAR, 2);

/**
 * Robust numerical formatter preventing NaN, Infinity, and floating-point overflow
 */
export function formatScientific(value: number, precision: number = 3): string {
  if (isNaN(value)) return '0.000';
  if (!isFinite(value)) return value > 0 ? '+∞' : '-∞';

  const abs = Math.abs(value);
  if (abs === 0) return '0.000';
  if (abs >= 1e6 || abs < 1e-3) {
    return value.toExponential(precision);
  }
  return value.toFixed(precision);
}

/**
 * Format energy values safely in Joules
 */
export function formatJoules(simEnergy: number): string {
  if (isNaN(simEnergy) || !isFinite(simEnergy)) return '0.00 J';
  const joules = simEnergy * SIM_ENERGY_TO_JOULES;
  return `${formatScientific(joules, 2)} J`;
}
