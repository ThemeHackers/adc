export const IMPACT_ENERGY_FACTOR = 0.5;
export const SOIL_COMPACTION_FACTOR = 0.0002;
export const INITIAL_SOIL_DENSITY = 1600;
export const MAX_SOIL_DENSITY = 2000;
export const GENERATOR_EFFICIENCY = 0.9;
export const LOAD_EFFICIENCY = 0.8;
export const BATTERY_REFERENCE_CAPACITY_AH = 50;
export const BATTERY_SYSTEM_VOLTAGE = 24;
export const SENSOR_RAW_MIN = 0;
export const SENSOR_RAW_MAX = 4095;

export function calculateImpactEnergy(massKg: number, velocityMps: number): number {
  return IMPACT_ENERGY_FACTOR * massKg * Math.pow(velocityMps, 2);
}

export function calculateCompactionIncrease(impactEnergyJ: number): number {
  return impactEnergyJ * SOIL_COMPACTION_FACTOR;
}

export function calculateSoilDensity(soilCompactionPercent: number, initialDensity = INITIAL_SOIL_DENSITY, maxDensity = MAX_SOIL_DENSITY): number {
  const clampedCompaction = Math.max(0, Math.min(100, soilCompactionPercent));
  return initialDensity + (clampedCompaction / 100) * (maxDensity - initialDensity);
}

export function calculateGeneratorPower(
  massKg: number,
  gravity: number,
  descentVelocityMps: number,
  efficiency: number = GENERATOR_EFFICIENCY,
): number {
  return (massKg * gravity * descentVelocityMps) * efficiency;
}

export function calculateLoadPower(generatorPowerW: number): number {
  return generatorPowerW * LOAD_EFFICIENCY;
}

export function calculateBatteryCapacityDelta(
  batteryCurrentA: number,
  dtSeconds: number,
  capacityAh: number = BATTERY_REFERENCE_CAPACITY_AH,
): number {
  return (batteryCurrentA * dtSeconds / capacityAh) * 100;
}

export function normalizeRawValue(rawValue: number, minRaw: number, maxRaw: number): number {
  const range = maxRaw - minRaw;
  if (range <= 0) {
    return 0;
  }

  const normalized = (rawValue - minRaw) / range;
  return Math.max(0, Math.min(1, normalized));
}

export function calibrateLinearValue(
  rawValue: number,
  minRaw: number,
  maxRaw: number,
  minCalibrated: number,
  maxCalibrated: number,
  offset: number = 0,
  scale: number = 1,
): number {
  const normalized = normalizeRawValue(rawValue, minRaw, maxRaw);
  const calibrated = minCalibrated + normalized * (maxCalibrated - minCalibrated);
  return (calibrated + offset) * scale;
}

export const CYLINDER_DENSITY_STEEL = 7850; 
export const CYLINDER_ASPECT_RATIO_H_TO_R = 3; 

export function calculateCylinderVolume(massKg: number, density: number = CYLINDER_DENSITY_STEEL): number {
  return massKg / density;
}

export function calculateCylinderRadius(volumeM3: number, aspectRatio: number = CYLINDER_ASPECT_RATIO_H_TO_R): number {
  return Math.pow(volumeM3 / (Math.PI * aspectRatio), 1 / 3);
}

export function calculateCylinderHeight(radiusM: number, aspectRatio: number = CYLINDER_ASPECT_RATIO_H_TO_R): number {
  return radiusM * aspectRatio;
}

export function calculateCylinderBottomArea(radiusM: number): number {
  return Math.PI * Math.pow(radiusM, 2);
}

export function calculateCylinderImpactPressure(forceNewtons: number, radiusM: number): number {
  const area = calculateCylinderBottomArea(radiusM);
  return area > 0 ? forceNewtons / area : 0;
}

// ==========================================
// NEW PHYSICS & MATHEMATICS ENGINE ADDITIONS
// ==========================================

export const AIR_DENSITY = 1.225; // kg/m^3
export const AMBIENT_TEMP = 25.0; // °C
export const BATTERY_THERMAL_MASS = 1200; // J/K
export const BATTERY_COOLING_COEFF = 1.5; // W/K
export const GENERATOR_COUPLING_FACTOR = 0.15; // Ke/Kt equivalent factor
export const GENERATOR_INTERNAL_RESISTANCE = 0.4; // Ohm

export type SoilType = 'sand' | 'clay' | 'gravel' | 'loam';

export interface SoilProperties {
  initialDensity: number;
  maxDensity: number;
  initialStiffness: number; // k0 (N/m)
  ultimateBearingCapacity: number; // qu (Pa)
}

export const SOIL_DATABASE: Record<SoilType, SoilProperties> = {
  sand: {
    initialDensity: 1500,
    maxDensity: 1900,
    initialStiffness: 2.0e6,
    ultimateBearingCapacity: 200e3,
  },
  clay: {
    initialDensity: 1600,
    maxDensity: 1800,
    initialStiffness: 1.0e6,
    ultimateBearingCapacity: 100e3,
  },
  gravel: {
    initialDensity: 1800,
    maxDensity: 2200,
    initialStiffness: 8.0e6,
    ultimateBearingCapacity: 600e3,
  },
  loam: {
    initialDensity: 1400,
    maxDensity: 1850,
    initialStiffness: 1.5e6,
    ultimateBearingCapacity: 150e3,
  },
};

