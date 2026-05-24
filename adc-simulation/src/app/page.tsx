'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { SimulationEngine, SimulationData } from '@/lib/simulation-engine';
import { DataLogger } from '@/lib/dataLogger';
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
import { Download, History, Zap, Activity, Gauge, Droplet, Mountain, Clock, TrendingUp, Cpu, Server } from 'lucide-react';

export default function Home() {
  const [simulation] = useState(() => new SimulationEngine());
  const [dataLogger] = useState(() => new DataLogger());
  const { alerts, addAlert, dismissAlert, clearAllAlerts } = useAlertManager();
  
  const [data, setData] = useState<SimulationData>(simulation.getData());
  const [isRunning, setIsRunning] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [visualizationMode, setVisualizationMode] = useState<'2d' | '3d'>('3d');
  

  const [hardwareMode, setHardwareMode] = useState(false);
  const [hardwareConnected, setHardwareConnected] = useState(false);
  const [hardwareClient] = useState(() => new HardwareClient('ws://127.0.0.1:3002'));
  
  useEffect(() => {
    setConfigOpen(false);
  }, []);
  

  useEffect(() => {
    if (hardwareMode) {
      void hardwareClient.connect();
      
      hardwareClient.onData((hardwareData: HardwareData) => {
        setData(hardwareData as SimulationData);
        dataLogger.log(hardwareData);
        setHardwareConnected(true);
      });
      
      hardwareClient.onStateChange((state: string) => {
        simulation.setState(state as any);
      });
      
      return () => {
        hardwareClient.disconnect();
        setHardwareConnected(false);
      };
    } else {
      hardwareClient.disconnect();
      setHardwareConnected(false);
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
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [showHistorical, setShowHistorical] = useState(false);
  

  const [popupOpen, setPopupOpen] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupData, setPopupData] = useState<Record<string, any>>({});
  
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
    simulation.setState(state as any);
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
    setPopupTitle('Pendulum Details');
    setPopupData({
      mass: {
        label: 'Mass',
        value: data.pendulumMass,
        unit: 'kg',
        icon: <Mountain className="w-5 h-5" />,
        color: '#3b82f6'
      },
      height: {
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
      potentialEnergy: {
        label: 'Potential Energy',
        value: data.potentialEnergy / 1000,
        unit: 'kJ',
        icon: <Zap className="w-5 h-5" />,
        color: '#ef4444'
      },
      kineticEnergy: {
        label: 'Kinetic Energy',
        value: data.kineticEnergy / 1000,
        unit: 'kJ',
        icon: <Zap className="w-5 h-5" />,
        color: '#8b5cf6'
      },
      maxHeight: {
        label: 'Max Height',
        value: config.maxHeight,
        unit: 'm',
        icon: <Mountain className="w-5 h-5" />,
        color: '#6b7280'
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
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-6 relative">
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
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between relative z-10">
        <div className="max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent leading-tight">
            ADC Simulation Dashboard
          </h1>
          <p className="text-slate-300 text-base sm:text-lg">
            Artificial Dynamic Compaction Monitoring System
          </p>
        </div>
        
        {/* Header Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Hardware Mode Toggle */}
          <button
            onClick={() => {
              setHardwareMode(!hardwareMode);
              addAlert(hardwareMode ? 'Switched to Simulation Mode' : 'Switched to Hardware Mode', 'info');
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-0.5 ${
              hardwareMode 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white' 
                : 'bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700 text-white'
            }`}
            type="button"
          >
            {hardwareMode ? <Server className="w-5 h-5" /> : <Cpu className="w-5 h-5" />}
            {hardwareMode ? 'Hardware' : 'Simulation'}
          </button>
          
          {/* Connection Status Indicator */}
          {hardwareMode && (
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${
              hardwareConnected 
                ? 'bg-green-100 text-green-700 border border-green-300' 
                : 'bg-red-100 text-red-700 border border-red-300'
            }`}>
              <div className={`w-3 h-3 rounded-full ${
                hardwareConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`} />
              <span className="text-sm font-medium">
                {hardwareConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          )}
          
          {/* Export Buttons */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            type="button"
          >
            <Download className="w-5 h-5" />
            CSV
          </button>
          
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            type="button"
          >
            <Download className="w-5 h-5" />
            JSON
          </button>
          
          <button
            onClick={() => setShowHistorical(!showHistorical)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            type="button"
          >
            <History className="w-5 h-5" />
            {showHistorical ? 'Hide' : 'History'}
          </button>
        </div>
      </div>
      
      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-12 gap-4 relative z-10">
        {/* Left Column - Visualization */}
        <div className="col-span-12 lg:col-span-5 space-y-4 min-w-0">
          <div className="bg-white rounded-xl p-4 shadow-2xl border border-slate-200">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Live Visualization</h2>
                <p className="text-sm text-slate-500">Switch between a clean 2D study view and a richer 3D presentation view.</p>
              </div>
              <div className="inline-flex w-full sm:w-auto justify-between rounded-full bg-slate-100 p-1 shadow-inner">
                {(['2d', '3d'] as const).map((mode) => {
                  const active = visualizationMode === mode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setVisualizationMode(mode)}
                      className={`flex-1 sm:flex-none min-w-[88px] rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                        active
                          ? 'bg-slate-900 text-white shadow-lg'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {mode.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="h-[640px] lg:h-[700px] overflow-hidden">
              <PitVisualization
                height={data.pendulumHeight}
                state={data.state}
                soilCompaction={data.soilCompaction}
                viewMode={visualizationMode}
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
            statistics={dataLogger.getStatistics()}
            config={config}
            onGenerateReport={() => addAlert('Report generated', 'success')}
          />
        </div>
        
        {/* Right Column - Metrics and Gauges */}
        <div className="col-span-12 lg:col-span-7 space-y-4 min-w-0">
          {/* Historical Comparison (when shown) */}
          {showHistorical && (
            <div className="col-span-12">
              <HistoricalComparison
                historicalData={historicalData}
                currentData={dataLogger.getStatistics()}
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
              color="#22c55e"
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
              color="#ef4444"
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
          <div className="bg-white rounded-xl p-4 shadow-lg border border-slate-200">
            <h3 className="font-semibold text-gray-700 mb-3">System Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Simulation Time</div>
                <div className="text-lg font-bold text-gray-900">{data.time.toFixed(1)}s</div>
              </div>
              <div>
                <div className="text-gray-500">Pendulum Velocity</div>
                <div className="text-lg font-bold text-gray-900">{data.pendulumVelocity.toFixed(2)} m/s</div>
              </div>
              <div>
                <div className="text-gray-500">Pendulum Mass</div>
                <div className="text-lg font-bold text-gray-900">{data.pendulumMass} kg</div>
              </div>
              <div>
                <div className="text-gray-500">System State</div>
                <div className="text-lg font-bold text-blue-600">{data.state}</div>
              </div>
            </div>
          </div>

          {/* Save to History Button */}
          <button
            onClick={handleSaveToHistory}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-all"
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
