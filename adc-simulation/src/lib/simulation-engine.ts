import {
  BATTERY_REFERENCE_CAPACITY_AH,
  BATTERY_SYSTEM_VOLTAGE,
  GENERATOR_EFFICIENCY as SIM_GENERATOR_EFFICIENCY,
  INITIAL_SOIL_DENSITY as SIM_INITIAL_SOIL_DENSITY,
  MAX_SOIL_DENSITY as SIM_MAX_SOIL_DENSITY,
  SoilType,
  SOIL_DATABASE,
  calculateBatteryCapacityDelta,
  calculateCompactionIncrease,
  calculateGeneratorPower,
  calculateImpactEnergy,
  calculateLoadPower,
  calculateSoilDensity,
  calculateDragForce,
  calculateSoilStiffness,
  calculateImpactMechanics,
  calculateGeneratorEMF,
  calculateGeneratorCurrent,
  calculateGeneratorBrakingForce,
  calculateBatteryTerminalVoltage,
  calculateBatteryTemperatureDelta,
  calculateCylinderVolume,
  calculateCylinderRadius,
  calculateCylinderBottomArea,
} from './formulas';

export type SimulationState = 'IDLE' | 'CHARGING' | 'DISCHARGING' | 'IMPACT';

export interface SimulationData {
  tamperHeight: number;
  tamperMass: number;
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
  
  state: SimulationState;
  time: number;


  soilType: SoilType;
  dragCoefficient: number;
  gearRatio: number;
  loadResistance: number;


  dragForce: number;
  terminalVelocity: number;
  impactForce: number;
  craterDepth: number;
  batteryTemp: number;
  voltageTerminal: number;
  generatorEMF: number;
  stiffness: number;
  contactPressure: number;
}

export interface SimulationParameters {
  tamperMass?: number;
  maxHeight?: number;
  gravity?: number;
  motorPower?: number;
  solarPower?: number;
  batteryVoltage?: number;
  batteryCapacity?: number;
  motorEfficiency?: number;
  generatorEfficiency?: number;
  initialSoilDensity?: number;
  
  soilType?: SoilType;
  dragCoefficient?: number;
  gearRatio?: number;
  loadResistance?: number;
}

export class SimulationEngine {
  private data: SimulationData;
  private lastUpdateTime: number;
  private chargingMotorRampPower: number;
  private readyForGenerator: boolean;
  private topStabilityTimer: number;
  
  private GRAVITY = 9.81;
  private MOTOR_EFFICIENCY = 0.85;
  private MAX_HEIGHT = 15;
  private readonly MIN_HEIGHT = 0;
  private readonly MOTOR_RAMP_RATE = 180;
  private readonly TOP_BAND_RATIO = 0.995;
  private readonly TOP_STABILITY_SECONDS = 0.35;
  private GENERATOR_EFFICIENCY = SIM_GENERATOR_EFFICIENCY;
  private INITIAL_SOIL_DENSITY = SIM_INITIAL_SOIL_DENSITY;
  private MAX_SOIL_DENSITY = SIM_MAX_SOIL_DENSITY;
  private SOLAR_INPUT_W = 750;
  private MOTOR_POWER_LIMIT_W = 650;
  private IMPACT_TRIGGER_HEIGHT = 0.5;
  
  constructor() {
    this.data = this.getInitialState();
    this.lastUpdateTime = Date.now();
    this.chargingMotorRampPower = 0;
    this.readyForGenerator = false;
    this.topStabilityTimer = 0;
  }
  
