export type Language = 'th' | 'en';

export interface Translations {

  title: string;
  subtitle: string;


  stateIdle: string;
  stateCharging: string;
  stateDischarging: string;
  stateImpact: string;


  start: string;
  pause: string;
  reset: string;
  controlPanel: string;
  configuration: string;


  solarInput: string;
  motorPower: string;
  generator: string;
  loadPower: string;
  batterySystem: string;
  capacity: string;
  voltage: string;
  current: string;
  charging: string;
  discharging: string;


  potentialEnergy: string;
  kineticEnergy: string;
  totalEnergy: string;
  soilDensity: string;
  totalImpacts: string;


  liveVisualization: string;
  height: string;
  state: string;
  soilCompaction: string;


  systemStatus: string;
  simulationTime: string;
  tamperVelocity: string;
  tamperMass: string;
  systemState: string;


  chartTotalEnergy: string;
  generatorPower: string;
  tamperHeight: string;


  simulationConfiguration: string;
  tamperSettings: string;
  powerSystem: string;
  batterySystemConfig: string;
  saveConfiguration: string;
  resetToDefault: string;
  tamperMassConfig: string;
  maxHeight: string;
  gravity: string;
  initialSoilDensity: string;
  solarPower: string;
  motorPowerConfig: string;
  motorEfficiency: string;
  generatorEfficiency: string;
  batteryVoltage: string;
  initialCapacity: string;


  dataExport: string;
  exportCSV: string;
  exportJSON: string;
  downloadReport: string;


  lowBattery: string;
  maxHeightReached: string;
  impactComplete: string;
  chargingComplete: string;
  dischargingComplete: string;


  demoScenarios: string;
  quickDemo: string;
  fullCycle: string;
  stressTest: string;
  custom: string;


  footer: string;
}

