# ADC Hardware System

ระบบวัดค่าจริงจากเซนเซอร์และส่งข้อมูลไปยัง ADC Simulation Dashboard

## ฟีเจอร์

- ✅ รองรับเซนเซอร์จริง 6 ประเภท (Height, Velocity, Current, Voltage, Force, Soil Density)
- ✅ ระบบ Calibration และ Conversion ข้อมูล
- ✅ ส่งข้อมูลไปยัง Dashboard ผ่าน HTTP API
- ✅ รองรับ Serial Port connection (Arduino, ESP32)
- ✅ โหมด Simulation สำหรับทดสอบ
- ✅ Auto-reconnect เมื่อเชื่อมต่อไม่ได้

## การติดตั้ง

```bash
cd hardware-system
npm install
```

## การตั้งค่า

แก้ไขไฟล์ `config.js`:

```javascript
module.exports = {
  dashboardUrl: 'http://localhost:3001',  // URL ของ Dashboard
  updateInterval: 100,  // ช่วงเวลาอัปเดต (ms)
  
  sensors: {
    height: {
      enabled: true,
      pin: 'A0',
      minRaw: 0,
      maxRaw: 4095,
      minCalibrated: 0,
      maxCalibrated: 15,
      unit: 'm'
    },
    // ... เซนเซอร์อื่นๆ
  },
  
  serial: {
    enabled: false,  // เปิดใช้ Serial Port
    port: 'COM3',
    baudRate: 9600
  },
  
  simulation: {
    enabled: true  // เปิดใช้โหมดจำลอง
  }
};
```

## การใช้งาน

### เริ่มระบบ

```bash
npm start
```

### หยุดระบบ

กด `Ctrl+C`

## เซนเซอร์ที่รองรับ

1. **Height Sensor** - วัดความสูงลูกตุ้ม (0-15m)
2. **Velocity Sensor** - วัดความเร็ว (-20 to 20 m/s)
3. **Current Sensor** - วัดกระแสไฟ (0-50A)
4. **Voltage Sensor** - วัดแรงดันไฟ (0-30V)
5. **Force Sensor** - วัดแรงกระแทก (0-10000N)
6. **Soil Density Sensor** - วัดความหนาแน่นดิน (1400-2000 kg/m³)

## โหมดการทำงาน

### 1. Simulation Mode (โหมดจำลอง)
ใช้ข้อมูลจำลองสำหรับทดสอบระบบ

```javascript
simulation: {
  enabled: true
}
```

### 2. Real Sensor Mode (โหมดเซนเซอร์จริง)
ใช้ข้อมูลจากเซนเซอร์จริงผ่าน Serial Port

```javascript
serial: {
  enabled: true,
  port: 'COM3',
  baudRate: 9600
}
```

## การเชื่อมต่อกับ Hardware

### Arduino/ESP32

ตัวอย่างโค้ด Arduino:

```cpp
#include <ArduinoJson.h>

void setup() {
  Serial.begin(9600);
}

void loop() {
  StaticJsonDocument<200> doc;
  
  doc["height_sensor"] = analogRead(A0);
  doc["velocity_sensor"] = analogRead(A1);
  doc["current_sensor"] = analogRead(A2);
  doc["voltage_sensor"] = analogRead(A3);
  doc["force_sensor"] = analogRead(A4);
  doc["soil_density_sensor"] = analogRead(A5);
  
  serializeJson(doc, Serial);
  Serial.println();
  
  delay(100);
}
```

## API Endpoints

ระบบจะส่งข้อมูลไปยัง Dashboard ผ่าน:

- POST `/api/hardware/data` - ส่งข้อมูลเซนเซอร์
- POST `/api/hardware/state` - อัปเดตสถานะ
- POST `/api/hardware/reset` - รีเซ็ตข้อมูล
- GET `/api/health` - ตรวจสอบสถานะ

## การแก้ปัญหา

### ไม่สามารถเชื่อมต่อกับ Dashboard

1. ตรวจสอบว่า Dashboard server ทำงานอยู่
2. ตรวจสอบ URL ใน config.js
3. ตรวจสอบ firewall

### Serial Port ไม่ทำงาน

1. ตรวจสอบว่ามีการติดตั้ง serialport: `npm install serialport`
2. ตรวจสอบ port ที่ถูกต้องใน config.js
3. ตรวจสอบว่าไม่มีโปรแกรมอื่นใช้ port เดียวกัน

## โครงสร้างไฟล์

```
hardware-system/
├── index.js              - ไฟล์หลัก
├── config.js             - การตั้งค่า
├── sensorManager.js      - จัดการเซนเซอร์
├── dataTransmitter.js    - ส่งข้อมูลไป Dashboard
├── realSensorInterface.js - Interface เซนเซอร์จริง
├── package.json          - Dependencies
└── README.md             - เอกสารนี้
```

## License

MIT