  private getInitialState(): SimulationData {
    return {
      tamperHeight: 0,
      tamperMass: 5,
      tamperVelocity: 0,
      potentialEnergy: 0,
      kineticEnergy: 0,
      totalEnergy: 0,
      solarPower: 0,
      motorPower: 0,
      generatorPower: 0,
      loadPower: 0,
      batteryVoltage: BATTERY_SYSTEM_VOLTAGE,
      batteryCapacity: 50,
      batteryCurrent: 0,
      soilDensity: 1600,
      soilCompaction: 0,
      impactCount: 0,
      state: 'IDLE',
      time: 0,
      

      soilType: 'sand',
      dragCoefficient: 0.82,
      gearRatio: 250.0,
      loadResistance: 2.0,
      
      dragForce: 0,
      terminalVelocity: 0,
      impactForce: 0,
      craterDepth: 0,
      batteryTemp: 25.0,
      voltageTerminal: BATTERY_SYSTEM_VOLTAGE,
      generatorEMF: 0,
      stiffness: 2.0e6,
      contactPressure: 0
    };
  }
  
  public getData(): SimulationData {
    return { ...this.data };
  }
  
  public setState(newState: SimulationState): void {
    this.data.state = newState;

    if (newState !== 'CHARGING') {
      this.chargingMotorRampPower = 0;
      this.topStabilityTimer = 0;
    }

    if (newState === 'IDLE' && this.data.tamperHeight <= this.MIN_HEIGHT) {
      this.readyForGenerator = false;
      this.topStabilityTimer = 0;
    }
  }
  
  public update(deltaTime: number): void {
    const totalDt = deltaTime / 1000;
    this.data.time += totalDt;
    
   
    const subSteps = 10;
    const subDt = totalDt / subSteps;
    
    for (let i = 0; i < subSteps; i++) {
      switch (this.data.state) {
        case 'IDLE':
          this.updateIdle(subDt);
          break;
        case 'CHARGING':
          this.updateCharging(subDt);
          break;
        case 'DISCHARGING':
          this.updateDischarging(subDt);
          break;
        case 'IMPACT':
          this.updateImpact(subDt);
          break;
      }
    }
    
    this.calculateEnergies();
  }

  public applyConfiguration(parameters: SimulationParameters): void {
    this.data.tamperMass = parameters.tamperMass ?? this.data.tamperMass;
    this.MAX_HEIGHT = Math.max(1, parameters.maxHeight ?? this.MAX_HEIGHT);
    this.GRAVITY = Math.max(1, parameters.gravity ?? this.GRAVITY);
    this.MOTOR_POWER_LIMIT_W = Math.max(0, parameters.motorPower ?? this.MOTOR_POWER_LIMIT_W);
    this.SOLAR_INPUT_W = Math.max(0, parameters.solarPower ?? this.SOLAR_INPUT_W);
    

    this.data.soilType = parameters.soilType ?? this.data.soilType;
    this.data.dragCoefficient = parameters.dragCoefficient ?? this.data.dragCoefficient;
    this.data.gearRatio = parameters.gearRatio ?? this.data.gearRatio;
    this.data.loadResistance = parameters.loadResistance ?? this.data.loadResistance;

    const props = SOIL_DATABASE[this.data.soilType] || SOIL_DATABASE.sand;
    this.INITIAL_SOIL_DENSITY = parameters.initialSoilDensity ?? props.initialDensity;
    this.MAX_SOIL_DENSITY = props.maxDensity;

    this.data.batteryVoltage = Math.max(1, parameters.batteryVoltage ?? this.data.batteryVoltage);
    this.data.batteryCapacity = Math.max(0, Math.min(100, parameters.batteryCapacity ?? this.data.batteryCapacity));
    this.MOTOR_EFFICIENCY = Math.max(0.1, Math.min(1, parameters.motorEfficiency ?? this.MOTOR_EFFICIENCY));
    this.GENERATOR_EFFICIENCY = Math.max(0.1, Math.min(1, parameters.generatorEfficiency ?? this.GENERATOR_EFFICIENCY));

    this.data.tamperHeight = Math.max(this.MIN_HEIGHT, Math.min(this.data.tamperHeight, this.MAX_HEIGHT));
    this.data.soilDensity = calculateSoilDensity(this.data.soilCompaction, this.INITIAL_SOIL_DENSITY, this.MAX_SOIL_DENSITY);
    this.calculateEnergies();
  }
  
