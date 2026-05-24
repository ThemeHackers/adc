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

const getInitialHardwareData = (): HardwareData => ({
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
  time: 0,
  timestamp: Date.now()
});

if (!(global as any).hardwareData) {
  (global as any).hardwareData = getInitialHardwareData();
}

export const globalState = {
  getHardwareData: (): HardwareData => {
    return (global as any).hardwareData;
  },
  setHardwareData: (newData: Partial<HardwareData>): void => {
    (global as any).hardwareData = {
      ...(global as any).hardwareData,
      ...newData,
      timestamp: Date.now()
    };
  },
  resetHardwareData: (): void => {
    (global as any).hardwareData = getInitialHardwareData();
  }
};
