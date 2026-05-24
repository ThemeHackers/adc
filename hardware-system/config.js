module.exports = {
  dashboardUrl: 'http://localhost:3001',
  updateInterval: 50,
  server: {
    host: '127.0.0.1',
    port: 3002
  },
  
  sensors: {
    height: {
      id: 'height_sensor',
      type: 'HEIGHT',
      enabled: true,
      pin: 'A0',
      minRaw: 0,
      maxRaw: 4095,
      minCalibrated: 0,
      maxCalibrated: 30,
      unit: 'm'
    },
    velocity: {
      id: 'velocity_sensor',
      type: 'VELOCITY',
      enabled: true,
      pin: 'A1',
      minRaw: 0,
      maxRaw: 4095,
      minCalibrated: -30,
      maxCalibrated: 30,
      unit: 'm/s'
    },
    current: {
      id: 'current_sensor',
      type: 'CURRENT',
      enabled: true,
      pin: 'A2',
      minRaw: 0,
      maxRaw: 4095,
      minCalibrated: 0,
      maxCalibrated: 100,
      unit: 'A'
    },
    voltage: {
      id: 'voltage_sensor',
      type: 'VOLTAGE',
      enabled: true,
      pin: 'A3',
      minRaw: 0,
      maxRaw: 4095,
      minCalibrated: 0,
      maxCalibrated: 60,
      unit: 'V'
    },
    force: {
      id: 'force_sensor',
      type: 'FORCE',
      enabled: true,
      pin: 'A4',
      minRaw: 0,
      maxRaw: 4095,
      minCalibrated: 0,
      maxCalibrated: 500000,
      unit: 'N'
    },
    soilDensity: {
      id: 'soil_density_sensor',
      type: 'SOIL_DENSITY',
      enabled: true,
      pin: 'A5',
      minRaw: 0,
      maxRaw: 4095,
      minCalibrated: 1300,
      maxCalibrated: 2100,
      unit: 'kg/m³'
    }
  },
  
  serial: {
    enabled: false,
    port: 'COM3',
    baudRate: 9600
  },
  
  simulation: {
    enabled: true,
    pendulumMass: 10000,
    gravity: 9.81,
    maxHeight: 30,
    batteryCapacity: 50,
    batteryVoltage: 48,
    motorEfficiency: 0.85,
    generatorEfficiency: 0.90,
    initialSoilDensity: 1550,
    maxSoilDensity: 2000,
    soilCompressionCoefficient: 0.0002,
    menardConstant: 0.5
  }
};
