import { SoilType } from './formulas';

export interface SimulationConfig {
  tamperMass: number;
  maxHeight: number;
  gravity: number;
  motorPower: number;
  solarPower: number;
  batteryVoltage: number;
  batteryCapacity: number;
  motorEfficiency: number;
  generatorEfficiency: number;
  initialSoilDensity: number;

  soilType: SoilType;
  dragCoefficient: number;
  gearRatio: number;
  loadResistance: number;
}

export const DEFAULT_SIMULATION_CONFIG: SimulationConfig = {
  tamperMass: 5,
  maxHeight: 15,
  gravity: 9.81,
  motorPower: 650,
  solarPower: 750,
  batteryVoltage: 24,
  batteryCapacity: 50,
  motorEfficiency: 0.85,
  generatorEfficiency: 0.9,
  initialSoilDensity: 1600,

  soilType: 'sand',
  dragCoefficient: 0.82,
  gearRatio: 250.0,
  loadResistance: 2.0,
};

const clampNumber = (value: unknown, fallback: number, min: number, max: number): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, value));
};

const sanitizeSoilType = (value: unknown): SoilType => {
  if (value === 'sand' || value === 'clay' || value === 'gravel' || value === 'loam') {
    return value as SoilType;
  }
  return 'sand';
};

export const sanitizeSimulationConfig = (input: unknown): SimulationConfig => {
  const source = typeof input === 'object' && input !== null ? (input as Record<string, unknown>) : {};

  return {
    tamperMass: clampNumber(source.tamperMass, DEFAULT_SIMULATION_CONFIG.tamperMass, 1, 50000),
    maxHeight: clampNumber(source.maxHeight, DEFAULT_SIMULATION_CONFIG.maxHeight, 1, 100),
    gravity: clampNumber(source.gravity, DEFAULT_SIMULATION_CONFIG.gravity, 1, 30),
    motorPower: clampNumber(source.motorPower, DEFAULT_SIMULATION_CONFIG.motorPower, 0, 100000),
    solarPower: clampNumber(source.solarPower, DEFAULT_SIMULATION_CONFIG.solarPower, 0, 100000),
    batteryVoltage: clampNumber(source.batteryVoltage, DEFAULT_SIMULATION_CONFIG.batteryVoltage, 1, 1000),
    batteryCapacity: clampNumber(source.batteryCapacity, DEFAULT_SIMULATION_CONFIG.batteryCapacity, 0, 100),
    motorEfficiency: clampNumber(source.motorEfficiency, DEFAULT_SIMULATION_CONFIG.motorEfficiency, 0.1, 1),
    generatorEfficiency: clampNumber(source.generatorEfficiency, DEFAULT_SIMULATION_CONFIG.generatorEfficiency, 0.1, 1),
    initialSoilDensity: clampNumber(source.initialSoilDensity, DEFAULT_SIMULATION_CONFIG.initialSoilDensity, 1000, 4000),

    soilType: sanitizeSoilType(source.soilType),
    dragCoefficient: clampNumber(source.dragCoefficient, DEFAULT_SIMULATION_CONFIG.dragCoefficient, 0, 10),
    gearRatio: clampNumber(source.gearRatio, DEFAULT_SIMULATION_CONFIG.gearRatio, 1, 1000),
    loadResistance: clampNumber(source.loadResistance, DEFAULT_SIMULATION_CONFIG.loadResistance, 0.1, 100),
  };
};