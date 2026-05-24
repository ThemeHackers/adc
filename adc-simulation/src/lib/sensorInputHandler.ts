import { HardwareClient, SensorInputData } from './hardwareClient';
import { SensorDataProcessor } from './sensors';

export interface SerialPortConfig {
  port: string;
  baudRate: number;
  dataBits: number;
  stopBits: number;
  parity: 'none' | 'even' | 'odd' | 'mark' | 'space';
}

export class SensorInputHandler {
  private hardwareClient: HardwareClient;
  private sensorProcessor: SensorDataProcessor;
  private isRunning: boolean = false;
  private updateInterval: number = 100;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(hardwareClient: HardwareClient) {
    this.hardwareClient = hardwareClient;
    this.sensorProcessor = hardwareClient.getSensorProcessor();
  }

  public start(updateInterval: number = 100): void {
    this.updateInterval = updateInterval;
    this.isRunning = true;
    
    this.intervalId = setInterval(() => {
      this.processSensorInputs();
    }, this.updateInterval);
    
    console.log('Sensor Input Handler started with', updateInterval, 'ms interval');
  }

  public stop(): void {
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    console.log('Sensor Input Handler stopped');
  }

  private processSensorInputs(): void {
    const hardwareData = this.sensorProcessor.convertToHardwareData();
    
    if (Object.keys(hardwareData).length > 0) {
      this.hardwareClient.processSensorData();
    }
  }

  public addSensorReading(sensorId: string, rawValue: number): void {
    this.hardwareClient.addSensorReading(sensorId, rawValue);
  }

  public addMultipleSensorReadings(readings: SensorInputData[]): void {
    readings.forEach(reading => {
      this.addSensorReading(reading.sensorId, reading.rawValue);
    });
  }

  public simulateSensorData(): void {
    const time = Date.now() / 1000;
    
    const heightSensor = Math.sin(time * 0.5) * 2048 + 2048;
    const velocitySensor = Math.cos(time * 0.5) * 1024 + 2048;
    const currentSensor = Math.random() * 1000 + 500;
    const voltageSensor = 3000;
    const forceSensor = Math.random() * 500;
    const soilDensitySensor = 2000;
    
    this.addMultipleSensorReadings([
      { sensorId: 'height_sensor', rawValue: heightSensor },
      { sensorId: 'velocity_sensor', rawValue: velocitySensor },
      { sensorId: 'current_sensor', rawValue: currentSensor },
      { sensorId: 'voltage_sensor', rawValue: voltageSensor },
      { sensorId: 'force_sensor', rawValue: forceSensor },
      { sensorId: 'soil_density_sensor', rawValue: soilDensitySensor }
    ]);
  }
}

export class SerialSensorHandler extends SensorInputHandler {
  private serialPort: any = null;
  private portConfig: SerialPortConfig;

  constructor(hardwareClient: HardwareClient, portConfig: SerialPortConfig) {
    super(hardwareClient);
    this.portConfig = portConfig;
  }

  public async connectToSerial(): Promise<boolean> {
    try {
      console.log('Connecting to serial port:', this.portConfig.port);
      
      return true;
    } catch (error) {
      console.error('Failed to connect to serial port:', error);
      return false;
    }
  }

  public disconnectFromSerial(): void {
    if (this.serialPort) {
      console.log('Disconnecting from serial port');
      this.serialPort = null;
    }
  }
}

export class NetworkSensorHandler extends SensorInputHandler {
  private networkUrl: string;
  private pollingInterval: number = 1000;
  private networkIntervalId: NodeJS.Timeout | null = null;

  constructor(hardwareClient: HardwareClient, networkUrl: string) {
    super(hardwareClient);
    this.networkUrl = networkUrl;
  }

  public async connectToNetwork(): Promise<boolean> {
    try {
      console.log('Connecting to network sensor:', this.networkUrl);
      
      this.networkIntervalId = setInterval(() => {
        this.fetchNetworkSensorData();
      }, this.pollingInterval);
      
      return true;
    } catch (error) {
      console.error('Failed to connect to network sensor:', error);
      return false;
    }
  }

  private async fetchNetworkSensorData(): Promise<void> {
    try {
      const response = await fetch(this.networkUrl);
      const data = await response.json();
      
      if (data.sensors) {
        Object.entries(data.sensors).forEach(([sensorId, value]) => {
          this.addSensorReading(sensorId, value as number);
        });
      }
    } catch (error) {
      console.error('Error fetching network sensor data:', error);
    }
  }

  public disconnectFromNetwork(): void {
    if (this.networkIntervalId) {
      clearInterval(this.networkIntervalId);
      this.networkIntervalId = null;
    }
    console.log('Disconnected from network sensor');
  }
}