  private updateIdle(dt: number): void {
    this.data.tamperVelocity = 0;
    this.data.solarPower = 0;
    this.data.motorPower = 0;
    this.data.generatorPower = 0;
    this.data.loadPower = 0;
    this.data.batteryCurrent = 0;
    this.data.dragForce = 0;
    this.data.generatorEMF = 0;

    const batteryVoltage = this.data.batteryVoltage > 0 ? this.data.batteryVoltage : BATTERY_SYSTEM_VOLTAGE;
    this.data.voltageTerminal = calculateBatteryTerminalVoltage(this.data.batteryCapacity, 0, batteryVoltage);
    
    const tempDelta = calculateBatteryTemperatureDelta(0, batteryVoltage, this.data.batteryTemp, dt);
    this.data.batteryTemp = Math.max(25.0, this.data.batteryTemp + tempDelta);

    if (this.data.tamperHeight <= this.MIN_HEIGHT) {
      this.readyForGenerator = false;
    }
  }
  
  private updateCharging(dt: number): void {
    const solarInput = this.SOLAR_INPUT_W;
    this.data.solarPower = solarInput;

    const maxMotorPower = Math.min(this.MOTOR_POWER_LIMIT_W, solarInput * this.MOTOR_EFFICIENCY);
    this.chargingMotorRampPower = Math.min(maxMotorPower, this.chargingMotorRampPower + this.MOTOR_RAMP_RATE * dt);
    this.data.motorPower = this.chargingMotorRampPower;
    
    const liftingForce = this.data.tamperMass * this.GRAVITY;
    
    const maxLiftSpeed = 1.5;
    const upwardVelocity = liftingForce > 0 ? Math.min(maxLiftSpeed, (this.data.motorPower * this.MOTOR_EFFICIENCY) / liftingForce) : 0;
    
    const topThreshold = this.MAX_HEIGHT * this.TOP_BAND_RATIO;

    if (this.data.tamperHeight < this.MAX_HEIGHT) {
      this.data.tamperHeight += upwardVelocity * dt;
      this.data.tamperHeight = Math.min(this.data.tamperHeight, this.MAX_HEIGHT);
      this.data.tamperVelocity = upwardVelocity;
      this.topStabilityTimer = this.data.tamperHeight >= topThreshold ? this.topStabilityTimer + dt : 0;
    }

    if (this.topStabilityTimer >= this.TOP_STABILITY_SECONDS || this.data.tamperHeight >= this.MAX_HEIGHT) {
      this.data.tamperVelocity = 0;
      this.data.tamperHeight = this.MAX_HEIGHT;
      this.data.motorPower = 0;
      this.chargingMotorRampPower = 0;
      this.readyForGenerator = true;
      this.topStabilityTimer = 0;
      this.setState('DISCHARGING');
    }
    
    const batteryVoltage = this.data.batteryVoltage > 0 ? this.data.batteryVoltage : BATTERY_SYSTEM_VOLTAGE;
    const motorCurrent = this.data.motorPower / batteryVoltage;
    const solarCurrent = solarInput / batteryVoltage;
    
    const chargeRate = solarCurrent - motorCurrent;
    this.data.batteryCurrent = chargeRate;
    
    const chargePercentage = calculateBatteryCapacityDelta(chargeRate, dt, BATTERY_REFERENCE_CAPACITY_AH);
    this.data.batteryCapacity = Math.min(100, Math.max(0, this.data.batteryCapacity + chargePercentage));

    this.data.voltageTerminal = calculateBatteryTerminalVoltage(this.data.batteryCapacity, chargeRate, batteryVoltage);
    const tempDelta = calculateBatteryTemperatureDelta(chargeRate, batteryVoltage, this.data.batteryTemp, dt);
    this.data.batteryTemp = Math.max(25.0, this.data.batteryTemp + tempDelta);

    this.data.dragForce = 0;
    this.data.generatorEMF = 0;
  }
  
