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

export function calculateSoilDensity(soilCompactionPercent: number): number {
  const clampedCompaction = Math.max(0, Math.min(100, soilCompactionPercent));
  return INITIAL_SOIL_DENSITY + (clampedCompaction / 100) * (MAX_SOIL_DENSITY - INITIAL_SOIL_DENSITY);
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
