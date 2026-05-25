import {
  BATTERY_REFERENCE_CAPACITY_AH,
  BATTERY_SYSTEM_VOLTAGE,
  GENERATOR_EFFICIENCY as SIM_GENERATOR_EFFICIENCY,
  INITIAL_SOIL_DENSITY as SIM_INITIAL_SOIL_DENSITY,
  MAX_SOIL_DENSITY as SIM_MAX_SOIL_DENSITY,
  calculateBatteryCapacityDelta,
  calculateCompactionIncrease,
  calculateGeneratorPower,
  calculateImpactEnergy,
  calculateLoadPower,
  calculateSoilDensity,
} from './formulas';

export type SimulationState = 'IDLE' | 'CHARGING' | 'DISCHARGING' | 'IMPACT';

export interface SimulationData {
  pendulumHeight: number;
  pendulumMass: number;
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
  
  state: SimulationState;
  time: number;
}

export class SimulationEngine {
  private data: SimulationData;
  private lastUpdateTime: number;
  private pendingImpactVelocityReset: boolean;
  
  private readonly GRAVITY = 9.81;
  private readonly MOTOR_EFFICIENCY = 0.85;
  private readonly MAX_HEIGHT = 15;
  private readonly MIN_HEIGHT = 0;
  private readonly GENERATOR_EFFICIENCY = SIM_GENERATOR_EFFICIENCY;
  private readonly INITIAL_SOIL_DENSITY = SIM_INITIAL_SOIL_DENSITY;
  private readonly MAX_SOIL_DENSITY = SIM_MAX_SOIL_DENSITY;
  
  constructor() {
    this.data = this.getInitialState();
    this.lastUpdateTime = Date.now();
    this.pendingImpactVelocityReset = false;
  }
  
  private getInitialState(): SimulationData {
    return {
      pendulumHeight: 0,
      pendulumMass: 500,
      pendulumVelocity: 0,
      potentialEnergy: 0,
      kineticEnergy: 0,
      totalEnergy: 0,
      solarPower: 0,
      motorPower: 0,
      generatorPower: 0,
      loadPower: 0,
      batteryVoltage: 24,
      batteryCapacity: 50,
      batteryCurrent: 0,
      soilDensity: 1600,
      soilCompaction: 0,
      impactCount: 0,
      state: 'IDLE',
      time: 0
    };
  }
  
  public getData(): SimulationData {
    return { ...this.data };
  }
  
  public setState(newState: SimulationState): void {
    this.data.state = newState;
  }
  
  public update(deltaTime: number): void {
    const dt = deltaTime / 1000;
    this.data.time += dt;

    if (this.pendingImpactVelocityReset) {
      this.data.pendulumVelocity = 0;
      this.pendingImpactVelocityReset = false;
    }
    
    switch (this.data.state) {
      case 'IDLE':
        this.updateIdle(dt);
        break;
      case 'CHARGING':
        this.updateCharging(dt);
        break;
      case 'DISCHARGING':
        this.updateDischarging(dt);
        break;
      case 'IMPACT':
        this.updateImpact(dt);
        break;
    }
    
    this.calculateEnergies();
  }
  
  private updateIdle(dt: number): void {
    this.data.pendulumVelocity = 0;
    this.data.solarPower = 0;
    this.data.motorPower = 0;
    this.data.generatorPower = 0;
    this.data.batteryCurrent = 0;
  }
  
  private updateCharging(dt: number): void {
    const solarInput = 750;
    this.data.solarPower = solarInput;
    
    this.data.motorPower = Math.min(650, solarInput * this.MOTOR_EFFICIENCY);
    
    const liftingForce = this.data.pendulumMass * this.GRAVITY;
    const upwardVelocity = liftingForce > 0 ? (this.data.motorPower * this.MOTOR_EFFICIENCY) / liftingForce : 0;
    
    if (this.data.pendulumHeight < this.MAX_HEIGHT) {
      this.data.pendulumHeight += upwardVelocity * dt;
      this.data.pendulumHeight = Math.min(this.data.pendulumHeight, this.MAX_HEIGHT);
      this.data.pendulumVelocity = upwardVelocity;
    } else {
      this.data.pendulumVelocity = 0;
      this.data.motorPower = 0;
    }
    
    const batteryVoltage = this.data.batteryVoltage > 0 ? this.data.batteryVoltage : BATTERY_SYSTEM_VOLTAGE;
    const chargeRate = (solarInput - this.data.motorPower) / batteryVoltage;
    const nextBatteryCapacity = this.data.batteryCapacity + calculateBatteryCapacityDelta(chargeRate, dt, BATTERY_REFERENCE_CAPACITY_AH);

    if (this.data.batteryCapacity >= 100 || nextBatteryCapacity >= 100) {
      this.data.batteryCapacity = 100;
      this.data.batteryCurrent = 0;
    } else {
      this.data.batteryCurrent = chargeRate;
      this.data.batteryCapacity = Math.min(100, Math.max(0, nextBatteryCapacity));
    }
  }
  
