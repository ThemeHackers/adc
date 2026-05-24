const config = require('./config');

class RealSensorInterface {
  constructor() {
    this.serialPort = null;
    this.connected = false;
  }

  async connectSerial() {
    if (!config.serial.enabled) {
      console.log('Serial connection disabled in config');
      return false;
    }

    try {
      const { SerialPort } = require('serialport');
      
      this.serialPort = new SerialPort({
        path: config.serial.port,
        baudRate: config.serial.baudRate,
        dataBits: 8,
        stopBits: 1,
        parity: 'none'
      });

      this.serialPort.on('open', () => {
        console.log(`✓ Serial port ${config.serial.port} opened`);
        this.connected = true;
      });

      this.serialPort.on('error', (err) => {
        console.error('Serial port error:', err.message);
        this.connected = false;
      });

      this.serialPort.on('data', (data) => {
        this.handleSerialData(data);
      });

      return true;
    } catch (error) {
      console.error('Failed to initialize serial port:', error.message);
      console.log('Install serialport package: npm install serialport');
      return false;
    }
  }

  handleSerialData(data) {
    try {
      const dataString = data.toString().trim();
      if (dataString) {
        const sensorData = JSON.parse(dataString);
        this.processSensorData(sensorData);
      }
    } catch (error) {
      console.error('Error parsing serial data:', error.message);
    }
  }

  processSensorData(sensorData) {
    console.log('Received sensor data:', sensorData);
  }

  async sendCommand(command) {
    if (!this.serialPort || !this.connected) {
      console.error('Serial port not connected');
      return false;
    }

    try {
      this.serialPort.write(command + '\n');
      return true;
    } catch (error) {
      console.error('Error sending command:', error.message);
      return false;
    }
  }

  async readAnalogPin(pin) {
    if (!this.serialPort || !this.connected) {
      console.log('Serial not connected, using simulated value');
      return this.simulateAnalogRead(pin);
    }

    try {
      await this.sendCommand(`READ_ANALOG ${pin}`);
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve(this.simulateAnalogRead(pin));
        }, 1000);
        
        this.serialPort.once('data', (data) => {
          clearTimeout(timeout);
          try {
            const value = parseInt(data.toString().trim());
            resolve(value);
          } catch (error) {
            resolve(this.simulateAnalogRead(pin));
          }
        });
      });
    } catch (error) {
      console.error('Error reading analog pin:', error.message);
      return this.simulateAnalogRead(pin);
    }
  }

  simulateAnalogRead(pin) {
    return Math.floor(Math.random() * 4096);
  }

  async readDigitalPin(pin) {
    if (!this.serialPort || !this.connected) {
      console.log('Serial not connected, using simulated value');
      return Math.random() > 0.5 ? 1 : 0;
    }

    try {
      await this.sendCommand(`READ_DIGITAL ${pin}`);
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve(Math.random() > 0.5 ? 1 : 0);
        }, 1000);
        
        this.serialPort.once('data', (data) => {
          clearTimeout(timeout);
          try {
            const value = parseInt(data.toString().trim());
            resolve(value);
          } catch (error) {
            resolve(Math.random() > 0.5 ? 1 : 0);
          }
        });
      });
    } catch (error) {
      console.error('Error reading digital pin:', error.message);
      return Math.random() > 0.5 ? 1 : 0;
    }
  }

  disconnect() {
    if (this.serialPort && this.connected) {
      this.serialPort.close();
      this.connected = false;
      console.log('Serial port disconnected');
    }
  }
}

module.exports = RealSensorInterface;
