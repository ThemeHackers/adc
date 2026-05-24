# Hardware Integration Guide for ADC System

## ภาพรวมระบบ (System Overview)

ระบบ ADC Dashboard รองรับ 2 โหมด:
1. **Simulation Mode** - จำลองข้อมูลด้วย software (ค่าเริ่มต้น)
2. **Hardware Mode** - รับข้อมูลจาก hardware จริง

## สถาปัตยกรรมระบบ (System Architecture)

```
Hardware (Arduino/ESP32/Raspberry Pi)
    ↓ (อ่านค่าจากเซนเซอร์)
    ↓ (ส่งข้อมูลผ่าน HTTP POST)
Backend Server (server.js)
    ↓ (WebSocket)
Dashboard (Next.js)
    ↓ (แสดงข้อมูล)
ผู้ใช้
```

## ขั้นตอนการติดตั้ง (Installation Steps)

### 1. ติดตั้ง Dependencies สำหรับ Server

```bash
npm install express cors ws concurrently
```

### 2. เริ่ม Backend Server

```bash
# เริ่มเฉพาะ server
npm run server

# หรือเริ่มทั้ง dashboard และ server พร้อมกัน
npm run dev:all
```

Server จะทำงานที่:
- REST API: `http://localhost:3001/api/hardware/data`
- WebSocket: `ws://localhost:3001` (ปัจจุบันถูกปิดใช้งานชั่วคราว)

**หมายเหตุ:** WebSocket connection ถูกปิดใช้งานชั่วคราวเนื่องจากปัญหาการเชื่อมต่อ ใช้ HTTP POST แทน

### 3. เปิด Hardware Mode ใน Dashboard

1. เปิด dashboard ที่ `http://localhost:3000`
2. คลิกปุ่ม **"Simulation"** เพื่อเปลี่ยนเป็น **"Hardware"**
3. ตรวจสอบสถานะการเชื่อมต่อ (Connected/Disconnected)

## การเชื่อมต่อ Hardware (Hardware Connection)

### ตัวเลือกที่ 1: Arduino + WiFi Shield

ใช้ Arduino พร้อม WiFi Shield หรือ ESP8266/ESP32

### ตัวเลือกที่ 2: ESP32

ใช้ ESP32 ที่มี WiFi ในตัว

### ตัวเลือกที่ 3: Raspberry Pi

ใช้ Raspberry Pi พร้อม Python หรือ Node.js

## API Endpoints

### POST /api/hardware/data

ส่งข้อมูลจาก hardware ไปยัง server

**Request Body:**
```json
{
  "pendulumHeight": 10.5,
  "pendulumVelocity": 5.2,
  "pendulumMass": 500,
  "potentialEnergy": 50000,
  "kineticEnergy": 6760,
  "totalEnergy": 56760,
  "solarPower": 650,
  "motorPower": 750,
  "generatorPower": 800,
  "loadPower": 500,
  "batteryVoltage": 24,
  "batteryCapacity": 75,
  "batteryCurrent": 20,
  "soilDensity": 1700,
  "soilCompaction": 45,
  "impactCount": 10,
  "state": "CHARGING",
  "time": 120.5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Data received"
}
```

### GET /api/hardware/data

รับข้อมูลล่าสุดจาก server

**Response:**
```json
{
  "pendulumHeight": 10.5,
  "pendulumVelocity": 5.2,
  ...
}
```

### POST /api/hardware/state

อัปเดตสถานะระบบ

**Request Body:**
```json
{
  "state": "IMPACT"
}
```

### POST /api/hardware/reset

รีเซ็ตข้อมูล hardware กลับเป็นค่าเริ่มต้น

**Response:**
```json
{
  "success": true,
  "message": "Data reset to default"
}
```

### GET /api/health

ตรวจสอบสถานะ server

**Response:**
```json
{
  "status": "ok",
  "connectedClients": 1,
  "timestamp": 1234567890
}
```

## เซนเซอร์ที่ต้องการ (Required Sensors)

ระบบรองรับเซนเซอร์จริงผ่าน Sensor Input Handler ที่มีระบบ Calibration และ Processing

