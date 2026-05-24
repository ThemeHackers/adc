import { SensorDataProcessor, SensorReading, SensorType } from './sensors';

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

export interface SensorInputData {
  sensorId: string;
  rawValue: number;
  timestamp?: number;
}

export class HardwareClient {
  private ws: WebSocket | null = null;
  private reconnectInterval: number = 5000;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private pollingTimer: NodeJS.Timeout | null = null;
  private onDataCallback: ((data: HardwareData) => void) | null = null;
  private onStateChangeCallback: ((state: string) => void) | null = null;
  private onSensorDataCallback: ((reading: SensorReading) => void) | null = null;
  private isConnected: boolean = false;
  private serverUrl: string;
  private httpUrl: string;
  private pollingInterval: number = 100;
  private sensorProcessor: SensorDataProcessor;

  constructor(serverUrl?: string) {
    if (serverUrl) {
      this.serverUrl = serverUrl;
      this.httpUrl = serverUrl.replace('ws://', 'http://').replace('wss://', 'https://');
    } else if (typeof window !== 'undefined') {
      const host = window.location.host;
      const protocol = window.location.protocol;
      this.httpUrl = `${protocol}//${host}`;
      this.serverUrl = `${protocol === 'https:' ? 'wss:' : 'ws:'}//${host}`;
    } else {
      this.serverUrl = 'ws://127.0.0.1:3001';
      this.httpUrl = 'http://127.0.0.1:3001';
    }
    this.sensorProcessor = new SensorDataProcessor();
  }

  public async connect(): Promise<void> {

    console.log('Hardware mode: Using HTTP polling');
    console.log('Fetching data from:', this.httpUrl + '/api/hardware/data');

    this.isConnected = true;

    const isAvailable = await this.checkHealth();
    if (!isAvailable || !this.isConnected) {
      this.isConnected = false;
      console.warn('Hardware server is unavailable at:', this.httpUrl);
      return;
    }

    this.startPolling();
  }

  private async startPolling(): Promise<void> {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
    }


    await this.fetchData();

    if (!this.isConnected) {
      return;
    }


    this.pollingTimer = setInterval(() => {
      this.fetchData();
    }, this.pollingInterval);
  }

  private async fetchData(): Promise<void> {
    try {
      const response = await fetch(`${this.httpUrl}/api/hardware/data`);
      if (response.ok) {
        const data = await response.json();
        if (this.onDataCallback) {
          this.onDataCallback(data);
        }
      } else {
        console.error('API returned non-OK status:', response.status);
      }
    } catch (error) {
      console.warn('Hardware data fetch failed:', error);
      console.warn('Make sure the hardware server is running on:', this.httpUrl);
    }
  }

  private async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.httpUrl}/api/health`);
      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      return result.status === 'ok';
    } catch {
      return false;
    }
  }

  public disconnect(): void {
    console.log('Disconnecting from hardware server...');
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    console.log('Disconnected');
  }

  public onData(callback: (data: HardwareData) => void): void {
    this.onDataCallback = callback;
  }

  public onStateChange(callback: (state: string) => void): void {
    this.onStateChangeCallback = callback;
  }

  public onSensorData(callback: (reading: SensorReading) => void): void {
    this.onSensorDataCallback = callback;
  }

  public addSensorReading(sensorId: string, rawValue: number): SensorReading {
    const reading = this.sensorProcessor.addReading(sensorId, rawValue);
    
    if (this.onSensorDataCallback) {
      this.onSensorDataCallback(reading);
    }
    
    return reading;
  }

  public processSensorData(): Partial<HardwareData> {
    return this.sensorProcessor.convertToHardwareData();
  }

  public getSensorProcessor(): SensorDataProcessor {
    return this.sensorProcessor;
  }

  public sendState(state: string): void {

    fetch(`${this.httpUrl}/api/hardware/state`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ state }),
    }).catch(error => {
      console.error('Error sending state:', error);
    });
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }
}


export class HardwareAPIClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    if (baseUrl) {
      this.baseUrl = baseUrl;
    } else if (typeof window !== 'undefined') {
      this.baseUrl = window.location.origin;
    } else {
      this.baseUrl = 'http://127.0.0.1:3001';
    }
  }

  public async sendData(data: Partial<HardwareData>): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/hardware/data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error sending data to hardware server:', error);
      return false;
    }
  }

  public async getData(): Promise<HardwareData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/hardware/data`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting data from hardware server:', error);
      return null;
    }
  }

  public async updateState(state: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/hardware/state`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ state }),
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error updating state:', error);
      return false;
    }
  }

  public async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      const result = await response.json();
      return result.status === 'ok';
    } catch (error) {
      console.error('Error checking health:', error);
      return false;
    }
  }

  public async resetData(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/hardware/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error resetting data:', error);
      return false;
    }
  }
}
