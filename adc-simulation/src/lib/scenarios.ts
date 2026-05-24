import { SimulationConfig } from '@/components/ConfigurationPanel';

export interface Scenario {
  id: string;
  name: string;
  description: string;
  config: SimulationConfig;
  duration: number;
  states: Array<{
    state: string;
    duration: number;
  }>;
}

export const scenarios: Scenario[] = [
  {
    id: 'quick-demo',
    name: 'Quick Demo',
    description: 'Fast demonstration of all states',
    config: {
      pendulumMass: 500,
      maxHeight: 10,
      gravity: 9.81,
      motorPower: 650,
      solarPower: 750,
      batteryVoltage: 24,
      batteryCapacity: 80,
      motorEfficiency: 0.85,
      generatorEfficiency: 0.90,
      initialSoilDensity: 1600
    },
    duration: 30,
    states: [
      { state: 'IDLE', duration: 2 },
      { state: 'CHARGING', duration: 8 },
      { state: 'DISCHARGING', duration: 8 },
      { state: 'IMPACT', duration: 5 },
      { state: 'IDLE', duration: 7 }
    ]
  },
  {
    id: 'full-cycle',
    name: 'Full Cycle',
    description: 'Complete charging and discharging cycle',
    config: {
      pendulumMass: 500,
      maxHeight: 15,
      gravity: 9.81,
      motorPower: 650,
      solarPower: 750,
      batteryVoltage: 24,
      batteryCapacity: 50,
      motorEfficiency: 0.85,
      generatorEfficiency: 0.90,
      initialSoilDensity: 1600
    },
    duration: 60,
    states: [
      { state: 'IDLE', duration: 5 },
      { state: 'CHARGING', duration: 20 },
      { state: 'DISCHARGING', duration: 20 },
      { state: 'IMPACT', duration: 10 },
      { state: 'IDLE', duration: 5 }
    ]
  },
  {
    id: 'stress-test',
    name: 'Stress Test',
    description: 'Rapid state changes for system testing',
    config: {
      pendulumMass: 750,
      maxHeight: 15,
      gravity: 9.81,
      motorPower: 1000,
      solarPower: 800,
      batteryVoltage: 24,
      batteryCapacity: 30,
      motorEfficiency: 0.90,
      generatorEfficiency: 0.95,
      initialSoilDensity: 1500
    },
    duration: 45,
    states: [
      { state: 'IDLE', duration: 2 },
      { state: 'CHARGING', duration: 5 },
      { state: 'DISCHARGING', duration: 5 },
      { state: 'IMPACT', duration: 3 },
      { state: 'CHARGING', duration: 5 },
      { state: 'DISCHARGING', duration: 5 },
      { state: 'IMPACT', duration: 3 },
      { state: 'CHARGING', duration: 5 },
      { state: 'DISCHARGING', duration: 5 },
      { state: 'IMPACT', duration: 3 },
      { state: 'IDLE', duration: 9 }
    ]
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Use current configuration',
    config: {
      pendulumMass: 500,
      maxHeight: 15,
      gravity: 9.81,
      motorPower: 650,
      solarPower: 750,
      batteryVoltage: 24,
      batteryCapacity: 50,
      motorEfficiency: 0.85,
      generatorEfficiency: 0.90,
      initialSoilDensity: 1600
    },
    duration: 0,
    states: []
  }
];

export class ScenarioRunner {
  private currentScenario: Scenario | null = null;
  private currentStateIndex: number = 0;
  private stateStartTime: number = 0;
  private isRunning: boolean = false;
  private onStateChange: ((state: string) => void) | null = null;
  private onComplete: (() => void) | null = null;
  private interval: NodeJS.Timeout | null = null;
  
  public startScenario(
    scenario: Scenario,
    onStateChange: (state: string) => void,
    onComplete: () => void
  ): void {
    this.currentScenario = scenario;
    this.currentStateIndex = 0;
    this.stateStartTime = Date.now();
    this.isRunning = true;
    this.onStateChange = onStateChange;
    this.onComplete = onComplete;
    
    if (scenario.states.length === 0) {
      this.stop();
      onComplete();
      return;
    }

    onStateChange(scenario.states[0].state);
    
    this.interval = setInterval(() => this.checkStateTransition(), 100);
  }
  
  private checkStateTransition(): void {
    if (!this.currentScenario || !this.isRunning || !this.onStateChange) {
      return;
    }
    
    const currentState = this.currentScenario.states[this.currentStateIndex];

    if (!currentState || typeof currentState.duration !== 'number' || !Number.isFinite(currentState.duration) || currentState.duration < 0) {
      this.currentStateIndex++;

      if (this.currentStateIndex >= this.currentScenario.states.length) {
        this.stop();
        if (this.onComplete) {
          this.onComplete();
        }
      } else {
        this.stateStartTime = Date.now();
        this.onStateChange(this.currentScenario.states[this.currentStateIndex].state);
      }

      return;
    }

    const elapsed = (Date.now() - this.stateStartTime) / 1000;
    
    if (elapsed >= currentState.duration) {
      this.currentStateIndex++;
      
      if (this.currentStateIndex >= this.currentScenario.states.length) {
        this.stop();
        if (this.onComplete) {
          this.onComplete();
        }
      } else {
        this.stateStartTime = Date.now();
        this.onStateChange(this.currentScenario.states[this.currentStateIndex].state);
      }
    }
  }
  
  public stop(): void {
    this.isRunning = false;
    this.currentScenario = null;
    this.currentStateIndex = 0;
    
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
  
  public getCurrentScenario(): Scenario | null {
    return this.currentScenario;
  }
  
  public isScenarioRunning(): boolean {
    return this.isRunning;
  }
}
