import { SimulationEngine, SimulationData, SimulationState } from './simulation-engine';
import { DataLogger } from './dataLogger';
import { ScenarioRunner, Scenario } from './scenarios';
import { SimulationConfig } from './simulationConfig';


const globalForSimulation = globalThis as unknown as {
  simulation: SimulationEngine;
  dataLogger: DataLogger;
  scenarioRunner: ScenarioRunner;
  isRunning: boolean;
  activeScenarioId: string;
  config: SimulationConfig | null;
  intervalId: NodeJS.Timeout | null;
  callbacks: Set<(data: SimulationData) => void>;
  onScenarioStateChangeCallbacks: Set<(state: string) => void>;
  onScenarioCompleteCallbacks: Set<() => void>;
};

if (!globalForSimulation.simulation) {
  globalForSimulation.simulation = new SimulationEngine();
}
if (!globalForSimulation.dataLogger) {
  globalForSimulation.dataLogger = new DataLogger();
}
if (!globalForSimulation.scenarioRunner) {
  globalForSimulation.scenarioRunner = new ScenarioRunner();
}
if (globalForSimulation.isRunning === undefined) {
  globalForSimulation.isRunning = false;
}
if (globalForSimulation.activeScenarioId === undefined) {
  globalForSimulation.activeScenarioId = 'custom';
}
if (!globalForSimulation.callbacks) {
  globalForSimulation.callbacks = new Set();
}
if (!globalForSimulation.onScenarioStateChangeCallbacks) {
  globalForSimulation.onScenarioStateChangeCallbacks = new Set();
}
if (!globalForSimulation.onScenarioCompleteCallbacks) {
  globalForSimulation.onScenarioCompleteCallbacks = new Set();
}

export const sharedSimulation = globalForSimulation.simulation;
export const sharedDataLogger = globalForSimulation.dataLogger;
export const sharedScenarioRunner = globalForSimulation.scenarioRunner;

export const subscribeToSimulation = (callback: (data: SimulationData) => void) => {
  globalForSimulation.callbacks.add(callback);

  callback(sharedSimulation.getData());
  return () => {
    globalForSimulation.callbacks.delete(callback);
  };
};

export const subscribeToScenarioStateChange = (callback: (state: string) => void) => {
  globalForSimulation.onScenarioStateChangeCallbacks.add(callback);
  return () => {
    globalForSimulation.onScenarioStateChangeCallbacks.delete(callback);
  };
};

export const subscribeToScenarioComplete = (callback: () => void) => {
  globalForSimulation.onScenarioCompleteCallbacks.add(callback);
  return () => {
    globalForSimulation.onScenarioCompleteCallbacks.delete(callback);
  };
};

const tick = () => {
  sharedSimulation.update(50);
  const data = sharedSimulation.getData();
  sharedDataLogger.log(data);

  globalForSimulation.callbacks.forEach(cb => cb(data));
};

export const getSharedIsRunning = () => globalForSimulation.isRunning;
export const getSharedActiveScenarioId = () => globalForSimulation.activeScenarioId;

export const setSharedIsRunning = (running: boolean) => {
  if (globalForSimulation.isRunning === running) return;
  globalForSimulation.isRunning = running;

  if (running) {
    if (!globalForSimulation.intervalId) {

      globalForSimulation.intervalId = setInterval(tick, 50);
    }
  } else {
    if (globalForSimulation.intervalId) {
      clearInterval(globalForSimulation.intervalId);
      globalForSimulation.intervalId = null;
    }
    sharedScenarioRunner.stop();
  }
};

export const setSharedActiveScenarioId = (id: string) => {
  globalForSimulation.activeScenarioId = id;
};

export const startSharedScenario = (scenario: Scenario) => {
  sharedScenarioRunner.stop();
  globalForSimulation.activeScenarioId = scenario.id;

  sharedSimulation.applyConfiguration(scenario.config);
  const currentData = sharedSimulation.getData();
  globalForSimulation.callbacks.forEach(cb => cb(currentData));

  if (scenario.id !== 'custom') {
    setSharedIsRunning(true);
    sharedScenarioRunner.startScenario(
      scenario,
      (nextState) => {
        sharedSimulation.setState(nextState as SimulationState);
        const data = sharedSimulation.getData();
        globalForSimulation.callbacks.forEach(cb => cb(data));
        globalForSimulation.onScenarioStateChangeCallbacks.forEach(cb => cb(nextState));
      },
      () => {
        setSharedIsRunning(false);
        globalForSimulation.activeScenarioId = 'custom';
        const data = sharedSimulation.getData();
        globalForSimulation.callbacks.forEach(cb => cb(data));
        globalForSimulation.onScenarioCompleteCallbacks.forEach(cb => cb());
      }
    );
  } else {
    setSharedIsRunning(false);
  }
};

export const resetSharedSimulation = () => {
  sharedScenarioRunner.stop();
  globalForSimulation.activeScenarioId = 'custom';
  setSharedIsRunning(false);
  sharedSimulation.reset();
  sharedDataLogger.clear();

  const data = sharedSimulation.getData();
  globalForSimulation.callbacks.forEach(cb => cb(data));
};
