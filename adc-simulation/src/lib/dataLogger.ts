import { THAI_LARGE_BUSINESS_AVERAGE_TARIFF_2026 } from './electricityTariff';
import { normalizeTamperFields } from './tamperCompatibility';

export interface SimulationLogEntry {
  timestamp: number;
  time: number;
  state: string;
  tamperHeight: number;
  tamperVelocity: number;
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
}

export interface SimulationSample {
  tamperHeight: number;
  tamperVelocity: number;
  tamperMass: number;
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
}

type LegacySimulationSample = Omit<SimulationSample, 'tamperHeight' | 'tamperVelocity' | 'tamperMass'> & {
  pendulumHeight: number;
  pendulumVelocity: number;
  pendulumMass: number;
};

export interface SimulationStatistics {
  sampleCount: number;
  totalTime: number;
  totalEnergyGenerated: number;
  totalEnergyConsumed: number;
  totalSystemUsageKWh: number;
  netEnergy: number;
  electricityRateTHBPerKWh: number;
  estimatedEnergyValueTHB: number;
  estimatedConsumptionCostTHB: number;
  estimatedNetValueTHB: number;
  energyEfficiency: number;
  impactRate: number;
  totalImpacts: number;
  maxSoilCompaction: number;
  meanSoilCompaction: number;
  avgGeneratorPower: number;
  avgMotorPower: number;
  avgSystemPower: number;
  avgBatteryCapacity: number;
  batteryCapacityStdDev: number;
  batteryStabilityIndex: number;
  peakGeneratorPower: number;
  peakMotorPower: number;
  peakSystemPower: number;
  finalSoilDensity: number;
  soilDensityTrend: number;
  compactionPerImpact: number;
  densityGainPerImpact: number;
}

export class DataLogger {
  private logs: SimulationLogEntry[] = [];
  private maxLogs: number;
  private readonly electricityTariff = THAI_LARGE_BUSINESS_AVERAGE_TARIFF_2026;
  
  constructor(maxLogs: number = 10000) {
    this.maxLogs = maxLogs;
  }
  
  public log(data: SimulationSample | LegacySimulationSample): void {
    const normalized = normalizeTamperFields(data);

    if (
      normalized.tamperHeight === undefined ||
      normalized.tamperVelocity === undefined ||
      normalized.tamperMass === undefined
    ) {
      return;
    }

    const entry: SimulationLogEntry = {
      timestamp: Date.now(),
      time: normalized.time,
      state: normalized.state,
      tamperHeight: normalized.tamperHeight,
      tamperVelocity: normalized.tamperVelocity,
      potentialEnergy: normalized.potentialEnergy,
      kineticEnergy: normalized.kineticEnergy,
      totalEnergy: normalized.totalEnergy,
      solarPower: normalized.solarPower,
      motorPower: normalized.motorPower,
      generatorPower: normalized.generatorPower,
      loadPower: normalized.loadPower,
      batteryVoltage: normalized.batteryVoltage,
      batteryCapacity: normalized.batteryCapacity,
      batteryCurrent: normalized.batteryCurrent,
      soilDensity: normalized.soilDensity,
      soilCompaction: normalized.soilCompaction,
      impactCount: normalized.impactCount
    };
    
    this.logs.push(entry);
    

    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }
  
  public getLogs(): SimulationLogEntry[] {
    return [...this.logs];
  }
  
  public clear(): void {
    this.logs = [];
  }
  
  public exportToCSV(): string {
    if (this.logs.length === 0) {
      return '';
    }
    
    const headers = Object.keys(this.logs[0]).join(',');
    const rows = this.logs.map(log => 
      Object.values(log).map(value => 
        typeof value === 'string' ? `"${value}"` : value
      ).join(',')
    );
    
    return [headers, ...rows].join('\n');
  }
  
  public exportToJSON(): string {
    return JSON.stringify(this.logs, null, 2);
  }
  
  public downloadCSV(filename: string = 'adc_simulation_data.csv'): void {
    const csv = this.exportToCSV();
    this.downloadFile(csv, filename, 'text/csv');
  }
  
  public downloadJSON(filename: string = 'adc_simulation_data.json'): void {
    const json = this.exportToJSON();
    this.downloadFile(json, filename, 'application/json');
  }
  
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
  
