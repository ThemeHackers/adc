const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());


const clients = new Set();


let hardwareData = {
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
};


wss.on('connection', (ws) => {
  console.log('New client connected');
  clients.add(ws);
  

  ws.send(JSON.stringify({ type: 'INIT', data: hardwareData }));
  
  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});


function broadcast(data) {
  const message = JSON.stringify(data);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}


app.post('/api/hardware/data', (req, res) => {
  try {
    const newData = req.body;
    

    hardwareData = {
      ...hardwareData,
      ...newData,
      timestamp: Date.now()
    };
    
   
    broadcast({ type: 'UPDATE', data: hardwareData });
    
    res.json({ success: true, message: 'Data received' });
  } catch (error) {
    console.error('Error processing hardware data:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('/api/hardware/data', (req, res) => {
  res.json(hardwareData);
});


app.post('/api/hardware/state', (req, res) => {
  try {
    const { state } = req.body;
    hardwareData.state = state;
    broadcast({ type: 'STATE_CHANGE', data: hardwareData });
    res.json({ success: true, message: 'State updated' });
  } catch (error) {
    console.error('Error updating state:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/hardware/reset', (req, res) => {
  try {
    hardwareData = {
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
    };
    broadcast({ type: 'RESET', data: hardwareData });
    res.json({ success: true, message: 'Data reset to default' });
  } catch (error) {
    console.error('Error resetting data:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});


app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    connectedClients: clients.size,
    timestamp: Date.now()
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Hardware Integration Server running on port ${PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}`);
  console.log(`REST API endpoint: http://localhost:${PORT}/api/hardware/data`);
});