1. **Height Sensor** - วัดความสูงลูกตุ้ม (Ultrasonic/Laser/Encoder)
   - Sensor ID: `height_sensor`
   - Input Range: 0-4095 (ADC)
   - Output Range: 0-15m
   - Unit: m

2. **Velocity Sensor** - วัดความเร็ว (Encoder/Accelerometer)
   - Sensor ID: `velocity_sensor`
   - Input Range: 0-4095 (ADC)
   - Output Range: -20 to 20 m/s
   - Unit: m/s

3. **Current Sensor** - วัดกระแสไฟ (ACS712/Hall Effect)
   - Sensor ID: `current_sensor`
   - Input Range: 0-4095 (ADC)
   - Output Range: 0-50A
   - Unit: A

4. **Voltage Sensor** - วัดแรงดันไฟ (Voltage Divider)
   - Sensor ID: `voltage_sensor`
   - Input Range: 0-4095 (ADC)
   - Output Range: 0-30V
   - Unit: V

5. **Force Sensor** - วัดแรงกระแทก (Load Cell/Force Sensor)
   - Sensor ID: `force_sensor`
   - Input Range: 0-4095 (ADC)
   - Output Range: 0-10000N
   - Unit: N

6. **Soil Sensor** - วัดความหนาแน่นดิน (Soil Moisture/Density Sensor)
   - Sensor ID: `soil_density_sensor`
   - Input Range: 0-4095 (ADC)
   - Output Range: 1400-2000 kg/m³
   - Unit: kg/m³

## ระบบ Sensor Input Handler

ระบบรองรับการเชื่อมต่อกับเซนเซอร์จริงผ่านหลายวิธี:

### 1. Sensor Input Handler พื้นฐาน
- รับข้อมูลเซนเซอร์ raw data
- ทำ calibration และ conversion
- ส่งข้อมูลไปยัง dashboard อัตโนมัติ

### 2. Serial Sensor Handler
- เชื่อมต่อผ่าน Serial Port (Arduino, ESP32)
- รับข้อมูลจาก hardware จริง
- รองรับ baud rate และ configuration ต่างๆ

### 3. Network Sensor Handler
- เชื่อมต่อผ่าน Network API
- รับข้อมูลจากเซนเซอร์ที่เชื่อมต่อกับ network
- รองรับ polling interval

## การตั้งค่า Sensor Calibration

สามารถตั้งค่า calibration สำหรับแต่ละเซนเซอร์:

```typescript
const calibrator = new SensorCalibrator();

calibrator.addConfig({
  sensorId: 'custom_sensor',
  sensorType: 'HEIGHT',
  minRaw: 0,
  maxRaw: 4095,
  minCalibrated: 0,
  maxCalibrated: 20,
  offset: 0,
  scale: 1,
  unit: 'm',
  sampleRate: 100
});
```

## การใช้งาน Sensor Input Handler

```typescript
import { SensorInputHandler } from '@/lib/sensorInputHandler';
import { HardwareClient } from '@/lib/hardwareClient';

const hardwareClient = new HardwareClient();
const sensorHandler = new SensorInputHandler(hardwareClient);

sensorHandler.start(100);

sensorHandler.addSensorReading('height_sensor', 2048);
sensorHandler.addSensorReading('velocity_sensor', 1024);
```

## ตัวอย่างโค้ด Hardware (Example Hardware Code)

ดูไฟล์:
- `hardware_examples/esp32_http.ino` - สำหรับ ESP32 ใช้ HTTP
- `hardware_examples/esp32_websocket.ino` - สำหรับ ESP32 ใช้ WebSocket
- `hardware_examples/arduino_serial.py` - สำหรับ Arduino ผ่าน Serial

## Hardware Simulator (จำลอง Hardware)

สำหรับทดสอบระบบโดยไม่ต้องมี hardware จริง สามารถใช้ Hardware Simulator ที่จำลองการทำงานของ hardware

### วิธีใช้งาน Hardware Simulator

1. **เริ่ม Backend Server**
```bash
npm run server
```

2. **เริ่ม Hardware Simulator**
```bash
node hardware-simulator.js
```

