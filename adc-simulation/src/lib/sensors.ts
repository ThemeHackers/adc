import {
  SENSOR_RAW_MAX,
  SENSOR_RAW_MIN,
  calibrateLinearValue,
} from './formulas';

export interface SensorReading {
  sensorId: string;
  sensorType: SensorType;
  rawValue: number;
  calibratedValue: number;
  unit: string;
  timestamp: number;
}

export type SensorType = 
  | 'HEIGHT'
  | 'VELOCITY'
  | 'CURRENT'
  | 'VOLTAGE'
  | 'FORCE'
  | 'SOIL_DENSITY'
  | 'SOIL_MOISTURE';

export interface SensorConfig {
  sensorId: string;
  sensorType: SensorType;
  minRaw: number;
  maxRaw: number;
  minCalibrated: number;
  maxCalibrated: number;
  offset: number;
  scale: number;
  unit: string;
  sampleRate: number;
}

export class SensorCalibrator {
  private configs: Map<string, SensorConfig>;

  constructor() {
    this.configs = new Map();
    this.initializeDefaultConfigs();
  }

  private initializeDefaultConfigs(): void {
    const defaultConfigs: SensorConfig[] = [
      {
        sensorId: 'height_sensor',
        sensorType: 'HEIGHT',
        minRaw: SENSOR_RAW_MIN,
        maxRaw: SENSOR_RAW_MAX,
        minCalibrated: 0,
        maxCalibrated: 15,
        offset: 0,
        scale: 1,
        unit: 'm',
        sampleRate: 100
      },
      {
        sensorId: 'velocity_sensor',
        sensorType: 'VELOCITY',
        minRaw: SENSOR_RAW_MIN,
        maxRaw: SENSOR_RAW_MAX,
        minCalibrated: -20,
        maxCalibrated: 20,
        offset: 0,
        scale: 1,
        unit: 'm/s',
        sampleRate: 100
      },
      {
        sensorId: 'current_sensor',
        sensorType: 'CURRENT',
        minRaw: SENSOR_RAW_MIN,
        maxRaw: SENSOR_RAW_MAX,
        minCalibrated: 0,
        maxCalibrated: 50,
        offset: 0,
        scale: 1,
        unit: 'A',
        sampleRate: 100
      },
      {
        sensorId: 'voltage_sensor',
        sensorType: 'VOLTAGE',
        minRaw: SENSOR_RAW_MIN,
        maxRaw: SENSOR_RAW_MAX,
        minCalibrated: 0,
        maxCalibrated: 30,
        offset: 0,
        scale: 1,
        unit: 'V',
        sampleRate: 100
      },
      {
        sensorId: 'force_sensor',
        sensorType: 'FORCE',
        minRaw: SENSOR_RAW_MIN,
        maxRaw: SENSOR_RAW_MAX,
        minCalibrated: 0,
        maxCalibrated: 10000,
        offset: 0,
        scale: 1,
        unit: 'N',
        sampleRate: 100
      },
      {
        sensorId: 'soil_density_sensor',
        sensorType: 'SOIL_DENSITY',
        minRaw: SENSOR_RAW_MIN,
        maxRaw: SENSOR_RAW_MAX,
        minCalibrated: 1400,
        maxCalibrated: 2000,
        offset: 0,
        scale: 1,
        unit: 'kg/m³',
        sampleRate: 1000
      }
    ];

    defaultConfigs.forEach(config => {
      this.configs.set(config.sensorId, config);
    });
  }

  public addConfig(config: SensorConfig): void {
    this.configs.set(config.sensorId, config);
  }

  public getConfig(sensorId: string): SensorConfig | undefined {
    return this.configs.get(sensorId);
  }

  public calibrate(rawValue: number, sensorId: string): number {
    const config = this.configs.get(sensorId);
    if (!config) {
      return rawValue;
    }

    return calibrateLinearValue(
      rawValue,
      config.minRaw,
      config.maxRaw,
      config.minCalibrated,
      config.maxCalibrated,
      config.offset,
      config.scale,
    );
  }

  public createReading(sensorId: string, rawValue: number): SensorReading {
    const config = this.configs.get(sensorId);
    if (!config) {
      throw new Error(`Sensor config not found for ${sensorId}`);
    }

    const calibratedValue = this.calibrate(rawValue, sensorId);

    return {
      sensorId,
      sensorType: config.sensorType,
      rawValue,
      calibratedValue,
      unit: config.unit,
      timestamp: Date.now()
    };
  }
}

export class SensorDataProcessor {
  private calibrator: SensorCalibrator;
  private readings: Map<string, SensorReading[]>;
  private maxReadingsPerSensor: number = 100;

  constructor() {
    this.calibrator = new SensorCalibrator();
    this.readings = new Map();
  }

  public addReading(sensorId: string, rawValue: number): SensorReading {
    const reading = this.calibrator.createReading(sensorId, rawValue);
    
    if (!this.readings.has(sensorId)) {
      this.readings.set(sensorId, []);
    }

    const sensorReadings = this.readings.get(sensorId)!;
    sensorReadings.push(reading);

    if (sensorReadings.length > this.maxReadingsPerSensor) {
      sensorReadings.shift();
    }

    return reading;
  }

  public getLatestReading(sensorId: string): SensorReading | null {
    const readings = this.readings.get(sensorId);
    if (!readings || readings.length === 0) {
      return null;
    }
    return readings[readings.length - 1];
  }

  public getAverageReading(sensorId: string, windowSize: number = 10): number | null {
    const readings = this.readings.get(sensorId);
    if (!readings || readings.length === 0) {
      return null;
    }

    const recentReadings = readings.slice(-windowSize);
    const sum = recentReadings.reduce((acc, r) => acc + r.calibratedValue, 0);
    return sum / recentReadings.length;
  }

  public getAllLatestReadings(): Map<string, SensorReading> {
    const latest = new Map<string, SensorReading>();
    
    this.readings.forEach((readings, sensorId) => {
      if (readings.length > 0) {
        latest.set(sensorId, readings[readings.length - 1]);
      }
    });

    return latest;
  }

  public convertToHardwareData(): Partial<HardwareData> {
    const latest = this.getAllLatestReadings();
    
    const heightReading = latest.get('height_sensor');
    const velocityReading = latest.get('velocity_sensor');
    const currentReading = latest.get('current_sensor');
    const voltageReading = latest.get('voltage_sensor');
    const forceReading = latest.get('force_sensor');
    const soilDensityReading = latest.get('soil_density_sensor');

    const hardwareData: Partial<HardwareData> = {
      pendulumHeight: heightReading?.calibratedValue ?? 0,
      pendulumVelocity: velocityReading?.calibratedValue ?? 0,
      batteryCurrent: currentReading?.calibratedValue ?? 0,
      batteryVoltage: voltageReading?.calibratedValue ?? 24,
      soilDensity: soilDensityReading?.calibratedValue ?? 1600,
      timestamp: Date.now()
    };

    if (forceReading && forceReading.calibratedValue > 500) {
      hardwareData.impactCount = 1;
    }

    return hardwareData;
  }
}

export interface HardwareData {
  pendulumHeight: number;
  pendulumVelocity: number;
  pendulumMass: number;
  potentialEnergy: number;
  kineticEnergy: number;
  totalEnergy: number;
  solarPower: number;
  motorPower: number;
  generatorPower: number;
  loadPower: number;
  batteryVoltage: number;
  batteryCapacity: number;
  batteryCurrent: number;
  soilDensity: number;
  soilCompaction: number;
  impactCount: number;
  state: string;
  time: number;
  timestamp: number;
}
