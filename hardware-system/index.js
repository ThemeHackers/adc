const http = require('http');
const { URL } = require('url');
const SensorManager = require('./sensorManager');
const DataTransmitter = require('./dataTransmitter');
const config = require('./config');

class HardwareSystem {
  constructor() {
    this.sensorManager = new SensorManager();
    this.dataTransmitter = new DataTransmitter(config.dashboardUrl);
    this.isRunning = false;
    this.updateInterval = config.updateInterval;
    this.intervalId = null;
    this.httpServer = null;
    this.host = config.server?.host || '0.0.0.0';
    this.port = config.server?.port || 3002;
    this.latestData = this.sensorManager.getLatestSnapshot();
  }

  async initialize() {
    console.log('Initializing Hardware System...');
    
    try {
      await this.sensorManager.initialize();
      console.log('✓ Sensors initialized');
      this.latestData = this.sensorManager.getLatestSnapshot();
      
      const dashboardConnected = await this.dataTransmitter.connect();
      if (dashboardConnected) {
        console.log('✓ Connected to dashboard');
      } else {
        console.log(`Dashboard unavailable at ${config.dashboardUrl}, running in offline mode`);
      }

      await this.startHttpServer();
      
      return true;
    } catch (error) {
      console.error('✗ Initialization failed:', error.message);
      return false;
    }
  }

  start() {
    if (this.isRunning) {
      console.log('System is already running');
      return;
    }

    console.log('Starting Hardware System...');
    this.isRunning = true;

    this.intervalId = setInterval(() => {
      void this.measureAndTransmit();
    }, this.updateInterval);

    void this.measureAndTransmit();

    console.log(`✓ System started (update interval: ${this.updateInterval}ms)`);
  }

  async startHttpServer() {
    if (this.httpServer) {
      return;
    }

    this.httpServer = http.createServer((req, res) => {
      this.handleHttpRequest(req, res).catch((error) => {
        this.sendJson(res, 500, { success: false, error: error.message });
      });
    });

    await new Promise((resolve, reject) => {
      const onError = (error) => reject(error);
      this.httpServer.once('error', onError);

      this.httpServer.listen(this.port, this.host, () => {
        this.httpServer.removeListener('error', onError);
        console.log(`✓ Hardware simulation API running at http://${this.host}:${this.port}`);
        resolve();
      });
    });
  }

  async handleHttpRequest(req, res) {
    const requestUrl = new URL(req.url, `http://${req.headers.host || `${this.host}:${this.port}`}`);

    if (req.method === 'OPTIONS') {
      this.sendCors(res);
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.method === 'GET' && requestUrl.pathname === '/api/health') {
      this.sendJson(res, 200, {
        status: 'ok',
        service: 'hardware-system',
        running: this.isRunning,
        timestamp: Date.now()
      });
      return;
    }

    if (req.method === 'GET' && requestUrl.pathname === '/api/hardware/data') {
      this.sendJson(res, 200, this.latestData || this.sensorManager.getLatestSnapshot());
      return;
    }

    if (req.method === 'GET' && requestUrl.pathname === '/api/hardware/state') {
      this.sendJson(res, 200, {
        state: this.sensorManager.state,
        workflowPhase: this.sensorManager.workflowPhase,
        workflowTask: this.sensorManager.workflowTask,
        workflowPlan: this.sensorManager.workflowPlan,
        workflowProgress: this.sensorManager.workflowProgress,
        workflowScore: this.sensorManager.workflowScore,
        workflowReason: this.sensorManager.workflowReason,
        timestamp: Date.now()
      });
      return;
    }

    if (req.method === 'GET' && requestUrl.pathname === '/api/hardware/workflow') {
      this.sendJson(res, 200, {
        state: this.sensorManager.state,
        workflowPhase: this.sensorManager.workflowPhase,
        workflowTask: this.sensorManager.workflowTask,
        workflowPlan: this.sensorManager.workflowPlan,
        workflowProgress: this.sensorManager.workflowProgress,
        workflowScore: this.sensorManager.workflowScore,
        workflowReason: this.sensorManager.workflowReason,
        readinessScore: this.sensorManager.calculateReadinessScore(),
        timestamp: Date.now()
      });
      return;
    }

    if (req.method === 'POST' && requestUrl.pathname === '/api/hardware/state') {
      const body = await this.readJsonBody(req);

      if (!body.state) {
        this.sendJson(res, 400, { success: false, error: 'Missing state' });
        return;
      }

      const accepted = this.sensorManager.changeState(body.state);
      if (!accepted) {
        this.sendJson(res, 400, { success: false, error: 'Invalid state' });
        return;
      }

      this.latestData = this.sensorManager.buildSnapshot();
      this.sendJson(res, 200, { success: true, state: body.state });
      return;
    }

    if (req.method === 'POST' && requestUrl.pathname === '/api/hardware/reset') {
      this.sensorManager.reset();
      this.latestData = this.sensorManager.getLatestSnapshot();
      this.sendJson(res, 200, { success: true, message: 'Hardware simulation reset' });
      return;
    }

    this.sendJson(res, 404, { success: false, error: 'Not found' });
  }

  sendJson(res, statusCode, payload) {
    this.sendCors(res);
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(payload));
  }

  sendCors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  readJsonBody(req) {
    return new Promise((resolve, reject) => {
      let raw = '';

      req.on('data', (chunk) => {
        raw += chunk;
      });

      req.on('end', () => {
        if (!raw) {
          resolve({});
          return;
        }

        try {
          resolve(JSON.parse(raw));
        } catch (error) {
          reject(new Error('Invalid JSON body'));
        }
      });

      req.on('error', reject);
    });
  }

  stop() {
    if (!this.isRunning) {
      console.log('System is not running');
      return;
    }

    console.log('Stopping Hardware System...');
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('✓ System stopped');
  }

  async measureAndTransmit() {
    try {
      const sensorData = await this.sensorManager.readAllSensors();
      
      const processedData = this.sensorManager.processSensorData(sensorData);
      this.latestData = processedData;
      
      if (this.dataTransmitter.getConnectionStatus()) {
        await this.dataTransmitter.sendData(processedData);
        
        console.log(`[${new Date().toLocaleTimeString()}] Data transmitted:`, {
          height: processedData.pendulumHeight?.toFixed(2) + 'm',
          velocity: processedData.pendulumVelocity?.toFixed(2) + 'm/s',
          battery: processedData.batteryCapacity?.toFixed(1) + '%',
          state: processedData.state
        });
      }
    } catch (error) {
      console.error('Error in measurement/transmission cycle:', error.message);
    }
  }

  async shutdown() {
    console.log('Shutting down Hardware System...');
    this.stop();

    if (this.httpServer) {
      await new Promise((resolve) => {
        this.httpServer.close(() => resolve());
      });
      this.httpServer = null;
    }

    await this.dataTransmitter.disconnect();
    await this.sensorManager.shutdown();
    console.log('✓ System shutdown complete');
  }
}

const system = new HardwareSystem();

async function main() {
  try {
    const initialized = await system.initialize();
    
    if (initialized) {
      system.start();
      
      process.on('SIGINT', async () => {
        console.log('\nReceived shutdown signal...');
        await system.shutdown();
        process.exit(0);
      });
      
      process.on('SIGTERM', async () => {
        console.log('\nReceived termination signal...');
        await system.shutdown();
        process.exit(0);
      });
    } else {
      console.error('Failed to initialize system');
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = HardwareSystem;
