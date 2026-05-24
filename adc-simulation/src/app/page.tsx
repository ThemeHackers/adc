'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { SimulationEngine, SimulationData, SimulationState } from '@/lib/simulation-engine';
import { DataLogger, SimulationStatistics } from '@/lib/dataLogger';
import { SimulationConfig } from '@/components/ConfigurationPanel';
import ConfigurationPanel from '@/components/ConfigurationPanel';
import AlertSystem, { useAlertManager } from '@/components/AlertSystem';
import PitVisualization from '@/components/PitVisualization';
import PowerGauge from '@/components/PowerGauge';
import BatteryBar from '@/components/BatteryBar';
import EnergyMetrics from '@/components/EnergyMetrics';
import ControlPanel from '@/components/ControlPanel';
import RealTimeChart from '@/components/RealTimeChart';
import ReportGenerator from '@/components/ReportGenerator';
import HistoricalComparison from '@/components/HistoricalComparison';
import DetailedInfoPopup from '@/components/DetailedInfoPopup';
import { HardwareClient, HardwareData } from '@/lib/hardwareClient';
import { Download, History, Zap, Activity, Gauge, Droplet, Mountain, Clock, TrendingUp, Cpu, Server, Battery, Layers } from 'lucide-react';
import { calculateCylinderVolume, calculateCylinderRadius, calculateCylinderHeight, calculateCylinderBottomArea } from '@/lib/formulas';

type PopupItem = {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  color?: string;
};

type PopupData = Record<string, PopupItem>;

interface HistoricalRun {
  id: string;
  name: string;
  timestamp: number;
  statistics: SimulationStatistics;
}