3. **เปิด Hardware Mode ใน Dashboard**
- คลิกปุ่ม "Simulation" เพื่อเปลี่ยนเป็น "Hardware"
- ดูข้อมูลจำลองปรากฏใน dashboard

### การทำงานของ Hardware Simulator

- จำลองการทำงานของ hardware จริง
- เปลี่ยนสถานะอัตโนมัติ: IDLE → CHARGING → DISCHARGING → IMPACT → IDLE
- ส่งข้อมูลไปยัง server ทุก 100ms
- คำนวณพลังงาน แบตเตอรี่ และการบดอัดดินตามฟิสิกส์

### หยุด Hardware Simulator

กด `Ctrl+C` เพื่อหยุดการทำงาน

## การทดสอบการเชื่อมต่อ (Testing Connection)

### ทดสอบด้วย PowerShell

```powershell
# ทดสอบส่งข้อมูล
$body = @{
    pendulumHeight = 10.5
    pendulumVelocity = 5.2
    pendulumMass = 500
    potentialEnergy = 50000
    kineticEnergy = 6760
    totalEnergy = 56760
    solarPower = 650
    motorPower = 750
    generatorPower = 800
    loadPower = 500
    batteryVoltage = 24
    batteryCapacity = 75
    batteryCurrent = 20
    soilDensity = 1700
    soilCompaction = 45
    impactCount = 10
    state = "CHARGING"
    time = 120.5
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/hardware/data" -Method Post -Body $body -ContentType "application/json"

# ทดสอบรับข้อมูล
Invoke-RestMethod -Uri "http://localhost:3001/api/hardware/data" -Method Get

# ทดสอบรีเซ็ตข้อมูล
Invoke-RestMethod -Uri "http://localhost:3001/api/hardware/reset" -Method Post

# ทดสอบสถานะ server
Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method Get
```

### ทดสอบด้วย Postman

1. เปิด Postman
2. สร้าง POST request ไปที่ `http://localhost:3001/api/hardware/data`
3. เพิ่ม header `Content-Type: application/json`
4. ใส่ body ตามรูปแบบ JSON ด้านบน
5. ส่ง request

## การแก้ไขปัญหา (Troubleshooting)

### Server ไม่เริ่มทำงาน
- ตรวจสอบว่า port 3001 ไม่ถูกใช้งาน
- ตรวจสอบว่าได้ติดตั้ง dependencies ทั้งหมด
- ดู log ใน terminal

### Dashboard ไม่เชื่อมต่อกับ Server
- ตรวจสอบว่า server กำลังทำงาน
- ตรวจสอบ firewall
- ตรวจสอบ URL ใน `hardwareClient.ts`

### Hardware ไม่ส่งข้อมูล
- ตรวจสอบการเชื่อมต่อ network
- ตรวจสอบ IP address ของ server
- ดู log ใน hardware device
- ทดสอบด้วย curl ก่อน

## ความปลอดภัย (Security)

ในสภาพแวดล้อมการผลิต (Production):
- เปิดใช้ HTTPS
- เพิ่ม authentication
- ใช้ API keys
- จำกัด rate limiting
- เปิดใช้ CORS เฉพาะ domain ที่อนุญาต

## การปรับแต่ง (Customization)

### เปลี่ยน Port

แก้ไขใน `server.js`:
```javascript
const PORT = process.env.PORT || 3001;
```

### เปลี่ยน WebSocket URL

แก้ไขใน `src/lib/hardwareClient.ts`:
```typescript
const serverUrl: string = 'ws://localhost:3001';
```

## ข้อจำกัด (Limitations)

- ต้องมีการเชื่อมต่อ network ระหว่าง hardware และ server
- ข้อมูลที่ส่งต้องตรงกับ format ที่กำหนด
- ความล่าช้าขึ้นอยู่กับความเร็ว network

## การติดต่อ (Support)

หากมีปัญหาในการเชื่อมต่อ hardware:
1. ตรวจสอบ log ทั้งใน server และ hardware
2. ทดสอบด้วย curl หรือ Postman
3. ติดต่อทีมพัฒนา
