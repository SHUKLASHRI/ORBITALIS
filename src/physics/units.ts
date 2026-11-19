/**
 * ORBITALIS — Human-Readable Astrophysical Unit Conversions & Safe Formatters
 *
 * Strictly eliminates scientific "e" notation across the entire application.
 * Automatically dynamically shifts units (M☉, M_Jup, M⊕, M_Moon, km, AU, m/s, Joules)
 * so humans can comprehend astronomical scales intuitively.
 */

import {
  AU_TO_KM,
  SOLAR_MASS_TO_KG,
  AU_PER_YR_TO_KM_PER_S,
  SIM_ENERGY_TO_JOULES,
} from './constants';

export const EARTH_MASS_IN_SOLAR = 5.9722e24 / SOLAR_MASS_TO_KG; // ≈ 3.003e-6 M☉
export const JUPITER_MASS_IN_SOLAR = 1.898e27 / SOLAR_MASS_TO_KG; // ≈ 9.543e-4 M☉
export const MOON_MASS_IN_SOLAR = 7.342e22 / SOLAR_MASS_TO_KG;   // ≈ 3.692e-8 M☉

export type MassUnit = 'solar' | 'jupiter' | 'earth' | 'moon' | 'trillion_tonnes' | 'billion_tonnes';
export type DistanceUnit = 'au' | 'million_km' | 'thousand_km' | 'km';

/**
 * Convert internal mass (Solar Masses M☉) to a selected unit value
 */
export function convertMassFromSolar(solarMass: number, unit: MassUnit): number {
  switch (unit) {
    case 'solar':
      return solarMass;
    case 'jupiter':
      return solarMass / JUPITER_MASS_IN_SOLAR;
    case 'earth':
      return solarMass / EARTH_MASS_IN_SOLAR;
    case 'moon':
      return solarMass / MOON_MASS_IN_SOLAR;
    case 'trillion_tonnes':
      return (solarMass * SOLAR_MASS_TO_KG) / 1e15;
    case 'billion_tonnes':
      return (solarMass * SOLAR_MASS_TO_KG) / 1e12;
  }
}

/**
 * Convert user input in selected unit back to internal Solar Masses M☉
 */
export function convertMassToSolar(value: number, unit: MassUnit): number {
  const safeVal = Math.max(0, value);
  switch (unit) {
    case 'solar':
      return safeVal;
    case 'jupiter':
      return safeVal * JUPITER_MASS_IN_SOLAR;
    case 'earth':
      return safeVal * EARTH_MASS_IN_SOLAR;
    case 'moon':
      return safeVal * MOON_MASS_IN_SOLAR;
    case 'trillion_tonnes':
      return (safeVal * 1e15) / SOLAR_MASS_TO_KG;
    case 'billion_tonnes':
      return (safeVal * 1e12) / SOLAR_MASS_TO_KG;
  }
}

/**
 * Convert internal radius (AU) to selected unit value
 */
export function convertRadiusFromAU(au: number, unit: DistanceUnit): number {
  const km = au * AU_TO_KM;
  switch (unit) {
    case 'au':
      return au;
    case 'million_km':
      return km / 1e6;
    case 'thousand_km':
      return km / 1e3;
    case 'km':
      return km;
  }
}

/**
 * Convert user input in selected unit back to AU
 */
export function convertRadiusToAU(value: number, unit: DistanceUnit): number {
  const safeVal = Math.max(0, value);
  switch (unit) {
    case 'au':
      return safeVal;
    case 'million_km':
      return (safeVal * 1e6) / AU_TO_KM;
    case 'thousand_km':
      return (safeVal * 1e3) / AU_TO_KM;
    case 'km':
      return safeVal / AU_TO_KM;
  }
}

/**
 * Automatically format mass with dynamic astronomical units — NEVER outputs 'e'
 */
