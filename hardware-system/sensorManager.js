const config = require('./config');

class SensorManager {
  constructor() {
    this.sensors = new Map();
    this.sensorData = {};
    this.initialized = false;
    
    this.GRAVITY = 9.81;
    this.MOTOR_EFFICIENCY = 0.85;
    this.GENERATOR_EFFICIENCY = 0.90;
    this.MAX_HEIGHT = 15;
    this.MIN_HEIGHT = 0;
    this.INITIAL_SOIL_DENSITY = 1600;
    this.MAX_SOIL_DENSITY = 2000;
    this.SOIL_COMPRESSION_COEFFICIENT = 0.0002;
    this.MENARD_CONSTANT = 0.5;
    
    this.state = 'IDLE';
    this.stateTimer = 0;
    this.workflowPhase = 'MISSION_PLANNING';
    this.workflowTask = 'SYSTEM_BOOT';
    this.workflowPlan = [];
    this.workflowProgress = 0;
    this.workflowScore = 0;
    this.workflowReason = 'System boot';
    this.lastWorkflowLog = 0;
    this.pendulumHeight = 0;
    this.pendulumVelocity = 0;
    this.pendulumMass = 500;
    this.batteryCapacity = 50;
    this.batteryVoltage = 24;
    this.soilDensity = 1600;
    this.soilCompaction = 0;
    this.impactCount = 0;
    this.time = 0;
    this.hasLoggedLowBattery = false;
    this.generatorPower = 0;
    this.loadPower = 0;
    this.batteryCurrent = 0;
    this.latestData = null;
  }

  async initialize() {
    console.log('Initializing sensors...');
    
    for (const [sensorName, sensorConfig] of Object.entries(config.sensors)) {
      if (sensorConfig.enabled) {
        this.sensors.set(sensorName, {
          ...sensorConfig,
          lastValue: 0,
          lastReadTime: 0
        });
        console.log(`  ✓ ${sensorName} sensor configured`);
      }
    }
    
    this.initialized = true;
    
    if (config.serial.enabled) {
      await this.initializeSerial();
    }
    
    if (config.simulation.enabled) {
      console.log('  ✓ Simulation mode enabled');
    }

    this.reset();
  }

  reset() {
    const simulation = config.simulation || {};

    this.state = 'IDLE';
    this.stateTimer = 0;
    this.workflowPhase = 'MISSION_PLANNING';
    this.workflowTask = 'SYSTEM_BOOT';
    this.workflowPlan = [];
    this.workflowProgress = 0;
    this.workflowScore = 0;
    this.workflowReason = 'System reset';
    this.lastWorkflowLog = 0;
    this.pendulumHeight = 0;
    this.pendulumVelocity = 0;
    this.pendulumMass = simulation.pendulumMass ?? 500;
    this.batteryCapacity = simulation.batteryCapacity ?? 50;
    this.batteryVoltage = simulation.batteryVoltage ?? 24;
    this.soilDensity = simulation.initialSoilDensity ?? 1600;
    this.soilCompaction = 0;
    this.impactCount = 0;
    this.time = 0;
    this.hasLoggedLowBattery = false;
    this.generatorPower = 0;
    this.loadPower = 0;
    this.batteryCurrent = 0;
    this.sensorData = {};
    this.latestData = this.buildSnapshot();
  }

  buildSnapshot(energies = this.calculateEnergies()) {
    return {
      pendulumHeight: this.pendulumHeight,
      pendulumVelocity: this.pendulumVelocity,
      pendulumMass: this.pendulumMass,
      potentialEnergy: energies.potentialEnergy,
      kineticEnergy: energies.kineticEnergy,
      totalEnergy: energies.totalEnergy,
      solarPower: 0,
      motorPower: 0,
      generatorPower: this.generatorPower,
      loadPower: this.loadPower,
      batteryVoltage: this.batteryVoltage,
      batteryCapacity: this.batteryCapacity,
      batteryCurrent: this.batteryCurrent,
      soilDensity: this.soilDensity,
      soilCompaction: this.soilCompaction,
      impactCount: this.impactCount,
      state: this.state,
      workflowPhase: this.workflowPhase,
      workflowTask: this.workflowTask,
      workflowPlan: this.workflowPlan,
      workflowProgress: this.workflowProgress,
      workflowScore: this.workflowScore,
      workflowReason: this.workflowReason,
      time: this.time,
      timestamp: Date.now()
    };
  }