export const translations: Record<Language, Translations> = {
  th: {

    title: 'ระบบจำลอง ADC',
    subtitle: 'ระบบติดตามการบดอัดดินแบบไดนามิกเทียม',


    stateIdle: 'รอ',
    stateCharging: 'กำลังชาร์จ',
    stateDischarging: 'กำลังจ่ายไฟ',
    stateImpact: 'บดอัดดิน',


    start: 'เริ่ม',
    pause: 'หยุดชั่วคราว',
    reset: 'รีเซ็ต',
    controlPanel: 'แผงควบคุม',
    configuration: 'การตั้งค่า',


    solarInput: 'พลังงานแสงอาทิตย์',
    motorPower: 'พลังงานมอเตอร์',
    generator: 'เครื่องกำเนิดไฟ',
    loadPower: 'โหลด',
    batterySystem: 'ระบบแบตเตอรี่',
    capacity: 'ความจุ',
    voltage: 'แรงดัน',
    current: 'กระแส',
    charging: 'กำลังชาร์จ',
    discharging: 'กำลังจ่ายไฟ',

    potentialEnergy: 'พลังงานศักย์',
    kineticEnergy: 'พลังงานจลน์',
    totalEnergy: 'พลังงานรวม',
    soilDensity: 'ความหนาแน่นดิน',
    totalImpacts: 'จำนวนการบดอัด',

    liveVisualization: 'แสดงผลสด',
    height: 'ความสูง',
    state: 'สถานะ',
    soilCompaction: 'การบดอัดดิน',

    systemStatus: 'สถานะระบบ',
    simulationTime: 'เวลาจำลอง',
    tamperVelocity: 'ความเร็วลูกตุ้ม',
    tamperMass: 'มวลลูกตุ้ม',
    systemState: 'สถานะระบบ',

    chartTotalEnergy: 'พลังงานรวม',
    generatorPower: 'พลังงานเครื่องกำเนิดไฟ',
    tamperHeight: 'ความสูงลูกตุ้ม',

    simulationConfiguration: 'การตั้งค่าจำลอง',
    tamperSettings: 'การตั้งค่าลูกตุ้ม',
    powerSystem: 'ระบบพลังงาน',
    batterySystemConfig: 'ระบบแบตเตอรี่',
    saveConfiguration: 'บันทึกการตั้งค่า',
    resetToDefault: 'รีเซ็ตค่าเริ่มต้น',
    tamperMassConfig: 'มวลลูกตุ้ม (kg)',
    maxHeight: 'ความสูงสูงสุด (m)',
    gravity: 'แรงโน้มถ่วง (m/s²)',
    initialSoilDensity: 'ความหนาแน่นดินเริ่มต้น (kg/m³)',
    solarPower: 'พลังงานแสงอาทิตย์ (W)',
    motorPowerConfig: 'พลังงานมอเตอร์ (W)',
    motorEfficiency: 'ประสิทธิภาพมอเตอร์ (%)',
    generatorEfficiency: 'ประสิทธิภาพเครื่องกำเนิดไฟ (%)',
    batteryVoltage: 'แรงดันแบตเตอรี่ (V)',
    initialCapacity: 'ความจุเริ่มต้น (%)',

    dataExport: 'ส่งออกข้อมูล',
    exportCSV: 'ส่งออก CSV',
    exportJSON: 'ส่งออก JSON',
    downloadReport: 'ดาวน์โหลดรายงาน',

    lowBattery: 'แบตเตอรี่ต่ำ!',
    maxHeightReached: 'ถึงความสูงสูงสุด',
    impactComplete: 'การบดอัดดินเสร็จสิ้น',
    chargingComplete: 'การชาร์จเสร็จสิ้น',
    dischargingComplete: 'การจ่ายไฟเสร็จสิ้น',

    demoScenarios: 'สถานการณ์จำลอง',
    quickDemo: 'ทดลองเร็ว',
    fullCycle: 'วงจรเต็ม',
    stressTest: 'ทดสอบความเครียด',
    custom: 'กำหนดเอง',

    footer: 'ระบบจำลอง ADC v1.0 | ติดตามแบบเรียลไทม์ตามหลักฟิสิกส์'
  },

  en: {
    title: 'ADC Simulation Dashboard',
    subtitle: 'Artificial Dynamic Compaction Monitoring System',

    stateIdle: 'Idle',
    stateCharging: 'Charging',
    stateDischarging: 'Discharging',
    stateImpact: 'Impact/DC',

    start: 'Start',
    pause: 'Pause',
    reset: 'Reset',
    controlPanel: 'Control Panel',
    configuration: 'Configuration',

    solarInput: 'Solar Input',
    motorPower: 'Motor Power',
    generator: 'Generator',
    loadPower: 'Load Power',
    batterySystem: 'Battery System',
    capacity: 'Capacity',
    voltage: 'Voltage',
    current: 'Current',
    charging: 'Charging',
    discharging: 'Discharging',

    potentialEnergy: 'Potential Energy',
    kineticEnergy: 'Kinetic Energy',
    totalEnergy: 'Total Energy',
    soilDensity: 'Soil Density',
    totalImpacts: 'Total Impacts',

    liveVisualization: 'Live Visualization',
    height: 'Height',
    state: 'State',
    soilCompaction: 'Soil Compaction',

    systemStatus: 'System Status',
    simulationTime: 'Simulation Time',
    tamperVelocity: 'Tamper Velocity',
    tamperMass: 'Tamper Mass',
    systemState: 'System State',

    chartTotalEnergy: 'Total Energy',
    generatorPower: 'Generator Power',
    tamperHeight: 'Tamper Height',

    simulationConfiguration: 'Simulation Configuration',
    tamperSettings: 'Tamper Settings',
    powerSystem: 'Power System',
    batterySystemConfig: 'Battery System',
    saveConfiguration: 'Save Configuration',
    resetToDefault: 'Reset to Default',
    tamperMassConfig: 'Tamper Mass (kg)',
    maxHeight: 'Max Height (m)',
    gravity: 'Gravity (m/s²)',
    initialSoilDensity: 'Initial Soil Density (kg/m³)',
    solarPower: 'Solar Power (W)',
    motorPowerConfig: 'Motor Power (W)',
    motorEfficiency: 'Motor Efficiency (%)',
    generatorEfficiency: 'Generator Efficiency (%)',
    batteryVoltage: 'Battery Voltage (V)',
    initialCapacity: 'Initial Capacity (%)',

    dataExport: 'Data Export',
    exportCSV: 'Export CSV',
    exportJSON: 'Export JSON',
    downloadReport: 'Download Report',

    lowBattery: 'Low Battery!',
    maxHeightReached: 'Max Height Reached',
    impactComplete: 'Impact Complete',
    chargingComplete: 'Charging Complete',
    dischargingComplete: 'Discharging Complete',

    demoScenarios: 'Demo Scenarios',
    quickDemo: 'Quick Demo',
    fullCycle: 'Full Cycle',
    stressTest: 'Stress Test',
    custom: 'Custom',

    footer: 'ADC Simulation System v1.0 | Physics-based Real-time Monitoring'
  }
};

export function useTranslations(language: Language) {
  return translations[language];
}
