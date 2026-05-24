const axios = require('axios');

const API_URL = 'http://localhost:3001/api/hardware/data';
const RESET_URL = 'http://localhost:3001/api/hardware/reset';
const STATE_URL = 'http://localhost:3001/api/hardware/state';

class HardwareSimulator {
  constructor() {
    this.data = {
      pendulumHeight: 0,
      pendulumVelocity: 0,
      pendulumMass: 500,
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
    
    this.state = 'IDLE';
    this.time = 0;
    this.gravity = 9.81;
    this.maxHeight = 15;
    this.initialSoilDensity = 1600;
    this.maxSoilDensity = 2000;
    this.solarPower = 750;
    this.motorPower = 650;
    this.generatorEfficiency = 0.90;
    this.motorEfficiency = 0.85;
    this.batteryCapacityAh = 50;
    
    this.interval = null;
    this.stateTimer = 0;
    this.stateDuration = 10;
  }

  reset() {
    this.data = {
      pendulumHeight: 0,
      pendulumVelocity: 0,
      pendulumMass: 500,
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
    this.state = 'IDLE';
    this.time = 0;
    this.stateTimer = 0;
  }

  calculateEnergies() {
    const mass = this.data.pendulumMass;
    const height = Math.max(0, this.data.pendulumHeight);
    const velocity = this.data.pendulumVelocity;
    
    this.data.potentialEnergy = mass * this.gravity * height;
    this.data.kineticEnergy = 0.5 * mass * velocity * velocity;
    this.data.totalEnergy = this.data.potentialEnergy + this.data.kineticEnergy;
  }

  update(dt) {
    this.time += dt;
    this.stateTimer += dt;
    
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
    this.data.time = this.time;
    this.data.state = this.state;
  }

  updateIdle(dt) {
    this.data.pendulumVelocity = 0;
    this.data.solarPower = 0;
    this.data.motorPower = 0;
    this.data.generatorPower = 0;
    this.data.batteryCurrent = 0;
    
    if (this.stateTimer > 3) {
      this.changeState('CHARGING');
    }
  }

  updateCharging(dt) {
    this.data.solarPower = this.solarPower;
    this.data.motorPower = Math.min(this.motorPower, this.solarPower * this.motorEfficiency);
    
    const liftingForce = this.data.pendulumMass * this.gravity;
    const upwardVelocity = liftingForce > 0 ? this.data.motorPower / liftingForce : 0;
    
    if (this.data.pendulumHeight < this.maxHeight) {
      this.data.pendulumHeight += upwardVelocity * dt;
      this.data.pendulumHeight = Math.min(this.data.pendulumHeight, this.maxHeight);
      this.data.pendulumVelocity = upwardVelocity;
    } else {
      this.data.pendulumVelocity = 0;
      this.data.motorPower = 0;
      this.changeState('DISCHARGING');
    }
    
    const batteryVoltage = this.data.batteryVoltage > 0 ? this.data.batteryVoltage : 1;
    const chargeRate = (this.solarPower - this.data.motorPower) / batteryVoltage;
    this.data.batteryCurrent = chargeRate;
    const chargePercentage = (chargeRate * dt) / this.batteryCapacityAh * 100;
    this.data.batteryCapacity = Math.min(100, Math.max(0, this.data.batteryCapacity + chargePercentage));
  }

  updateDischarging(dt) {
    this.data.solarPower = 0;
    this.data.motorPower = 0;
    
    const descentVelocity = 0.5;
    
    if (this.data.pendulumHeight > 0) {
      this.data.pendulumHeight -= descentVelocity * dt;
      this.data.pendulumHeight = Math.max(this.data.pendulumHeight, 0);
      this.data.pendulumVelocity = -descentVelocity;
      
      const powerOutput = (this.data.pendulumMass * this.gravity * descentVelocity) * this.generatorEfficiency;
      this.data.generatorPower = powerOutput;
      this.data.loadPower = powerOutput * 0.8;
      
      const batteryVoltage = this.data.batteryVoltage > 0 ? this.data.batteryVoltage : 1;
      const dischargeRate = this.data.loadPower / batteryVoltage;
      this.data.batteryCurrent = -dischargeRate;
      const dischargePercentage = (dischargeRate * dt) / this.batteryCapacityAh * 100;
      this.data.batteryCapacity = Math.max(0, this.data.batteryCapacity - dischargePercentage);
    } else {
      this.data.pendulumVelocity = 0;
      this.data.generatorPower = 0;
      this.data.loadPower = 0;
      this.data.batteryCurrent = 0;
      this.changeState('IMPACT');
    }
  }

  updateImpact(dt) {
    this.data.solarPower = 0;
    this.data.motorPower = 0;
    this.data.generatorPower = 0;
    
    if (this.data.pendulumHeight > 0) {
      this.data.pendulumVelocity -= this.gravity * dt;
      this.data.pendulumHeight += this.data.pendulumVelocity * dt;
      
      if (this.data.pendulumHeight <= 0) {
        this.data.pendulumHeight = 0;
        this.data.impactCount++;
        
        const impactEnergy = 0.5 * this.data.pendulumMass * Math.pow(this.data.pendulumVelocity, 2);
        const compactionIncrease = Math.min(impactEnergy * 0.0002, Math.max(0, 100 - this.data.soilCompaction));
        
        this.data.soilCompaction = Math.min(100, Math.max(0, this.data.soilCompaction + compactionIncrease));
        this.data.soilDensity = this.initialSoilDensity + 
          (this.data.soilCompaction / 100) * (this.maxSoilDensity - this.initialSoilDensity);
        
        this.data.pendulumVelocity = 0;
        this.changeState('IDLE');
      }
    }
  }

  changeState(newState) {
    this.state = newState;
    this.stateTimer = 0;
    console.log(`State changed to: ${newState}`);
  }

  async sendData() {
    try {
      const response = await axios.post(API_URL, this.data);
      console.log(`[${new Date().toLocaleTimeString()}] Data sent: ${this.data.state}, Height: ${this.data.pendulumHeight.toFixed(2)}m, Battery: ${this.data.batteryCapacity.toFixed(1)}%`);
    } catch (error) {
      console.error('Error sending data:', error.message);
    }
  }

  start(updateInterval = 100) {
    console.log('Starting Hardware Simulator...');
    console.log('Sending data to:', API_URL);
    
    this.interval = setInterval(() => {
      this.update(updateInterval / 1000);
      this.sendData();
    }, updateInterval);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log('Hardware Simulator stopped');
    }
  }
}

const simulator = new HardwareSimulator();

console.log('Hardware Simulator');
console.log('Press Ctrl+C to stop');

simulator.start(100);

process.on('SIGINT', () => {
  console.log('\nStopping simulator...');
  simulator.stop();
  process.exit(0);
});