export function calculateDragForce(velocityMps: number, areaM2: number, Cd: number): number {
  // Fd = 0.5 * rho * Cd * A * v^2 * sign(v)
  const direction = velocityMps >= 0 ? 1 : -1;
  return 0.5 * AIR_DENSITY * Cd * areaM2 * Math.pow(velocityMps, 2) * direction;
}

export function calculateSoilStiffness(compactionPercent: number, soilType: SoilType): number {
  const props = SOIL_DATABASE[soilType] || SOIL_DATABASE.sand;
  const ratio = Math.max(0, Math.min(100, compactionPercent)) / 100;
  // Non-linear increase: stiffness increases by up to 4x at full compaction
  return props.initialStiffness * (1 + 3 * Math.pow(ratio, 2));
}

export function calculateImpactMechanics(
  kineticEnergyJ: number,
  soilStiffnessNm: number,
  bottomAreaM2: number,
  ultimateBearingCapacityPa: number,
) {
  if (kineticEnergyJ <= 0) {
    return { peakForceN: 0, craterDepthM: 0, contactPressurePa: 0, plasticDeformation: false };
  }

  // Work-Energy: Ek = 0.5 * ks * d_crater^2  => d_crater = sqrt(2 * Ek / ks)
  const craterDepthM = Math.sqrt((2 * kineticEnergyJ) / soilStiffnessNm);
  // Fpeak = ks * d_crater
  const peakForceN = soilStiffnessNm * craterDepthM;
  // Contact Pressure: P = F / A
  const contactPressurePa = bottomAreaM2 > 0 ? peakForceN / bottomAreaM2 : 0;
  // Plastic compaction occurs if impact pressure exceeds bearing capacity
  const plasticDeformation = contactPressurePa > ultimateBearingCapacityPa;

  return {
    peakForceN,
    craterDepthM,
    contactPressurePa,
    plasticDeformation,
  };
}

export function calculateGeneratorEMF(velocityMps: number, gearRatio: number): number {
  // Back EMF: Eg = Ke * omega_generator, where omega_generator = (v / pulley_radius) * gearRatio.
  // We combine Ke and mechanical constants into GENERATOR_COUPLING_FACTOR.
  return GENERATOR_COUPLING_FACTOR * gearRatio * Math.abs(velocityMps);
}

export function calculateGeneratorCurrent(
  emfVolts: number,
  batteryVoltage: number,
  loadResistance: number,
): number {
  if (emfVolts <= batteryVoltage) {
    return 0; // Current blocked by rectifier/diodes
  }
  const totalResistance = loadResistance + GENERATOR_INTERNAL_RESISTANCE;
  return (emfVolts - batteryVoltage) / totalResistance;
}

export function calculateGeneratorBrakingForce(
  currentAmps: number,
  gearRatio: number,
  velocityMps: number,
): number {
  // F_brake = Kt * gearRatio * Ia * sign(v)
  // Assumes Kt = Ke (ideal coupling)
  const direction = velocityMps >= 0 ? 1 : -1;
  return GENERATOR_COUPLING_FACTOR * gearRatio * currentAmps * direction;
}

export function getBatteryOCV(capacityPercent: number, systemVoltage: number): number {
  const soc = Math.max(0, Math.min(100, capacityPercent)) / 100;
  if (systemVoltage > 36) {
    return 44.0 + soc * 12.0; // 48V Lithium-ion system range (44V to 56V)
  } else {
    return 22.0 + soc * 6.0;  // 24V Lithium-ion system range (22V to 28V)
  }
}

export function getBatteryInternalResistance(systemVoltage: number): number {
  return systemVoltage > 36 ? 0.08 : 0.04; // 48V has higher internal resistance
}

export function calculateBatteryTerminalVoltage(
  capacityPercent: number,
  currentAmps: number,
  systemVoltage: number,
): number {
  const ocv = getBatteryOCV(capacityPercent, systemVoltage);
  const rInt = getBatteryInternalResistance(systemVoltage);
  // Charging (current > 0) increases terminal voltage, discharging (current < 0) decreases it
  return Math.max(0, ocv + currentAmps * rInt);
}

export function calculateBatteryTemperatureDelta(
  currentAmps: number,
  systemVoltage: number,
  currentTempCelsius: number,
  dtSeconds: number,
): number {
  const rInt = getBatteryInternalResistance(systemVoltage);
  // I^2 * R heating
  const heatGeneratedW = Math.pow(currentAmps, 2) * rInt;
  // Convective cooling: P_cool = h_cool * (T_batt - T_amb)
  const heatDissipatedW = BATTERY_COOLING_COEFF * (currentTempCelsius - AMBIENT_TEMP);
  // dT = (P_heat - P_cool) / C_thermal * dt
  const dT_dt = (heatGeneratedW - heatDissipatedW) / BATTERY_THERMAL_MASS;
  return dT_dt * dtSeconds;
}