  getLatestSnapshot() {
    return this.latestData || this.buildSnapshot();
  }

  async initializeSerial() {
    try {
      console.log(`  Connecting to serial port ${config.serial.port}...`);
      console.log('  Serial connection simulated (install serialport for real hardware)');
    } catch (error) {
      console.error('  ✗ Serial initialization failed:', error.message);
    }
  }

  async readAllSensors() {
    const sensorData = {};
    
    for (const [sensorName, sensor] of this.sensors) {
      try {
        let rawValue;
        
        if (config.serial.enabled) {
          rawValue = await this.readSerialSensor(sensor);
        } else if (config.simulation.enabled) {
          rawValue = this.simulateSensorValue(sensorName);
        } else {
          rawValue = await this.readDigitalSensor(sensor);
        }
        
        const calibratedValue = this.calibrateValue(rawValue, sensor);
        
        sensorData[sensor.id] = {
          rawValue,
          calibratedValue,
          unit: sensor.unit,
          timestamp: Date.now()
        };
        
        sensor.lastValue = calibratedValue;
        sensor.lastReadTime = Date.now();
        
      } catch (error) {
        console.error(`Error reading ${sensorName}:`, error.message);
        sensorData[sensor.id] = {
          rawValue: 0,
          calibratedValue: 0,
          unit: sensor.unit,
          timestamp: Date.now()
        };
      }
    }
    
    this.sensorData = sensorData;
    return sensorData;
  }

  async readSerialSensor(sensor) {
    console.log(`Reading serial sensor ${sensor.id} from pin ${sensor.pin}`);
    return Math.random() * (sensor.maxRaw - sensor.minRaw) + sensor.minRaw;
  }

  simulateSensorValue(sensorName) {
    switch (sensorName) {
      case 'height':
        return this.pendulumHeight / this.MAX_HEIGHT * 4095;
      case 'velocity':
        return (this.pendulumVelocity + 30) / 60 * 4095;
      case 'current':
        return Math.abs(this.batteryCurrent) / 100 * 4095;
      case 'voltage':
        return this.batteryVoltage / 60 * 4095;
      case 'force':
        return this.impactCount > 0 ? 4095 : 0;
      case 'soilDensity':
        return (this.soilDensity - 1300) / 800 * 4095;
      default:
        return 2048;
    }
  }

  async readDigitalSensor(sensor) {
    console.log(`Reading digital sensor ${sensor.id} from pin ${sensor.pin}`);
    return Math.random() * (sensor.maxRaw - sensor.minRaw) + sensor.minRaw;
  }

  calibrateValue(rawValue, sensor) {
    const normalized = (rawValue - sensor.minRaw) / (sensor.maxRaw - sensor.minRaw);
    const calibrated = sensor.minCalibrated + normalized * (sensor.maxCalibrated - sensor.minCalibrated);
    return Math.max(sensor.minCalibrated, Math.min(sensor.maxCalibrated, calibrated));
  }

