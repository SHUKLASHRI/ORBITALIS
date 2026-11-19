/**
 * ORBITALIS — Astrophysical Constants and Conversion Factors
 * Astronomical Simulation Unit System:
 * - Distance: Astronomical Units (AU)
 * - Mass: Solar Masses (M_sun)
 * - Time: Earth Years (yr)
 * - Velocity: AU / yr
 * In these units: G = 4 * pi^2 ≈ 39.47841760435743 AU^3 / (M_sun * yr^2)
 */

export const G_ASTRONOMICAL = 4 * Math.PI * Math.PI; // 39.47841760435743

// Conversion Constants
export const AU_TO_KM = 149597870.7;
export const KM_TO_AU = 1 / AU_TO_KM;
export const SOLAR_MASS_TO_KG = 1.98847e30;
export const EARTH_MASS_IN_SOLAR = 5.9722e24 / SOLAR_MASS_TO_KG; // ≈ 3.003e-6
export const JUPITER_MASS_IN_SOLAR = 1.898e27 / SOLAR_MASS_TO_KG; // ≈ 9.543e-4
export const SECONDS_PER_YEAR = 365.25 * 86400; // 31557600 s

// Velocity conversions
export const AU_PER_YR_TO_KM_PER_S = AU_TO_KM / SECONDS_PER_YEAR; // ≈ 4.74047 km/s
export const KM_PER_S_TO_AU_PER_YR = 1 / AU_PER_YR_TO_KM_PER_S;   // ≈ 0.210945 (AU/yr)/(km/s)

// Default Plummer Softening parameter (in AU)
export const DEFAULT_SOFTENING = 0.001; // AU