  private updateDischarging(dt: number): void {
    this.data.solarPower = 0;
    this.data.motorPower = 0;

    if (!this.readyForGenerator) {
      this.setState('CHARGING');
      return;
    }
    
    const vol = calculateCylinderVolume(this.data.tamperMass);
    const radius = calculateCylinderRadius(vol);
    const area = calculateCylinderBottomArea(radius);
    
    const v = this.data.tamperVelocity; 
    const F_gravity = this.data.tamperMass * this.GRAVITY;
    
    const F_drag = calculateDragForce(v, area, this.data.dragCoefficient);
    this.data.dragForce = Math.abs(F_drag);
    
    const emf = calculateGeneratorEMF(v, this.data.gearRatio);
    this.data.generatorEMF = emf;
    
    const batteryVoltage = this.data.batteryVoltage > 0 ? this.data.batteryVoltage : BATTERY_SYSTEM_VOLTAGE;
    const current = calculateGeneratorCurrent(emf, batteryVoltage, this.data.loadResistance);
    this.data.batteryCurrent = current; 
    
    const F_brake = Math.abs(calculateGeneratorBrakingForce(current, this.data.gearRatio, v));
    
    const F_friction = Math.max(1, (40 + 15 * Math.abs(v)) * (this.data.tamperMass / 500));
    
    const F_net_upward = -F_gravity + F_brake + Math.abs(F_drag) + F_friction;
    const acceleration = F_net_upward / this.data.tamperMass;
    
    let nextVelocity = v + acceleration * dt;
    if (nextVelocity > 0) nextVelocity = 0;
    
    this.data.tamperVelocity = nextVelocity;
    
    if (this.data.tamperHeight > 0) {
      this.data.tamperHeight += this.data.tamperVelocity * dt;
      this.data.tamperHeight = Math.max(this.data.tamperHeight, 0);
      
      const dragTerm = 0.5 * 1.225 * this.data.dragCoefficient * area;
      this.data.terminalVelocity = dragTerm > 0 ? Math.sqrt(F_gravity / dragTerm) : 0;
      
      const powerOutput = F_brake * Math.abs(this.data.tamperVelocity);
      this.data.generatorPower = powerOutput * this.GENERATOR_EFFICIENCY;
      this.data.loadPower = Math.pow(current, 2) * this.data.loadResistance;
      
      const chargePercentage = calculateBatteryCapacityDelta(current, dt, BATTERY_REFERENCE_CAPACITY_AH);
      this.data.batteryCapacity = Math.min(100, Math.max(0, this.data.batteryCapacity + chargePercentage));
      
      this.data.voltageTerminal = calculateBatteryTerminalVoltage(this.data.batteryCapacity, current, batteryVoltage);
      const tempDelta = calculateBatteryTemperatureDelta(current, batteryVoltage, this.data.batteryTemp, dt);
      this.data.batteryTemp = Math.max(25.0, this.data.batteryTemp + tempDelta);

      if (this.data.tamperHeight <= this.IMPACT_TRIGGER_HEIGHT) {
        this.setState('IMPACT');
      }
    } else {
      this.data.tamperVelocity = 0;
      this.data.generatorPower = 0;
      this.data.loadPower = 0;
      this.data.batteryCurrent = 0;
      this.data.dragForce = 0;
      this.data.generatorEMF = 0;
      
      const tempDelta = calculateBatteryTemperatureDelta(0, batteryVoltage, this.data.batteryTemp, dt);
      this.data.batteryTemp = Math.max(25.0, this.data.batteryTemp + tempDelta);
      this.data.voltageTerminal = calculateBatteryTerminalVoltage(this.data.batteryCapacity, 0, batteryVoltage);

      this.readyForGenerator = false;
      this.setState('IDLE');
    }
  }
  