  private updateDischarging(dt: number): void {
    this.data.solarPower = 0;
    this.data.motorPower = 0;
    
    const descentVelocity = 0.5;
    
    if (this.data.pendulumHeight > 0) {
      this.data.pendulumHeight -= descentVelocity * dt;
      this.data.pendulumHeight = Math.max(this.data.pendulumHeight, 0);
      this.data.pendulumVelocity = -descentVelocity;
      
      const powerOutput = calculateGeneratorPower(this.data.pendulumMass, this.GRAVITY, descentVelocity, this.GENERATOR_EFFICIENCY);
      this.data.generatorPower = powerOutput;
      
      this.data.loadPower = calculateLoadPower(powerOutput);
      
      const batteryVoltage = this.data.batteryVoltage > 0 ? this.data.batteryVoltage : BATTERY_SYSTEM_VOLTAGE;
      const dischargeRate = this.data.loadPower / batteryVoltage;
      this.data.batteryCurrent = dischargeRate;
      const dischargePercentage = calculateBatteryCapacityDelta(dischargeRate, dt, BATTERY_REFERENCE_CAPACITY_AH);
      this.data.batteryCapacity = Math.min(100, Math.max(0, this.data.batteryCapacity + dischargePercentage));
    } else {
      this.data.pendulumVelocity = 0;
      this.data.generatorPower = 0;
      this.data.loadPower = 0;
      this.data.batteryCurrent = 0;
    }
  }
  
  private updateImpact(dt: number): void {
    this.data.solarPower = 0;
    this.data.motorPower = 0;
    this.data.generatorPower = 0;
    
    if (this.data.pendulumHeight > 0) {
      this.data.pendulumVelocity -= this.GRAVITY * dt;
      this.data.pendulumHeight += this.data.pendulumVelocity * dt;
      
      if (this.data.pendulumHeight <= 0) {
        this.data.pendulumHeight = 0;
        this.data.impactCount++;
        
        const impactEnergy = calculateImpactEnergy(this.data.pendulumMass, this.data.pendulumVelocity);
        
        const currentDensity = this.data.soilDensity;
        const densityRange = this.MAX_SOIL_DENSITY - this.INITIAL_SOIL_DENSITY;
        const densityRatio = densityRange > 0 ? (currentDensity - this.INITIAL_SOIL_DENSITY) / densityRange : 0;
        const compactionResistance = Math.max(0, 1 - densityRatio);
        
        const energyAbsorbed = Math.max(0, calculateCompactionIncrease(impactEnergy) * compactionResistance);
        const compactionIncrease = Math.min(energyAbsorbed, Math.max(0, 100 - this.data.soilCompaction));
        
        this.data.soilCompaction = Math.min(100, Math.max(0, this.data.soilCompaction + compactionIncrease));
        
        this.data.soilDensity = calculateSoilDensity(this.data.soilCompaction);
        this.pendingImpactVelocityReset = true;
      }
    }
  }
  
  private calculateEnergies(): void {
    const mass = Math.max(0, this.data.pendulumMass);
    const height = Math.max(0, this.data.pendulumHeight);
    const velocity = this.data.pendulumVelocity;
    
    this.data.potentialEnergy = mass * this.GRAVITY * height;
    
    this.data.kineticEnergy = 0.5 * mass * Math.pow(velocity, 2);
    
    this.data.totalEnergy = this.data.potentialEnergy + this.data.kineticEnergy;
  }
  
  public reset(): void {
    this.data = this.getInitialState();
    this.lastUpdateTime = Date.now();
    this.pendingImpactVelocityReset = false;
  }
}