export function formatDynamicMass(solarMass: number): string {
  if (isNaN(solarMass) || solarMass <= 0) return '0.000 kg';

  if (solarMass >= 0.1) {
    return `${solarMass.toFixed(3)} M☉`;
  }
  if (solarMass >= JUPITER_MASS_IN_SOLAR * 0.5) {
    const jup = solarMass / JUPITER_MASS_IN_SOLAR;
    return `${jup.toFixed(2)} M_Jup`;
  }
  if (solarMass >= EARTH_MASS_IN_SOLAR * 0.05) {
    const earth = solarMass / EARTH_MASS_IN_SOLAR;
    return `${earth.toFixed(3)} M⊕`;
  }
  if (solarMass >= MOON_MASS_IN_SOLAR * 0.1) {
    const moon = solarMass / MOON_MASS_IN_SOLAR;
    return `${moon.toFixed(2)} M_Moon`;
  }

  // Small asteroid masses in tonnes
  const kg = solarMass * SOLAR_MASS_TO_KG;
  if (kg >= 1e18) {
    return `${(kg / 1e18).toFixed(2)} Quintillion tonnes`;
  }
  if (kg >= 1e15) {
    return `${(kg / 1e15).toFixed(2)} Trillion tonnes`;
  }
  if (kg >= 1e12) {
    return `${(kg / 1e12).toFixed(2)} Billion tonnes`;
  }
  if (kg >= 1e9) {
    return `${(kg / 1e9).toFixed(2)} Million tonnes`;
  }
  if (kg >= 1e3) {
    return `${(kg / 1e3).toFixed(1)} tonnes`;
  }
  return `${Math.round(kg)} kg`;
}

/**
 * Automatically format physical radius or distance — NEVER outputs 'e'
 */
export function formatDynamicDistance(au: number): string {
  if (isNaN(au) || au <= 0) return '0 m';

  if (au >= 10000) {
    return `${(au / 63241.1).toFixed(2)} Light-years`;
  }
  if (au >= 0.1) {
    return `${au.toFixed(3)} AU`;
  }

  const km = au * AU_TO_KM;
  if (km >= 1e6) {
    return `${(km / 1e6).toFixed(2)} Million km`;
  }
  if (km >= 1000) {
    return `${Math.round(km).toLocaleString()} km`;
  }
  if (km >= 1) {
    return `${km.toFixed(1)} km`;
  }
  return `${Math.round(km * 1000).toLocaleString()} meters`;
}

/**
 * Format physical radius specifically in kilometers/meters
 */
export function formatRadiusKm(au: number): string {
  if (isNaN(au) || au <= 0) return '0 km';
  const km = au * AU_TO_KM;
  if (km >= 1e6) {
    return `${(km / 1e6).toFixed(2)}M km`;
  }
  if (km >= 10) {
    return `${Math.round(km).toLocaleString()} km`;
  }
  if (km >= 0.1) {
    return `${km.toFixed(2)} km`;
  }
  return `${Math.round(km * 1000).toLocaleString()} m`;
}

/**
 * Format velocity in km/s or AU/yr — NEVER outputs 'e'
 */
export function formatDynamicVelocity(auPerYr: number): { kms: string; auyr: string } {
  if (isNaN(auPerYr)) return { kms: '0.00 km/s', auyr: '0.000 AU/yr' };
  const kms = auPerYr * AU_PER_YR_TO_KM_PER_S;

  let kmsStr: string;
  if (Math.abs(kms) >= 1) {
    kmsStr = `${kms.toFixed(2)} km/s`;
  } else if (Math.abs(kms) >= 0.001) {
    kmsStr = `${(kms * 1000).toFixed(1)} m/s`;
  } else {
    kmsStr = `${(kms * 100000).toFixed(1)} cm/s`;
  }

  return {
    kms: kmsStr,
    auyr: `${auPerYr.toFixed(3)} AU/yr`,
  };
}

/**
 * Format Hamiltonian mechanical energy into clean dynamic units — NEVER outputs 'e'
 */