export default function Home() {
  const [simulation] = useState(() => new SimulationEngine());
  const [dataLogger] = useState(() => new DataLogger());
  const { alerts, addAlert, dismissAlert, clearAllAlerts } = useAlertManager();
  
  const [data, setData] = useState<SimulationData>(simulation.getData());
  const [isRunning, setIsRunning] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [visualizationMode, setVisualizationMode] = useState<'2d' | '3d'>('3d');
  

  const [hardwareMode, setHardwareMode] = useState(false);
  const [hardwareClient] = useState(() => new HardwareClient());
  

  useEffect(() => {
    if (hardwareMode) {
      void hardwareClient.connect();
      
      hardwareClient.onData((hardwareData: HardwareData) => {
        setData(hardwareData as SimulationData);
        dataLogger.log(hardwareData);
      });
      
      hardwareClient.onStateChange((state: string) => {
        simulation.setState(state as SimulationState);
      });
      
      return () => {
        hardwareClient.disconnect();
      };
    } else {
      hardwareClient.disconnect();
    }
  }, [hardwareMode, hardwareClient, simulation, dataLogger]);
  const [config, setConfig] = useState<SimulationConfig>({
    pendulumMass: 500,
    maxHeight: 15,
    gravity: 9.81,
    motorPower: 650,
    solarPower: 750,
    batteryVoltage: 24,
    batteryCapacity: 50,
    motorEfficiency: 0.85,
    generatorEfficiency: 0.90,
    initialSoilDensity: 1600
  });
  const [historicalData, setHistoricalData] = useState<HistoricalRun[]>([]);
  const [showHistorical, setShowHistorical] = useState(false);
  

  const [popupOpen, setPopupOpen] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupData, setPopupData] = useState<PopupData>({});
  
  const [energyHistory, setEnergyHistory] = useState<Array<{ time: number; value: number }>>([]);
  const [powerHistory, setPowerHistory] = useState<Array<{ time: number; value: number }>>([]);
  const [heightHistory, setHeightHistory] = useState<Array<{ time: number; value: number }>>([]);
  
  const updateSimulation = useCallback(() => {
    simulation.update(50);
    const newData = simulation.getData();
    setData(newData);
    dataLogger.log(newData);
    
    const time = newData.time;
    setEnergyHistory(prev => [...prev.slice(-100), { time, value: newData.totalEnergy / 1000 }]);
    setPowerHistory(prev => [...prev.slice(-100), { time, value: newData.generatorPower }]);
    setHeightHistory(prev => [...prev.slice(-100), { time, value: newData.pendulumHeight }]);
    
    if (newData.batteryCapacity < 20 && newData.batteryCapacity > 19) {
      addAlert('Low Battery!', 'warning');
    }
    if (newData.pendulumHeight >= config.maxHeight * 0.99 && newData.pendulumHeight < config.maxHeight) {
      addAlert('Max Height Reached', 'info');
    }
  }, [simulation, dataLogger, config, addAlert]);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(updateSimulation, 50);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, updateSimulation]);
  
  const handleStateChange = (state: string) => {
    simulation.setState(state as SimulationState);
    setData(simulation.getData());
  };
  
  const handleReset = () => {
    simulation.reset();
    setData(simulation.getData());
    setEnergyHistory([]);
    setPowerHistory([]);
    setHeightHistory([]);
    dataLogger.clear();
    clearAllAlerts();
  };
  
  const handleToggleRunning = () => {
    setIsRunning(!isRunning);
    if (!isRunning) {
      addAlert('Simulation started', 'success');
    }
  };
  
  const handleConfigChange = (newConfig: SimulationConfig) => {
    setConfig(newConfig);
    addAlert('Configuration saved', 'success');
  };
  
  const handleExportCSV = () => {
    dataLogger.downloadCSV();
    addAlert('Data exported to CSV', 'success');
  };
  
  const handleExportJSON = () => {
    dataLogger.downloadJSON();
    addAlert('Data exported to JSON', 'success');
  };
  
  const handleSaveToHistory = () => {
    const stats = dataLogger.getStatistics();
    setHistoricalData(prev => [...prev, {
      id: Date.now().toString(),
      name: `Run ${prev.length + 1}`,
      timestamp: Date.now(),
      statistics: stats
    }]);
    addAlert('Simulation saved to history', 'success');
  };
  
  const handlePendulumClick = () => {
    setPopupTitle('Pendulum Details (Solid Cylinder)');
    const volume = calculateCylinderVolume(data.pendulumMass);
    const radius = calculateCylinderRadius(volume);
    const cylinderHeightVal = calculateCylinderHeight(radius);
    const bottomArea = calculateCylinderBottomArea(radius);

    setPopupData({
      mass: {
        label: 'Mass',
        value: data.pendulumMass,
        unit: 'kg',
        icon: <Mountain className="w-5 h-5" />,
        color: '#3b82f6'
      },
      shape: {
        label: 'Weight Shape',
        value: 'Solid Cylinder',
        icon: <Layers className="w-5 h-5" />,
        color: '#8b5cf6'
      },
      volume: {
        label: 'Cylinder Volume',
        value: volume,
        unit: 'm³',
        icon: <Zap className="w-5 h-5" />,
        color: '#10b981'
      },
      radius: {
        label: 'Cylinder Radius',
        value: radius,
        unit: 'm',
        icon: <TrendingUp className="w-5 h-5" />,
        color: '#f59e0b'
      },
      height: {
        label: 'Cylinder Height',
        value: cylinderHeightVal,
        unit: 'm',
        icon: <Mountain className="w-5 h-5" />,
        color: '#3b82f6'
      },
      bottomArea: {
        label: 'Impact Contact Area (Base)',
        value: bottomArea,
        unit: 'm²',
        icon: <Activity className="w-5 h-5" />,
        color: '#ef4444'
      },
      currentHeight: {
        label: 'Current Height',
        value: data.pendulumHeight,
        unit: 'm',
        icon: <TrendingUp className="w-5 h-5" />,
        color: '#22c55e'
      },
      velocity: {
        label: 'Velocity',
        value: data.pendulumVelocity,
        unit: 'm/s',
        icon: <Activity className="w-5 h-5" />,
        color: '#f59e0b'
      },
      totalEnergy: {
        label: 'Total Energy',
        value: data.totalEnergy / 1000,
        unit: 'kJ',
        icon: <Zap className="w-5 h-5" />,
        color: '#8b5cf6'
      }
    });
    setPopupOpen(true);
  };
  
  const handleSoilClick = () => {
    setPopupTitle('Soil Details');
    setPopupData({
      density: {
        label: 'Soil Density',
        value: data.soilDensity,
        unit: 'kg/m³',
        icon: <Droplet className="w-5 h-5" />,
        color: '#8b5cf6'
      },
      compaction: {
        label: 'Compaction',
        value: data.soilCompaction,
        unit: '%',
        icon: <Gauge className="w-5 h-5" />,
        color: '#f59e0b'
      },
      impactCount: {
        label: 'Total Impacts',
        value: data.impactCount,
        icon: <Activity className="w-5 h-5" />,
        color: '#ef4444'
      },
      batteryCapacity: {
        label: 'Battery Capacity',
        value: data.batteryCapacity,
        unit: '%',
        icon: <Battery className="w-5 h-5" />,
        color: '#22c55e'
      },
      batteryCurrent: {
        label: 'Battery Current',
        value: data.batteryCurrent,
        unit: 'A',
        icon: <Battery className="w-5 h-5" />,
        color: '#3b82f6'
      },
      initialDensity: {
        label: 'Initial Density',
        value: config.initialSoilDensity,
        unit: 'kg/m³',
        icon: <Droplet className="w-5 h-5" />,
        color: '#6b7280'
      },
      maxDensity: {
        label: 'Target Density',
        value: 2000,
        unit: 'kg/m³',
        icon: <Mountain className="w-5 h-5" />,
        color: '#22c55e'
      }
    });
    setPopupOpen(true);
  };
  
  const handleHeightClick = () => {
    setPopupTitle('Height Analysis');
    setPopupData({
      currentHeight: {
        label: 'Current Height',
        value: data.pendulumHeight,
        unit: 'm',
        icon: <TrendingUp className="w-5 h-5" />,
        color: '#3b82f6'
      },
      maxHeight: {
        label: 'Max Height',
        value: config.maxHeight,
        unit: 'm',
        icon: <Mountain className="w-5 h-5" />,
        color: '#22c55e'
      },
      heightPercentage: {
        label: 'Height Percentage',
        value: (data.pendulumHeight / config.maxHeight) * 100,
        unit: '%',
        icon: <Gauge className="w-5 h-5" />,
        color: '#f59e0b'
      },
      potentialEnergy: {
        label: 'Potential Energy',
        value: data.potentialEnergy / 1000,
        unit: 'kJ',
        icon: <Zap className="w-5 h-5" />,
        color: '#ef4444'
      },
      gravity: {
        label: 'Gravity',
        value: config.gravity,
        unit: 'm/s²',
        icon: <Activity className="w-5 h-5" />,
        color: '#8b5cf6'
      }
    });
    setPopupOpen(true);
  };
  
  const handleStateClick = () => {
    setPopupTitle('System State');
    setPopupData({
      currentState: {
        label: 'Current State',
        value: data.state,
        icon: <Activity className="w-5 h-5" />,
        color: data.state === 'CHARGING' ? '#22c55e' : data.state === 'DISCHARGING' ? '#3b82f6' : data.state === 'IMPACT' ? '#ef4444' : '#6b7280'
      },
      simulationTime: {
        label: 'Simulation Time',
        value: data.time,
        unit: 's',
        icon: <Clock className="w-5 h-5" />,
        color: '#3b82f6'
      },
      motorPower: {
        label: 'Motor Power',
        value: data.motorPower,
        unit: 'W',
        icon: <Zap className="w-5 h-5" />,
        color: '#f59e0b'
      },
      generatorPower: {
        label: 'Generator Power',
        value: data.generatorPower,
        unit: 'W',
        icon: <Zap className="w-5 h-5" />,
        color: '#22c55e'
      },
      loadPower: {
        label: 'Load Power',
        value: data.loadPower,
        unit: 'W',
        icon: <Activity className="w-5 h-5" />,
        color: '#ef4444'
      },
      solarPower: {
        label: 'Solar Power',
        value: data.solarPower,
        unit: 'W',
        icon: <Zap className="w-5 h-5" />,
        color: '#f59e0b'
      },
      batteryCapacity: {
        label: 'Battery Capacity',
        value: data.batteryCapacity,
        unit: '%',
        icon: <Battery className="w-5 h-5" />,
        color: '#22c55e'
      },
      totalEnergy: {
        label: 'Total Energy',
        value: data.totalEnergy / 1000,
        unit: 'kJ',
        icon: <Zap className="w-5 h-5" />,
        color: '#8b5cf6'
      }
    });
    setPopupOpen(true);
  };
  
  const handleCompactionClick = () => {
    setPopupTitle('Compaction Details');
    setPopupData({
      currentCompaction: {
        label: 'Current Compaction',
        value: data.soilCompaction,
        unit: '%',
        icon: <Gauge className="w-5 h-5" />,
        color: '#f59e0b'
      },
      targetCompaction: {
        label: 'Target Compaction',
        value: 95,
        unit: '%',
        icon: <Mountain className="w-5 h-5" />,
        color: '#22c55e'
      },
      impactCount: {
        label: 'Total Impacts',
        value: data.impactCount,
        icon: <Activity className="w-5 h-5" />,
        color: '#ef4444'
      },
      soilDensity: {
        label: 'Soil Density',
        value: data.soilDensity,
        unit: 'kg/m³',
        icon: <Droplet className="w-5 h-5" />,
        color: '#8b5cf6'
      },
      compactionRate: {
        label: 'Compaction Rate',
        value: data.impactCount > 0 ? (data.soilCompaction / data.impactCount).toFixed(3) : 0,
        unit: '%/impact',
        icon: <TrendingUp className="w-5 h-5" />,
        color: '#3b82f6'
      }
    });
    setPopupOpen(true);
  };

  const hardwareConnected = hardwareMode && hardwareClient.getConnectionStatus();

  const statistics = dataLogger.getStatistics();
  
  return (
    <div className="min-h-screen bg-[#070b19] bg-[radial-gradient(ellipse_at_top,rgba(30,58,138,0.2),transparent_50%),radial-gradient(circle_at_bottom,rgba(88,28,135,0.15),transparent_60%)] p-4 sm:p-6 text-slate-100 relative">
      {/* Alert System */}
      <AlertSystem alerts={alerts} onDismiss={dismissAlert} />
      
      {/* Configuration Panel */}
      <ConfigurationPanel
        config={config}
        onConfigChange={handleConfigChange}
        onReset={() => {
          setConfig({
            pendulumMass: 500,
            maxHeight: 15,
            gravity: 9.81,
            motorPower: 650,
            solarPower: 750,
            batteryVoltage: 24,
            batteryCapacity: 50,
            motorEfficiency: 0.85,
            generatorEfficiency: 0.90,
            initialSoilDensity: 1600
          });
          addAlert('Configuration reset to default', 'info');
        }}
        isOpen={configOpen}
        onToggle={() => setConfigOpen(!configOpen)}
      />
      
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between relative z-10">
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-1.5 bg-gradient-to-r from-blue-400 via-indigo-200 to-purple-400 bg-clip-text text-transparent leading-tight tracking-wider uppercase">
            ADC Command Center
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm font-semibold tracking-wide uppercase">
            Artificial Dynamic Compaction Telemetry Console
          </p>
        </div>
        
        {/* Header Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Hardware Mode Toggle */}
          <button
            onClick={() => {
              setHardwareMode(!hardwareMode);
              addAlert(hardwareMode ? 'Switched to Simulation Mode' : 'Switched to Hardware Mode', 'info');
            }}
            className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl border transition-all duration-300 hover:-translate-y-0.5 cursor-pointer font-bold text-xs uppercase tracking-wider ${
              hardwareMode 
                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10' 
                : 'bg-gradient-to-r from-slate-800/80 to-slate-900/80 hover:from-slate-700/80 hover:to-slate-850/80 text-slate-300 border-slate-700/60 shadow-slate-900/20'
            }`}
            type="button"
          >
            {hardwareMode ? <Server className="w-4 h-4" /> : <Cpu className="w-4 h-4" />}
            {hardwareMode ? 'Hardware' : 'Simulation'}
          </button>
          
          {/* Connection Status Indicator */}
          {hardwareMode && (
            <div className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border ${
              hardwareConnected 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                hardwareConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`} style={{ boxShadow: hardwareConnected ? '0 0 6px #10b981' : 'none' }} />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {hardwareConnected ? 'Connected' : 'Offline'}
              </span>
            </div>
          )}
          
          {/* Export Buttons */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-slate-900/80 border border-slate-850 hover:border-slate-700 hover:bg-slate-800 text-slate-300 px-4 py-2.5 rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer font-bold text-xs uppercase tracking-wider"
            type="button"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 bg-slate-900/80 border border-slate-850 hover:border-slate-700 hover:bg-slate-800 text-slate-300 px-4 py-2.5 rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer font-bold text-xs uppercase tracking-wider"
            type="button"
          >
            <Download className="w-4 h-4" />
            JSON
          </button>
          
          <button
            onClick={() => setShowHistorical(!showHistorical)}
            className="flex items-center gap-2 bg-slate-900/80 border border-slate-850 hover:border-slate-700 hover:bg-slate-800 text-slate-300 px-4 py-2.5 rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer font-bold text-xs uppercase tracking-wider"
            type="button"
          >
            <History className="w-4 h-4" />
            {showHistorical ? 'Hide History' : 'History'}
          </button>
        </div>
      </div>
      
      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-12 gap-5 relative z-10">
        {/* Left Column - Visualization */}
        <div className="col-span-12 lg:col-span-6 space-y-4 min-w-0">
          <div className="cyber-glass rounded-2xl p-5 shadow-2xl">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-200 tracking-wide uppercase">Live Visualization</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Switch study perspectives</p>
              </div>
              <div className="inline-flex w-full sm:w-auto justify-between rounded-xl bg-slate-950/60 p-1 border border-slate-800/85 shadow-inner">
                {(['2d', '3d'] as const).map((mode) => {
                  const active = visualizationMode === mode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setVisualizationMode(mode)}
                      className={`flex-1 sm:flex-none min-w-[72px] rounded-lg py-1.5 px-3 text-xs font-bold transition-all cursor-pointer ${
                        active
                          ? 'bg-slate-800 text-white shadow-lg border border-slate-700/50'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {mode.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="h-auto">
              <PitVisualization
                height={data.pendulumHeight}
                state={data.state}
                soilCompaction={data.soilCompaction}
                soilDensity={data.soilDensity}
                impactCount={data.impactCount}
                pendulumVelocity={data.pendulumVelocity}
                solarPower={data.solarPower}
                motorPower={data.motorPower}
                generatorPower={data.generatorPower}
                loadPower={data.loadPower}
                batteryCapacity={data.batteryCapacity}
                batteryVoltage={data.batteryVoltage}
                batteryCurrent={data.batteryCurrent}
                potentialEnergy={data.potentialEnergy}
                kineticEnergy={data.kineticEnergy}
                totalEnergy={data.totalEnergy}
                viewMode={visualizationMode}
                pendulumMass={data.pendulumMass}
                onPendulumClick={handlePendulumClick}
                onSoilClick={handleSoilClick}
                onHeightClick={handleHeightClick}
                onStateClick={handleStateClick}
                onCompactionClick={handleCompactionClick}
              />
            </div>
          </div>
          
          {/* Control Panel */}
          <ControlPanel
            currentState={data.state}
            onStateChange={handleStateChange}
            onReset={handleReset}
            isRunning={isRunning}
            onToggleRunning={handleToggleRunning}
          />
          
          {/* Report Generator */}
          <ReportGenerator
            statistics={statistics}
            config={config}
            onGenerateReport={() => addAlert('Report generated', 'success')}
          />
        </div>
        
        {/* Right Column - Metrics and Gauges */}
        <div className="col-span-12 lg:col-span-6 space-y-4 min-w-0">
          {/* Historical Comparison (when shown) */}
          {showHistorical && (
            <div className="col-span-12">
              <HistoricalComparison
                historicalData={historicalData}
                currentData={statistics}
              />
            </div>
          )}
          
          {/* Power Gauges Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <PowerGauge
              title="Solar Input"
              value={data.solarPower}
              max={config.solarPower}
              unit="W"
              icon="sun"
              color="#10b981"
            />
            <PowerGauge
              title="Motor Power"
              value={data.motorPower}
              max={config.motorPower}
              unit="W"
              icon="cpu"
              color="#3b82f6"
            />
            <PowerGauge
              title="Generator"
              value={data.generatorPower}
              max={1000}
              unit="W"
              icon="zap"
              color="#f59e0b"
            />
            <PowerGauge
              title="Load Power"
              value={data.loadPower}
              max={800}
              unit="W"
              icon="battery"
              color="#f43f5e"
            />
          </div>
          
          {/* Battery and Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BatteryBar
              capacity={data.batteryCapacity}
              voltage={data.batteryVoltage}
              current={data.batteryCurrent}
            />
            <EnergyMetrics
              potentialEnergy={data.potentialEnergy}
              kineticEnergy={data.kineticEnergy}
              totalEnergy={data.totalEnergy}
              soilDensity={data.soilDensity}
              impactCount={data.impactCount}
              estimatedEnergyValueTHB={statistics.estimatedEnergyValueTHB}
              estimatedConsumptionCostTHB={statistics.estimatedConsumptionCostTHB}
              estimatedNetValueTHB={statistics.estimatedNetValueTHB}
              electricityRateTHBPerKWh={statistics.electricityRateTHBPerKWh}
            />
          </div>
          
          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <RealTimeChart
              data={energyHistory}
              title="Total Energy"
              color="#8b5cf6"
              unit="kJ"
              maxDataPoints={50}
              type="area"
            />
            <RealTimeChart
              data={powerHistory}
              title="Generator Power"
              color="#f59e0b"
              unit="W"
              maxDataPoints={50}
              type="area"
            />
            <RealTimeChart
              data={heightHistory}
              title="Pendulum Height"
              color="#3b82f6"
              unit="m"
              maxDataPoints={50}
              type="area"
            />
          </div>
          
          {/* System Status */}
          <div className="cyber-glass rounded-2xl p-5 shadow-2xl">
            <h3 className="font-bold text-slate-200 mb-3 text-xs tracking-wider uppercase">System Telemetry Log</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <div>
                <div className="text-slate-500 font-bold">Simulation Time</div>
                <div className="text-lg font-black text-slate-200 mt-1" style={{ fontFamily: 'var(--font-mono), monospace' }}>{data.time.toFixed(1)}s</div>
              </div>
              <div>
                <div className="text-slate-500 font-bold">Velocity</div>
                <div className="text-lg font-black text-slate-200 mt-1" style={{ fontFamily: 'var(--font-mono), monospace' }}>{data.pendulumVelocity.toFixed(2)} m/s</div>
              </div>
              <div>
                <div className="text-slate-500 font-bold">Mass</div>
                <div className="text-lg font-black text-slate-200 mt-1" style={{ fontFamily: 'var(--font-mono), monospace' }}>{data.pendulumMass} kg</div>
              </div>
              <div>
                <div className="text-slate-500 font-bold">Status</div>
                <div className="text-lg font-black text-blue-400 mt-1">{data.state}</div>
              </div>
            </div>
          </div>

          {/* Save to History Button */}
          <button
            onClick={handleSaveToHistory}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-500/10 cursor-pointer border border-purple-500/20 transition-all duration-300 hover:-translate-y-0.5"
          >
            <History className="w-5 h-5" />
            Save Current Run to History
          </button>
        </div>
      </div>
      
      {/* Detailed Info Popup */}
      <DetailedInfoPopup
        isOpen={popupOpen}
        onClose={() => setPopupOpen(false)}
        title={popupTitle}
        data={popupData}
      />
    </div>
  );
}