  public getStatistics(): SimulationStatistics {
    if (this.logs.length === 0) {
      return {
        sampleCount: 0,
        totalTime: 0,
        totalEnergyGenerated: 0,
        totalEnergyConsumed: 0,
        totalSystemUsageKWh: 0,
        netEnergy: 0,
        electricityRateTHBPerKWh: this.electricityTariff.rateTHBPerKWh,
        estimatedEnergyValueTHB: 0,
        estimatedConsumptionCostTHB: 0,
        estimatedNetValueTHB: 0,
        energyEfficiency: 0,
        impactRate: 0,
        totalImpacts: 0,
        maxSoilCompaction: 0,
        meanSoilCompaction: 0,
        avgGeneratorPower: 0,
        avgMotorPower: 0,
        avgSystemPower: 0,
        avgBatteryCapacity: 0,
        batteryCapacityStdDev: 0,
        batteryStabilityIndex: 0,
        peakGeneratorPower: 0,
        peakMotorPower: 0,
        peakSystemPower: 0,
        finalSoilDensity: 0,
        soilDensityTrend: 0,
        compactionPerImpact: 0,
        densityGainPerImpact: 0
      };
    }

    const firstLog = this.logs[0];
    const lastLog = this.logs[this.logs.length - 1];
    const totalTime = Math.max(0, lastLog.time - firstLog.time);
    const totalImpacts = lastLog.impactCount;
    const maxSoilCompaction = Math.max(...this.logs.map(log => log.soilCompaction));
    const meanSoilCompaction = this.calculateMean(this.logs.map(log => log.soilCompaction));
    const finalSoilDensity = lastLog.soilDensity;

    let totalEnergyGenerated = 0;
    let totalEnergyConsumed = 0;
    for (let i = 1; i < this.logs.length; i++) {
      const dt = this.logs[i].time - this.logs[i - 1].time;
      if (dt <= 0) {
        continue;
      }

      const avgGenPower = (this.logs[i].generatorPower + this.logs[i - 1].generatorPower) / 2;
      const avgSystemPower = (
        this.logs[i].motorPower +
        this.logs[i - 1].motorPower +
        this.logs[i].loadPower +
        this.logs[i - 1].loadPower
      ) / 2;
      totalEnergyGenerated += avgGenPower * dt;
      totalEnergyConsumed += avgSystemPower * dt;
    }

    const generatorPowerSeries = this.logs.map(log => log.generatorPower);
    const motorPowerSeries = this.logs.map(log => log.motorPower);
    const batteryCapacitySeries = this.logs.map(log => log.batteryCapacity);
    const soilDensitySeries = this.logs.map(log => log.soilDensity);

    const avgGeneratorPower = this.calculateMean(generatorPowerSeries);
    const avgMotorPower = this.calculateMean(motorPowerSeries);
    const avgSystemPower = this.calculateMean(
      this.logs.map(log => log.motorPower + log.loadPower)
    );
    const avgBatteryCapacity = this.calculateMean(batteryCapacitySeries);
    const batteryCapacityStdDev = this.calculateStandardDeviation(batteryCapacitySeries);
    const peakGeneratorPower = Math.max(...generatorPowerSeries);
    const peakMotorPower = Math.max(...motorPowerSeries);
    const peakSystemPower = Math.max(...this.logs.map(log => log.motorPower + log.loadPower));
    const netEnergy = totalEnergyGenerated - totalEnergyConsumed;
    const electricityRateTHBPerKWh = this.electricityTariff.rateTHBPerKWh;
    const totalEnergyGeneratedKWh = totalEnergyGenerated / 3600000;
    const totalEnergyConsumedKWh = totalEnergyConsumed / 3600000;
    const totalSystemUsageKWh = totalEnergyConsumedKWh;
    const estimatedEnergyValueTHB = totalEnergyGeneratedKWh * electricityRateTHBPerKWh;
    const estimatedConsumptionCostTHB = totalSystemUsageKWh * electricityRateTHBPerKWh;
    const estimatedNetValueTHB = estimatedEnergyValueTHB - estimatedConsumptionCostTHB;
    const energyEfficiency = totalEnergyConsumed > 0 ? (totalEnergyGenerated / totalEnergyConsumed) * 100 : 0;
    const impactRate = totalTime > 0 ? (totalImpacts / totalTime) * 60 : 0;
    const batteryStabilityIndex = this.calculateStabilityIndex(avgBatteryCapacity, batteryCapacityStdDev);
    const soilDensityTrend = this.calculateTrendSlope(
      this.logs.map(log => log.time),
      soilDensitySeries
    );
    const compactionPerImpact = totalImpacts > 0 ? maxSoilCompaction / totalImpacts : 0;
    const densityGainPerImpact = totalImpacts > 0 ? (finalSoilDensity - firstLog.soilDensity) / totalImpacts : 0;
    
    return {
      sampleCount: this.logs.length,
      totalTime,
      totalEnergyGenerated,
      totalEnergyConsumed,
      totalSystemUsageKWh,
      netEnergy,
      electricityRateTHBPerKWh,
      estimatedEnergyValueTHB,
      estimatedConsumptionCostTHB,
      estimatedNetValueTHB,
      energyEfficiency,
      impactRate,
      totalImpacts,
      maxSoilCompaction,
      meanSoilCompaction,
      avgGeneratorPower,
      avgMotorPower,
      avgSystemPower,
      avgBatteryCapacity,
      batteryCapacityStdDev,
      batteryStabilityIndex,
      peakGeneratorPower,
      peakMotorPower,
      peakSystemPower,
      finalSoilDensity,
      soilDensityTrend,
      compactionPerImpact,
      densityGainPerImpact
    };
  }

  private calculateMean(values: number[]): number {
    if (values.length === 0) {
      return 0;
    }

    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  private calculateStandardDeviation(values: number[]): number {
    if (values.length <= 1) {
      return 0;
    }

    const mean = this.calculateMean(values);
    const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / (values.length - 1);
    return Math.sqrt(variance);
  }

  private calculateStabilityIndex(mean: number, stdDev: number): number {
    if (mean === 0) {
      return 0;
    }

    const coefficientOfVariation = Math.abs(stdDev / mean);
    return Math.max(0, 100 - coefficientOfVariation * 100);
  }

  private calculateTrendSlope(xValues: number[], yValues: number[]): number {
    if (xValues.length !== yValues.length || xValues.length <= 1) {
      return 0;
    }

    const xMean = this.calculateMean(xValues);
    const yMean = this.calculateMean(yValues);

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < xValues.length; i++) {
      const xDelta = xValues[i] - xMean;
      const yDelta = yValues[i] - yMean;
      numerator += xDelta * yDelta;
      denominator += Math.pow(xDelta, 2);
    }

    return denominator > 0 ? numerator / denominator : 0;
  }
}