export function formatDynamicEnergy(simEnergy: number): { value: string; unit: string; joulesLabel: string } {
  if (isNaN(simEnergy)) return { value: '0.000', unit: 'units', joulesLabel: '0 Joules' };

  const sign = simEnergy < 0 ? '-' : '';
  const abs = Math.abs(simEnergy);

  let valueStr: string;
  let unitStr: string;

  if (abs >= 1e6) {
    valueStr = `${sign}${(abs / 1e6).toFixed(3)}`;
    unitStr = 'Mega-units (M-H)';
  } else if (abs >= 1e3) {
    valueStr = `${sign}${(abs / 1e3).toFixed(3)}`;
    unitStr = 'Kilo-units (k-H)';
  } else if (abs >= 1.0) {
    valueStr = `${sign}${abs.toFixed(3)}`;
    unitStr = 'Units (H)';
  } else if (abs >= 1e-3) {
    valueStr = `${sign}${(abs * 1e3).toFixed(3)}`;
    unitStr = 'milli-units (m-H)';
  } else if (abs >= 1e-6) {
    valueStr = `${sign}${(abs * 1e6).toFixed(3)}`;
    unitStr = 'micro-units (µ-H)';
  } else if (abs >= 1e-9) {
    valueStr = `${sign}${(abs * 1e9).toFixed(3)}`;
    unitStr = 'nano-units (n-H)';
  } else if (abs >= 1e-12) {
    valueStr = `${sign}${(abs * 1e12).toFixed(3)}`;
    unitStr = 'pico-units (p-H)';
  } else {
    valueStr = '0.000';
    unitStr = 'units (H)';
  }

  // Real Joules scale
  const joules = abs * SIM_ENERGY_TO_JOULES;
  let joulesLabel: string;
  if (joules >= 1e44) {
    joulesLabel = `${sign}${(joules / 1e44).toFixed(2)} Foe (10⁴⁴ J)`;
  } else if (joules >= 1e36) {
    joulesLabel = `${sign}${(joules / 1e36).toFixed(2)} Yotta-Yotta-Joules`;
  } else if (joules >= 1e30) {
    joulesLabel = `${sign}${(joules / 1e30).toFixed(2)} Million YJ`;
  } else if (joules >= 1e24) {
    joulesLabel = `${sign}${(joules / 1e24).toFixed(2)} YottaJoules (YJ)`;
  } else if (joules >= 1e21) {
    joulesLabel = `${sign}${(joules / 1e21).toFixed(2)} ZettaJoules (ZJ)`;
  } else if (joules >= 1e18) {
    joulesLabel = `${sign}${(joules / 1e18).toFixed(2)} ExaJoules (EJ)`;
  } else if (joules >= 1e15) {
    joulesLabel = `${sign}${(joules / 1e15).toFixed(2)} PetaJoules (PJ)`;
  } else if (joules >= 1e12) {
    joulesLabel = `${sign}${(joules / 1e12).toFixed(2)} TeraJoules (TJ)`;
  } else if (joules >= 1e9) {
    joulesLabel = `${sign}${(joules / 1e9).toFixed(2)} GigaJoules (GJ)`;
  } else {
    joulesLabel = `${sign}${joules.toFixed(1)} Joules`;
  }

  return {
    value: valueStr,
    unit: unitStr,
    joulesLabel,
  };
}

/**
 * Format Linear & Angular Momentum cleanly — NEVER outputs 'e'
 */
export function formatDynamicMomentum(val: number, isAngular: boolean = false): string {
  if (isNaN(val)) return '0.000';
  const sign = val < 0 ? '-' : '';
  const abs = Math.abs(val);

  const baseUnit = isAngular ? 'AU²/yr' : 'AU/yr';

  if (abs >= 1e3) {
    return `${sign}${(abs / 1e3).toFixed(3)} k(M☉·${baseUnit})`;
  }
  if (abs >= 1.0) {
    return `${sign}${abs.toFixed(3)} M☉·${baseUnit}`;
  }
  if (abs >= 1e-3) {
    return `${sign}${(abs * 1e3).toFixed(3)} milli(M☉·${baseUnit})`;
  }
  if (abs >= 1e-6) {
    return `${sign}${(abs * 1e6).toFixed(3)} micro(M☉·${baseUnit})`;
  }
  if (abs >= 1e-9) {
    return `${sign}${(abs * 1e9).toFixed(3)} nano(M☉·${baseUnit})`;
  }
  return '0.000 (Conserved)';
}

/**
 * Format number with sign and metric prefix for graph axis labels — NEVER outputs 'e'
 */
export function formatAxisLabel(val: number): string {
  if (isNaN(val) || Math.abs(val) < 1e-12) return '0.00';
  const sign = val < 0 ? '-' : '+';
  const abs = Math.abs(val);

  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(2)}k`;
  if (abs >= 1) return `${sign}${abs.toFixed(2)}`;
  if (abs >= 1e-3) return `${sign}${(abs * 1e3).toFixed(2)}m`;
  if (abs >= 1e-6) return `${sign}${(abs * 1e6).toFixed(2)}µ`;
  if (abs >= 1e-9) return `${sign}${(abs * 1e9).toFixed(2)}n`;
  return `${sign}${abs.toFixed(2)}`;
}
