'use client';

import React, { useState, useEffect } from 'react';
import { SimulationEngine, SimulationData, SimulationState } from '@/lib/simulation-engine';
import { SimulationStatistics } from '@/lib/dataLogger';
import { DEFAULT_SIMULATION_CONFIG, SimulationConfig } from '@/lib/simulationConfig';
import { scenarios, Scenario } from '@/lib/scenarios';
import ConfigurationPanel from '@/components/ConfigurationPanel';
import AlertSystem, { useAlertManager } from '@/components/AlertSystem';
import ControlPanel from '@/components/ControlPanel';
import CraneVisualization from '@/components/CraneVisualization';
import Link from 'next/link';
import { Download, History, Activity } from 'lucide-react';
import {
  sharedSimulation,
  sharedDataLogger,
  sharedScenarioRunner,
  subscribeToSimulation,
  subscribeToScenarioStateChange,
  subscribeToScenarioComplete,
  getSharedIsRunning,
  setSharedIsRunning,
  getSharedActiveScenarioId,
  setSharedActiveScenarioId,
  startSharedScenario,
  resetSharedSimulation
} from '@/lib/sharedState';

interface HistoricalRun {
  id: string;
  name: string;
  timestamp: number;
  statistics: SimulationStatistics;
}

export default function SimulatorPage() {
  const { alerts, addAlert, dismissAlert, clearAllAlerts } = useAlertManager();

  const [data, setData] = useState<SimulationData>(sharedSimulation.getData());
  const [isRunning, setIsRunning] = useState(getSharedIsRunning());
  const [configOpen, setConfigOpen] = useState(false);

  const [config, setConfig] = useState<SimulationConfig>(DEFAULT_SIMULATION_CONFIG);
  const [isConfigSaving, setIsConfigSaving] = useState(false);
  const [configSaveState, setConfigSaveState] = useState<'idle' | 'saved' | 'error'>('idle');
  const [historicalData, setHistoricalData] = useState<HistoricalRun[]>([]);
  const [showHistorical, setShowHistorical] = useState(false);

  const [activeScenarioId, setActiveScenarioId] = useState<string>(getSharedActiveScenarioId());


  useEffect(() => {

    setIsRunning(getSharedIsRunning());
    setActiveScenarioId(getSharedActiveScenarioId());

    const unsubscribeSim = subscribeToSimulation((newData) => {
      setData(newData);


      if (newData.batteryCapacity < 20 && newData.batteryCapacity > 19) {
        addAlert('Low Battery!', 'warning');
      }
      if ((newData.batteryTemp ?? 25.0) > 45 && (newData.batteryTemp ?? 25.0) < 45.5) {
        addAlert('Battery Overheating! High temperature warning.', 'error');
      }
      if (newData.tamperHeight >= config.maxHeight * 0.99 && newData.tamperHeight < config.maxHeight) {
        addAlert('Max Height Reached', 'info');
      }
    });

    const unsubscribeStateChange = subscribeToScenarioStateChange((state) => {
      addAlert(`Workflow state transitioned to: ${state}`, 'info');
    });

    const unsubscribeComplete = subscribeToScenarioComplete(() => {
      addAlert('Demo workflow cycle completed', 'success');
      setIsRunning(false);
      setActiveScenarioId('custom');
    });

    return () => {
      unsubscribeSim();
      unsubscribeStateChange();
      unsubscribeComplete();
    };
  }, [config, addAlert]);


  useEffect(() => {
    const checkState = setInterval(() => {
      setIsRunning(getSharedIsRunning());
      setActiveScenarioId(getSharedActiveScenarioId());
    }, 100);
    return () => clearInterval(checkState);
  }, []);


  useEffect(() => {
    let isMounted = true;

    const loadSavedConfiguration = async () => {
      try {
        const response = await fetch('/api/config', { cache: 'no-store' });

        if (!response.ok) {
          throw new Error('Failed to fetch configuration');
        }

        const payload = await response.json() as { config?: SimulationConfig };
        const loadedConfig = payload.config ?? DEFAULT_SIMULATION_CONFIG;

        if (!isMounted) return;

        sharedSimulation.applyConfiguration(loadedConfig);
        setConfig(loadedConfig);
        setData(sharedSimulation.getData());
      } catch {
        if (!isMounted) return;

        sharedSimulation.applyConfiguration(DEFAULT_SIMULATION_CONFIG);
        setConfig(DEFAULT_SIMULATION_CONFIG);
        setData(sharedSimulation.getData());
      }
    };

    void loadSavedConfiguration();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleStateChange = (state: string) => {
    if (getSharedActiveScenarioId() !== 'custom') {
      sharedScenarioRunner.stop();
      setSharedActiveScenarioId('custom');
      setActiveScenarioId('custom');
    }
    sharedSimulation.setState(state as SimulationState);
    setData(sharedSimulation.getData());
  };

  const handleReset = () => {
    resetSharedSimulation();
    setIsRunning(false);
    setActiveScenarioId('custom');
    clearAllAlerts();
  };

  const handleToggleRunning = () => {
    const nextRunning = !isRunning;
    if (nextRunning && getSharedActiveScenarioId() !== 'custom') {
      sharedScenarioRunner.stop();
      setSharedActiveScenarioId('custom');
      setActiveScenarioId('custom');
    }
    setSharedIsRunning(nextRunning);
    setIsRunning(nextRunning);
    if (nextRunning) {
      addAlert('Simulation started', 'success');
    }
  };

  const handleConfigChange = async (newConfig: SimulationConfig): Promise<boolean> => {
    if (getSharedActiveScenarioId() !== 'custom') {
      sharedScenarioRunner.stop();
      setSharedActiveScenarioId('custom');
      setActiveScenarioId('custom');
    }
    if (isConfigSaving) {
      return false;
    }

    setIsConfigSaving(true);
    setConfigSaveState('idle');

    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ config: newConfig })
      });

      if (!response.ok) {
        throw new Error('Failed to save configuration');
      }

      const payload = await response.json() as { config?: SimulationConfig };
      const savedConfig = payload.config ?? newConfig;

      sharedSimulation.applyConfiguration(savedConfig);
      setData(sharedSimulation.getData());
      setConfig(savedConfig);
      setConfigSaveState('saved');
      addAlert('Save Successfully', 'success');
      return true;
    } catch {
      setConfigSaveState('error');
      addAlert('Unable to save configuration', 'error');
      return false;
    } finally {
      setIsConfigSaving(false);
    }
  };

  const handleResetConfiguration = async () => {
    const resetSuccess = await handleConfigChange(DEFAULT_SIMULATION_CONFIG);

    if (resetSuccess) {
      addAlert('Configuration reset to default', 'info');
    }
  };

  const handleExportCSV = () => {
    sharedDataLogger.downloadCSV();
    addAlert('Data exported to CSV', 'success');
  };

  const handleExportJSON = () => {
    sharedDataLogger.downloadJSON();
    addAlert('Data exported to JSON', 'success');
  };

  const handleSelectScenario = (scenario: Scenario) => {
    startSharedScenario(scenario);
    setIsRunning(scenario.id !== 'custom');
    setActiveScenarioId(scenario.id);
    if (scenario.id !== 'custom') {
      addAlert('Simulation started with scenario', 'info');
    } else {
      addAlert('Switched to manual control scenario', 'info');
    }
  };

  const handleSaveToHistory = () => {
    const stats = sharedDataLogger.getStatistics();
    setHistoricalData(prev => [...prev, {
      id: Date.now().toString(),
      name: `Run ${prev.length + 1}`,
      timestamp: Date.now(),
      statistics: stats
    }]);
    addAlert('Simulation saved to history', 'success');
  };

  return (
    <div className="min-h-screen bg-[#070b19] bg-[radial-gradient(ellipse_at_top,rgba(30,58,138,0.2),transparent_50%),radial-gradient(circle_at_bottom,rgba(88,28,135,0.15),transparent_60%)] p-4 sm:p-6 text-slate-100 relative">
      {/* Alert System */}
      <AlertSystem alerts={alerts} onDismiss={dismissAlert} />

      {/* Configuration Panel */}
      <ConfigurationPanel
        key={JSON.stringify(config)}
        config={config}
        onConfigChange={handleConfigChange}
        onReset={handleResetConfiguration}
        isSaving={isConfigSaving}
        saveState={configSaveState}
        isOpen={configOpen}
        onToggle={() => setConfigOpen(!configOpen)}
      />

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between relative z-10">
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-1.5 bg-gradient-to-r from-blue-400 via-indigo-200 to-purple-400 bg-clip-text text-transparent leading-tight tracking-wider uppercase">
            Compactor Rig Simulator
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm font-semibold tracking-wide uppercase">
            Real-time mechanical & dynamic compaction physical simulator
          </p>
        </div>

        {/* Header Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/"
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-650 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 border border-indigo-500/20 text-white px-4 py-2.5 rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer font-bold text-xs uppercase tracking-wider"
          >
            <Activity className="w-4 h-4" />
            Control Console
          </Link>

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

      {/* Top Section: Crane Animation (Full-Width, Centered) */}
      <div className="max-w-2xl mx-auto w-full mb-8 relative z-10">
        <CraneVisualization
          height={data.tamperHeight}
          state={data.state}
          maxHeight={config.maxHeight}
          tamperMass={data.tamperMass}
          soilCompaction={data.soilCompaction}
          soilType={data.soilType}
          motorPower={data.motorPower}
          generatorPower={data.generatorPower}
          solarPower={data.solarPower}
        />
      </div>

      {/* Bottom Section: Controls & Dashboard */}
      <div className="max-w-4xl mx-auto w-full mb-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ControlPanel
            currentState={data.state}
            onStateChange={handleStateChange}
            onReset={handleReset}
            isRunning={isRunning}
            onToggleRunning={handleToggleRunning}
            scenarios={scenarios}
            onSelectScenario={handleSelectScenario}
            activeScenarioId={activeScenarioId}
          />
          {/* Telemetry and System Log */}
          <div className="flex flex-col gap-6">
            <div className="cyber-glass rounded-2xl p-6 shadow-2xl flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-200 mb-4 text-xs tracking-wider uppercase">System Telemetry Log</h3>
                <div className="grid grid-cols-2 gap-6 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <div>
                    <div className="text-slate-500 font-bold">Simulation Time</div>
                    <div className="text-2xl font-black text-slate-200 mt-1.5" style={{ fontFamily: 'var(--font-mono), monospace' }}>{data.time.toFixed(1)}s</div>
                  </div>
                  <div>
                    <div className="text-slate-500 font-bold">Velocity</div>
                    <div className="text-2xl font-black text-slate-200 mt-1.5" style={{ fontFamily: 'var(--font-mono), monospace' }}>{data.tamperVelocity.toFixed(2)} m/s</div>
                  </div>
                  <div>
                    <div className="text-slate-500 font-bold">Battery Temp</div>
                    <div className="text-2xl font-black text-purple-400 mt-1.5" style={{ fontFamily: 'var(--font-mono), monospace' }}>{(data.batteryTemp ?? 25.0).toFixed(1)} °C</div>
                  </div>
                  <div>
                    <div className="text-slate-500 font-bold">Status</div>
                    <div className="text-2xl font-black text-blue-400 mt-1.5">{data.state}</div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveToHistory}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-4 px-4 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-500/10 cursor-pointer border border-purple-500/20 transition-all duration-300 hover:-translate-y-0.5"
            >
              <History className="w-5 h-5" />
              Save Current Run to History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
