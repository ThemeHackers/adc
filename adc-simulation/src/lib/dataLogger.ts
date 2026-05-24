export interface SimulationLogEntry {
  timestamp: number;
  time: number;
  state: string;
  pendulumHeight: number;
  pendulumVelocity: number;
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

export class DataLogger {
  private logs: SimulationLogEntry[] = [];
  private maxLogs: number;
  
  constructor(maxLogs: number = 10000) {
    this.maxLogs = maxLogs;
  }
  
  public log(data: any): void {
    const entry: SimulationLogEntry = {
      timestamp: Date.now(),
      time: data.time,
      state: data.state,
      pendulumHeight: data.pendulumHeight,
      pendulumVelocity: data.pendulumVelocity,
      potentialEnergy: data.potentialEnergy,
      kineticEnergy: data.kineticEnergy,
      totalEnergy: data.totalEnergy,
      solarPower: data.solarPower,
      motorPower: data.motorPower,
      generatorPower: data.generatorPower,
      loadPower: data.loadPower,
      batteryVoltage: data.batteryVoltage,
      batteryCapacity: data.batteryCapacity,
      batteryCurrent: data.batteryCurrent,
      soilDensity: data.soilDensity,
      soilCompaction: data.soilCompaction,
      impactCount: data.impactCount
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
  
  public getStatistics(): {
    totalTime: number;
    totalEnergyGenerated: number;
    totalImpacts: number;
    maxSoilCompaction: number;
    avgGeneratorPower: number;
    avgMotorPower: number;
    avgBatteryCapacity: number;
    finalSoilDensity: number;
    totalEnergyConsumed: number;
    efficiency: number;
  } {
    if (this.logs.length === 0) {
      return {
        totalTime: 0,
        totalEnergyGenerated: 0,
        totalImpacts: 0,
        maxSoilCompaction: 0,
        avgGeneratorPower: 0,
        avgMotorPower: 0,
        avgBatteryCapacity: 0,
        finalSoilDensity: 0,
        totalEnergyConsumed: 0,
        efficiency: 0
      };
    }
    
    const totalTime = this.logs[this.logs.length - 1].time;
    const totalImpacts = this.logs[this.logs.length - 1].impactCount;
    const maxSoilCompaction = Math.max(...this.logs.map(log => log.soilCompaction));
    const finalSoilDensity = this.logs[this.logs.length - 1].soilDensity;
    
    let totalEnergyGenerated = 0;
    let totalEnergyConsumed = 0;
    for (let i = 1; i < this.logs.length; i++) {
      const dt = this.logs[i].time - this.logs[i - 1].time;
      const avgGenPower = (this.logs[i].generatorPower + this.logs[i - 1].generatorPower) / 2;
      const avgMotorPower = (this.logs[i].motorPower + this.logs[i - 1].motorPower) / 2;
      totalEnergyGenerated += avgGenPower * dt;
      totalEnergyConsumed += avgMotorPower * dt;
    }
    
    const avgGeneratorPower = this.logs.reduce((sum, log) => sum + log.generatorPower, 0) / this.logs.length;
    const avgMotorPower = this.logs.reduce((sum, log) => sum + log.motorPower, 0) / this.logs.length;
    const avgBatteryCapacity = this.logs.reduce((sum, log) => sum + log.batteryCapacity, 0) / this.logs.length;
    
  
    const efficiency = totalEnergyConsumed > 0 ? (totalEnergyGenerated / totalEnergyConsumed) * 100 : 0;
    
    return {
      totalTime,
      totalEnergyGenerated,
      totalImpacts,
      maxSoilCompaction,
      avgGeneratorPower,
      avgMotorPower,
      avgBatteryCapacity,
      finalSoilDensity,
      totalEnergyConsumed,
      efficiency
    };
  }
}