  updatePhysics(dt) {
    this.time += dt;
    this.stateTimer += dt;
    const conditions = this.evaluateSystemConditions();
    this.updateWorkflow(conditions);
    
    const predictedState = this.predictNextState();
    if (predictedState !== this.state && this.stateTimer > 1 && this.time - this.lastWorkflowLog > 1) {
      console.log(`Predicted state change: ${this.state} -> ${predictedState}`);
      this.lastWorkflowLog = this.time;
    }
    
    switch (this.state) {
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

  updateIdle(dt) {
    this.pendulumVelocity = 0;
    
    const batteryLevel = this.batteryCapacity;
    const soilCompaction = this.soilCompaction;
    
    if (this.stateTimer > 2 && batteryLevel > 20) {
      if (soilCompaction < 80) {
        this.changeState('CHARGING');
      } else {
        console.log('Soil compaction sufficient, skipping charging cycle');
        this.stateTimer = 0;
      }
    } else if (batteryLevel <= 20) {
      if (!this.hasLoggedLowBattery) {
        console.log('Battery too low for charging');
        this.hasLoggedLowBattery = true;
      }
    } else {
      this.hasLoggedLowBattery = false;
    }
  }

  updateCharging(dt) {
    const solarInput = 750;
    
    const motorPower = Math.min(650, solarInput * this.MOTOR_EFFICIENCY);
    
    const liftingForce = this.pendulumMass * this.GRAVITY;
    const upwardVelocity = liftingForce > 0 ? motorPower / liftingForce : 0;
    
    if (this.pendulumHeight < this.MAX_HEIGHT) {
      this.pendulumHeight += upwardVelocity * dt;
      this.pendulumHeight = Math.min(this.pendulumHeight, this.MAX_HEIGHT);
      this.pendulumVelocity = upwardVelocity;
      
      const batteryVoltage = this.batteryVoltage > 0 ? this.batteryVoltage : 1;
      const chargeRate = (solarInput - motorPower) / batteryVoltage;
      const batteryCapacityAh = 50;
      const chargePercentage = (chargeRate * dt) / batteryCapacityAh * 100;
      this.batteryCapacity = Math.min(100, Math.max(0, this.batteryCapacity + chargePercentage));
      
      if (this.batteryCapacity >= 100) {
        console.log('Battery fully charged, proceeding to discharge');
        this.changeState('DISCHARGING');
      }
    } else {
      this.pendulumVelocity = 0;
      this.changeState('DISCHARGING');
    }
  }

  updateDischarging(dt) {
    const descentVelocity = 0.5;
    
    if (this.pendulumHeight > 0) {
      this.pendulumHeight -= descentVelocity * dt;
      this.pendulumHeight = Math.max(this.pendulumHeight, 0);
      this.pendulumVelocity = -descentVelocity;
      
      const powerOutput = (this.pendulumMass * this.GRAVITY * descentVelocity) * this.GENERATOR_EFFICIENCY;
      this.generatorPower = powerOutput;
      
      this.loadPower = powerOutput * 0.8;
      
      const batteryVoltage = this.batteryVoltage > 0 ? this.batteryVoltage : 1;
      const batteryCapacityAh = 50;
      const dischargeRate = this.loadPower / batteryVoltage;
      this.batteryCurrent = -dischargeRate;
      const dischargePercentage = (dischargeRate * dt) / batteryCapacityAh * 100;
      this.batteryCapacity = Math.max(0, this.batteryCapacity - dischargePercentage);
      
      if (this.pendulumHeight <= 0.5) {
        console.log('Approaching ground, preparing for impact');
        this.changeState('IMPACT');
      }
    } else {
      this.pendulumVelocity = 0;
      this.generatorPower = 0;
      this.loadPower = 0;
      this.batteryCurrent = 0;
      this.changeState('IMPACT');
    }
  }

  updateImpact(dt) {
    if (this.pendulumHeight > 0) {
      this.pendulumVelocity -= this.GRAVITY * dt;
      this.pendulumHeight += this.pendulumVelocity * dt;
      
      if (this.pendulumHeight <= 0) {
        this.pendulumHeight = 0;
        this.impactCount++;
        
        const impactEnergy = 0.5 * this.pendulumMass * Math.pow(this.pendulumVelocity, 2);
        
        const massInTons = this.pendulumMass / 1000;
        const treatmentDepth = this.MENARD_CONSTANT * Math.sqrt(massInTons * this.MAX_HEIGHT);
        
        const currentDensity = this.soilDensity;
        const densityRange = this.MAX_SOIL_DENSITY - this.INITIAL_SOIL_DENSITY;
        const densityRatio = densityRange > 0 ? (currentDensity - this.INITIAL_SOIL_DENSITY) / densityRange : 0;
        const compactionResistance = Math.max(0, 1 - densityRatio);
        
        const energyAbsorbed = Math.max(0, impactEnergy * this.SOIL_COMPRESSION_COEFFICIENT * compactionResistance);
        const compactionIncrease = Math.min(energyAbsorbed, Math.max(0, 100 - this.soilCompaction));
        
        this.soilCompaction = Math.min(100, Math.max(0, this.soilCompaction + compactionIncrease));
        
        this.soilDensity = this.INITIAL_SOIL_DENSITY + 
          (this.soilCompaction / 100) * (this.MAX_SOIL_DENSITY - this.INITIAL_SOIL_DENSITY);
        
        this.pendulumVelocity = 0;
        
        console.log(`Impact #${this.impactCount}: Energy=${impactEnergy.toFixed(0)}J, Compaction=${this.soilCompaction.toFixed(1)}%`);
        
        if (this.soilCompaction >= 95) {
          console.log('Target compaction achieved, stopping cycle');
          this.changeState('IDLE');
        } else if (this.batteryCapacity < 30) {
          console.log('Battery low, recharging before next cycle');
          this.changeState('IDLE');
        } else {
          this.changeState('IDLE');
        }
      }
    }
  }

  evaluateSystemConditions() {
    const conditions = {
      batteryLevel: this.batteryCapacity,
      soilCompaction: this.soilCompaction,
      impactCount: this.impactCount,
      totalEnergy: this.calculateEnergies().totalEnergy,
      height: this.pendulumHeight,
      velocity: this.pendulumVelocity,
      readinessScore: this.calculateReadinessScore(),
      maintenanceRequired: this.batteryCapacity < 15 || this.soilCompaction >= 98,
      targetCompaction: this.soilCompaction >= 95,
      cycleComplete: this.soilCompaction >= 95 || this.impactCount >= 20
    };
    
    return conditions;
  }

  calculateReadinessScore() {
    const batteryScore = Math.max(0, Math.min(100, this.batteryCapacity));
    const liftScore = Math.max(0, Math.min(100, (this.pendulumHeight / this.MAX_HEIGHT) * 100));
    const compactionPenalty = Math.max(0, 100 - this.soilCompaction);
    const motionPenalty = Math.abs(this.pendulumVelocity) > 0.1 ? 15 : 0;

    return Math.max(0, Math.min(100,
      batteryScore * 0.35 +
      compactionPenalty * 0.25 +
      (100 - liftScore) * 0.25 +
      (this.impactCount < 20 ? 15 : 0) -
      motionPenalty
    ));
  }

  buildWorkflowPlan(conditions) {
    const plan = [];

    if (conditions.maintenanceRequired) {
      plan.push('Power recovery', 'Sensor self-check', 'Hold cycle');
      return plan;
    }

    if (conditions.cycleComplete) {
      plan.push('Quality review', 'Export results', 'Standby');
      return plan;
    }

    if (conditions.batteryLevel < 35) {
      plan.push('Boost battery', 'Delay lift', 'Verify readiness');
    } else if (conditions.soilCompaction < 60) {
      plan.push('Primary lift', 'Controlled release', 'Measure impact');
    } else {
      plan.push('Fine compaction', 'Short lift', 'Gentle release', 'Verify density');
    }

    if (conditions.height === 0) {
      plan.unshift('Preflight diagnostics');
    }

    return plan;
  }

  updateWorkflow(conditions) {
    const previousPhase = this.workflowPhase;

    if (conditions.maintenanceRequired) {
      this.workflowPhase = 'MAINTENANCE';
      this.workflowTask = 'POWER_RECOVERY';
      this.workflowReason = 'Battery low or target density reached';
      this.workflowPlan = ['Power recovery', 'Sensor self-check', 'Hold cycle'];
    } else if (conditions.cycleComplete) {
      this.workflowPhase = 'MISSION_COMPLETE';
      this.workflowTask = 'REPORT_RESULTS';
      this.workflowReason = 'Target compaction achieved';
      this.workflowPlan = ['Quality review', 'Export results', 'Standby'];
    } else if (this.state === 'CHARGING') {
      this.workflowPhase = this.pendulumHeight < this.MAX_HEIGHT * 0.7 ? 'LIFTING' : 'RELEASE_PREP';
      this.workflowTask = this.pendulumHeight < this.MAX_HEIGHT * 0.7 ? 'RAMP_UP' : 'STABILIZE_AT_TOP';
      this.workflowReason = 'Building potential energy';
      this.workflowPlan = this.buildWorkflowPlan(conditions);
    } else if (this.state === 'DISCHARGING') {
      this.workflowPhase = 'ENERGY_DELIVERY';
      this.workflowTask = 'GENERATOR_FEED';
      this.workflowReason = 'Delivering controlled output';
      this.workflowPlan = this.buildWorkflowPlan(conditions);
    } else if (this.state === 'IMPACT') {
      this.workflowPhase = 'IMPACT_RECOVERY';
      this.workflowTask = 'COMPACTION_ANALYSIS';
      this.workflowReason = 'Compaction pulse in progress';
      this.workflowPlan = ['Capture impact', 'Analyze density', 'Reset lift'];
    } else {
      this.workflowPhase = conditions.readinessScore > 65 ? 'MISSION_PLANNING' : 'DIAGNOSTICS';
      this.workflowTask = conditions.readinessScore > 65 ? 'SCHEDULE_NEXT_CYCLE' : 'STABILIZE_SYSTEM';
      this.workflowReason = conditions.readinessScore > 65 ? 'System ready for next cycle' : 'Waiting for readiness';
      this.workflowPlan = this.buildWorkflowPlan(conditions);
    }

    this.workflowProgress = Math.max(0, Math.min(100, Math.round(
      (this.impactCount * 4) +
      (this.soilCompaction * 0.35) +
      (this.batteryCapacity * 0.25) +
      (this.state === 'CHARGING' ? 12 : 0) +
      (this.state === 'DISCHARGING' ? 18 : 0)
    )));
    this.workflowScore = Math.max(0, Math.min(100, Math.round(conditions.readinessScore)));

    if (previousPhase !== this.workflowPhase) {
      console.log(`Workflow phase: ${previousPhase} -> ${this.workflowPhase} (${this.workflowReason})`);
    }
  }

  shouldStartCharging() {
    const conditions = this.evaluateSystemConditions();
    
    const batterySufficient = conditions.batteryLevel > 20 && !conditions.maintenanceRequired;
    const soilNeedsCompaction = conditions.soilCompaction < 95;
    const systemReady = conditions.height === 0 && conditions.velocity === 0;
    
    return batterySufficient && soilNeedsCompaction && systemReady && conditions.readinessScore > 35;
  }

  shouldStartDischarging() {
    const conditions = this.evaluateSystemConditions();
    
    const heightSufficient = conditions.height >= this.MAX_HEIGHT * 0.85;
    const batteryFull = conditions.batteryLevel >= 92;
    const soilReady = conditions.soilCompaction >= 40;
    
    return (heightSufficient || batteryFull) && soilReady && !conditions.maintenanceRequired;
  }

  predictNextState() {
    const conditions = this.evaluateSystemConditions();
    
    switch (this.state) {
      case 'IDLE':
        if (this.shouldStartCharging()) {
          return 'CHARGING';
        }
        break;
      case 'CHARGING':
        if (this.shouldStartDischarging()) {
          return 'DISCHARGING';
        }
        break;
      case 'DISCHARGING':
        if (conditions.height <= 0.5) {
          return 'IMPACT';
        }
        break;
      case 'IMPACT':
        if (conditions.height === 0) {
          return 'IDLE';
        }
        break;
    }
    
    return this.state;
  }

  changeState(newState) {
    const allowedStates = ['IDLE', 'CHARGING', 'DISCHARGING', 'IMPACT'];

    if (!allowedStates.includes(newState)) {
      console.warn(`Ignoring invalid state: ${newState}`);
      return false;
    }

    this.state = newState;
    this.stateTimer = 0;
    console.log(`State changed to: ${newState}`);
    return true;
  }

  calculateEnergies() {
    const mass = Math.max(0, this.pendulumMass);
    const height = Math.max(0, this.pendulumHeight);
    const velocity = this.pendulumVelocity;
    
    const potentialEnergy = mass * this.GRAVITY * height;
    const kineticEnergy = 0.5 * mass * velocity * velocity;
    const totalEnergy = potentialEnergy + kineticEnergy;
    
    return { potentialEnergy, kineticEnergy, totalEnergy };
  }

  processSensorData(sensorData) {
    const dt = config.updateInterval / 1000;
    this.updatePhysics(dt);
    
    const energies = this.calculateEnergies();
    const conditions = this.evaluateSystemConditions();
    
    let solarPower = 0;
    let motorPower = 0;
    let generatorPower = 0;
    let loadPower = 0;
    let batteryCurrent = 0;
    const solarProfile = this.getSolarProfile(conditions);
    
    switch (this.state) {
      case 'CHARGING': {
        solarPower = solarProfile;
        motorPower = Math.min(650, solarPower * this.MOTOR_EFFICIENCY);
        const batteryVoltage = this.batteryVoltage > 0 ? this.batteryVoltage : 1;
        const chargeRate = (solarPower - motorPower) / batteryVoltage;
        batteryCurrent = chargeRate;
        break;
      }
      case 'DISCHARGING': {
        const descentVelocity = this.getDischargeVelocity();
        const powerOutput = (this.pendulumMass * this.GRAVITY * descentVelocity) * this.GENERATOR_EFFICIENCY;
        generatorPower = powerOutput;
        loadPower = powerOutput * this.getLoadFactor();
        const batteryVoltage2 = this.batteryVoltage > 0 ? this.batteryVoltage : 1;
        const dischargeRate = loadPower / batteryVoltage2;
        batteryCurrent = -dischargeRate;
        break;
      }
      case 'IMPACT': {
        const batteryCapacityAh = 50;
        const dischargeRate2 = loadPower / (this.batteryVoltage || 1);
        const dischargePercentage = (dischargeRate2 * dt) / batteryCapacityAh * 100;
        this.batteryCapacity = Math.max(0, this.batteryCapacity - dischargePercentage);
        break;
      }
    }

    const snapshot = {
      pendulumHeight: this.pendulumHeight,
      pendulumVelocity: this.pendulumVelocity,
      pendulumMass: this.pendulumMass,
      potentialEnergy: energies.potentialEnergy,
      kineticEnergy: energies.kineticEnergy,
      totalEnergy: energies.totalEnergy,
      solarPower,
      motorPower,
      generatorPower,
      loadPower,
      batteryVoltage: this.batteryVoltage,
      batteryCapacity: this.batteryCapacity,
      batteryCurrent,
      soilDensity: this.soilDensity,
      soilCompaction: this.soilCompaction,
      impactCount: this.impactCount,
      state: this.state,
      workflowPhase: this.workflowPhase,
      workflowTask: this.workflowTask,
      workflowPlan: this.workflowPlan,
      workflowProgress: this.workflowProgress,
      workflowScore: this.workflowScore,
      workflowReason: this.workflowReason,
      time: this.time,
      timestamp: Date.now()
    };

    this.latestData = snapshot;
    return snapshot;
  }

  async shutdown() {
    console.log('Shutting down sensors...');
    this.initialized = false;
    console.log('✓ Sensors shutdown complete');
  }

  getSolarProfile(conditions) {
    if (conditions.maintenanceRequired) {
      return 150;
    }

    if (conditions.batteryLevel < 30) {
      return 820;
    }

    if (conditions.soilCompaction >= 85) {
      return 690;
    }

    return 750;
  }

  getDischargeVelocity() {
    if (this.workflowPhase === 'LIFTING') {
      return 0.45;
    }

    if (this.workflowPhase === 'RELEASE_PREP') {
      return 0.55;
    }

    if (this.workflowPhase === 'IMPACT_RECOVERY') {
      return 0.6;
    }

    return 0.5;
  }

  getLoadFactor() {
    if (this.workflowPhase === 'ENERGY_DELIVERY') {
      return 0.85;
    }

    if (this.workflowPhase === 'RELEASE_PREP') {
      return 0.75;
    }

    return 0.8;
  }
}

module.exports = SensorManager;