  private updateImpact(dt: number): void {
    this.data.solarPower = 0;
    this.data.motorPower = 0;
    this.data.generatorPower = 0;
    this.data.loadPower = 0;
    this.data.batteryCurrent = 0;
    this.data.generatorEMF = 0;
    
    const batteryVoltage = this.data.batteryVoltage > 0 ? this.data.batteryVoltage : BATTERY_SYSTEM_VOLTAGE;
    const tempDelta = calculateBatteryTemperatureDelta(0, batteryVoltage, this.data.batteryTemp, dt);
    this.data.batteryTemp = Math.max(25.0, this.data.batteryTemp + tempDelta);
    this.data.voltageTerminal = calculateBatteryTerminalVoltage(this.data.batteryCapacity, 0, batteryVoltage);

    const vol = calculateCylinderVolume(this.data.tamperMass);
    const radius = calculateCylinderRadius(vol);
    const area = calculateCylinderBottomArea(radius);

    if (this.data.tamperHeight > 0) {
      const v = this.data.tamperVelocity;
      const F_gravity = this.data.tamperMass * this.GRAVITY;
      const F_drag = calculateDragForce(v, area, this.data.dragCoefficient);
      this.data.dragForce = Math.abs(F_drag);

      const F_net_upward = -F_gravity + Math.abs(F_drag);
      const acceleration = F_net_upward / this.data.tamperMass;

      this.data.tamperVelocity += acceleration * dt;
      this.data.tamperHeight += this.data.tamperVelocity * dt;
      
      const dragTerm = 0.5 * 1.225 * this.data.dragCoefficient * area;
      this.data.terminalVelocity = dragTerm > 0 ? Math.sqrt(F_gravity / dragTerm) : 0;

      if (this.data.tamperHeight <= 0) {
        this.data.tamperHeight = 0;
        this.data.impactCount++;
        
        const kineticEnergy = 0.5 * this.data.tamperMass * Math.pow(this.data.tamperVelocity, 2);
        this.data.kineticEnergy = kineticEnergy;
        
        const props = SOIL_DATABASE[this.data.soilType] || SOIL_DATABASE.sand;
        const stiffness = calculateSoilStiffness(this.data.soilCompaction, this.data.soilType);
        this.data.stiffness = stiffness;

        const mechanics = calculateImpactMechanics(
          kineticEnergy,
          stiffness,
          area,
          props.ultimateBearingCapacity
        );

        this.data.impactForce = mechanics.peakForceN;
        this.data.craterDepth = mechanics.craterDepthM;
        this.data.contactPressure = mechanics.contactPressurePa;

        if (mechanics.plasticDeformation) {
          const pressureRatio = mechanics.contactPressurePa / props.ultimateBearingCapacity;
          const compactionResistance = Math.max(0.01, 1 - this.data.soilCompaction / 100);
          
          const compactionIncrease = Math.min(
            15,
            (pressureRatio - 1.0) * 1.5 * compactionResistance + 0.5
          );

          if (compactionIncrease > 0) {
            this.data.soilCompaction = Math.min(100, this.data.soilCompaction + compactionIncrease);
          }
        }

        this.data.soilDensity = calculateSoilDensity(
          this.data.soilCompaction,
          this.INITIAL_SOIL_DENSITY,
          this.MAX_SOIL_DENSITY
        );
        
        this.data.tamperVelocity = 0;
        this.data.dragForce = 0;
        this.readyForGenerator = false;
        this.setState('IDLE');
      }
    }
  }
  
  private calculateEnergies(): void {
    const mass = Math.max(0, this.data.tamperMass);
    const height = Math.max(0, this.data.tamperHeight);
    const velocity = this.data.tamperVelocity;
    
    this.data.potentialEnergy = mass * this.GRAVITY * height;
    this.data.kineticEnergy = 0.5 * mass * Math.pow(velocity, 2);
    this.data.totalEnergy = this.data.potentialEnergy + this.data.kineticEnergy;
  }
  
  public reset(): void {
    this.data = this.getInitialState();
    this.lastUpdateTime = Date.now();
    this.chargingMotorRampPower = 0;
    this.readyForGenerator = false;
    this.topStabilityTimer = 0;
  }
}
