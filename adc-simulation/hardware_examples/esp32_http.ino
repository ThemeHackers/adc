#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>

// WiFi Credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Server Configuration
const char* serverUrl = "http://192.168.1.100:3001/api/hardware/data";
const int updateInterval = 100; // ms (10 Hz)

// Sensor Pins (ปรับตาม hardware จริง)
const int heightSensorPin = 34;    // Analog pin for height sensor
const int velocitySensorPin = 35;  // Analog pin for velocity sensor
const int currentSensorPin = 36;   // Analog pin for current sensor
const int voltageSensorPin = 39;   // Analog pin for voltage sensor
const int forceSensorPin = 32;     // Analog pin for force sensor

// System Variables
float pendulumHeight = 0;
float pendulumVelocity = 0;
float pendulumMass = 500; // kg
float potentialEnergy = 0;
float kineticEnergy = 0;
float totalEnergy = 0;
float solarPower = 650;
float motorPower = 0;
float generatorPower = 0;
float loadPower = 0;
float batteryVoltage = 24;
float batteryCapacity = 50;
float batteryCurrent = 0;
float soilDensity = 1600;
float soilCompaction = 0;
int impactCount = 0;
String systemState = "IDLE";
float simulationTime = 0;

unsigned long lastUpdateTime = 0;
unsigned long startTime = 0;

void setup() {
  Serial.begin(115200);
  
  // Initialize sensor pins
  pinMode(heightSensorPin, INPUT);
  pinMode(velocitySensorPin, INPUT);
  pinMode(currentSensorPin, INPUT);
  pinMode(voltageSensorPin, INPUT);
  pinMode(forceSensorPin, INPUT);
  
  // Connect to WiFi
  connectWiFi();
  
  startTime = millis();
  Serial.println("ADC Hardware System Started");
}

void loop() {
  unsigned long currentTime = millis();
  
  // Read sensors
  readSensors();
  
  // Calculate energies
  calculateEnergies();
  
  // Update simulation time
  simulationTime = (currentTime - startTime) / 1000.0;
  
  // Send data to server at specified interval
  if (currentTime - lastUpdateTime >= updateInterval) {
    sendDataToServer();
    lastUpdateTime = currentTime;
  }
  
  // Small delay
  delay(10);
}

void connectWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println();
  Serial.println("WiFi connected");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

void readSensors() {
  // Read height sensor (Ultrasonic/Laser/Encoder)
  int heightRaw = analogRead(heightSensorPin);
  pendulumHeight = map(heightRaw, 0, 4095, 0, 150) / 10.0; // Convert to meters (0-15m)
  
  // Read velocity sensor (Encoder/Accelerometer)
  int velocityRaw = analogRead(velocitySensorPin);
  pendulumVelocity = map(velocityRaw, 0, 4095, -200, 200) / 10.0; // Convert to m/s
  
  // Read current sensor (ACS712)
  int currentRaw = analogRead(currentSensorPin);
  batteryCurrent = map(currentRaw, 0, 4095, 0, 500) / 10.0; // Convert to Amps
  
  // Read voltage sensor (Voltage Divider)
  int voltageRaw = analogRead(voltageSensorPin);
  batteryVoltage = map(voltageRaw, 0, 4095, 0, 300) / 10.0; // Convert to Volts
  
  // Read force sensor (Load Cell)
  int forceRaw = analogRead(forceSensorPin);
  float force = map(forceRaw, 0, 4095, 0, 10000) / 100.0; // Convert to Newtons
  
  // Detect impact (force threshold)
  if (force > 500) { // 500N threshold
    impactCount++;
    soilCompaction += 0.5; // Increment compaction
    if (soilCompaction > 100) soilCompaction = 100;
  }
  
  // Calculate motor and generator power based on state
  if (systemState == "CHARGING") {
    motorPower = 750;
    generatorPower = 0;
  } else if (systemState == "DISCHARGING") {
    motorPower = 0;
    generatorPower = 800;
  } else if (systemState == "IMPACT") {
    motorPower = 0;
    generatorPower = 0;
  } else {
    motorPower = 0;
    generatorPower = 0;
  }
  
  // Calculate load power
  loadPower = generatorPower * 0.8;
  
  // Update battery capacity based on power
  float netPower = solarPower + generatorPower - motorPower - loadPower;
  batteryCapacity += (netPower / 1000.0) * (updateInterval / 1000.0) * 10; // Simplified
  if (batteryCapacity > 100) batteryCapacity = 100;
  if (batteryCapacity < 0) batteryCapacity = 0;
  
  // Update soil density based on compaction
  soilDensity = 1600 + (soilCompaction / 100.0) * 400; // 1600-2000 kg/m³
}

void calculateEnergies() {
  const float gravity = 9.81;
  
  // Potential Energy: Ep = m * g * h
  potentialEnergy = pendulumMass * gravity * pendulumHeight;
  
  // Kinetic Energy: Ek = 0.5 * m * v²
  kineticEnergy = 0.5 * pendulumMass * pendulumVelocity * pendulumVelocity;
  
  // Total Energy
  totalEnergy = potentialEnergy + kineticEnergy;
  
  // Determine system state based on height and velocity
  if (pendulumVelocity > 0 && pendulumHeight < 14) {
    systemState = "CHARGING";
  } else if (pendulumVelocity < 0 && pendulumHeight > 1) {
    systemState = "DISCHARGING";
  } else if (pendulumHeight <= 1 && pendulumVelocity < 0) {
    systemState = "IMPACT";
  } else {
    systemState = "IDLE";
  }
}

void sendDataToServer() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected, reconnecting...");
    connectWiFi();
    return;
  }
  
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  
  // Create JSON document
  StaticJsonDocument<512> doc;
  
  doc["pendulumHeight"] = pendulumHeight;
  doc["pendulumVelocity"] = pendulumVelocity;
  doc["pendulumMass"] = pendulumMass;
  doc["potentialEnergy"] = potentialEnergy;
  doc["kineticEnergy"] = kineticEnergy;
  doc["totalEnergy"] = totalEnergy;
  doc["solarPower"] = solarPower;
  doc["motorPower"] = motorPower;
  doc["generatorPower"] = generatorPower;
  doc["loadPower"] = loadPower;
  doc["batteryVoltage"] = batteryVoltage;
  doc["batteryCapacity"] = batteryCapacity;
  doc["batteryCurrent"] = batteryCurrent;
  doc["soilDensity"] = soilDensity;
  doc["soilCompaction"] = soilCompaction;
  doc["impactCount"] = impactCount;
  doc["state"] = systemState;
  doc["time"] = simulationTime;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  // Send POST request
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    
    String response = http.getString();
    Serial.println("Response: " + response);
  } else {
    Serial.print("Error on sending POST: ");
    Serial.println(httpResponseCode);
  }
  
  http.end();
}
