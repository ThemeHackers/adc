'use client';

import React, { useState } from 'react';
import { Settings, Save, RotateCcw } from 'lucide-react';

interface ConfigurationPanelProps {
  config: SimulationConfig;
  onConfigChange: (config: SimulationConfig) => void;
  onReset: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export interface SimulationConfig {
  pendulumMass: number;
  maxHeight: number;
  gravity: number;
  motorPower: number;
  solarPower: number;
  batteryVoltage: number;
  batteryCapacity: number;
  motorEfficiency: number;
  generatorEfficiency: number;
  initialSoilDensity: number;
}

export default function ConfigurationPanel({
  config,
  onConfigChange,
  onReset,
  isOpen,
  onToggle
}: ConfigurationPanelProps) {
  const [localConfig, setLocalConfig] = useState(config);
  
  const handleChange = (key: keyof SimulationConfig, value: number) => {
    if (isNaN(value)) return;
    setLocalConfig(prev => ({ ...prev, [key]: value }));
  };
  
  const handleSave = () => {
    onConfigChange(localConfig);
  };
  
  const handleResetConfig = () => {
    onReset();
    setLocalConfig(config);
  };
  
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed top-4 right-4 bg-slate-900/80 p-3 rounded-full border border-slate-800 shadow-2xl hover:border-slate-700/80 hover:bg-slate-850 transition-all z-50 cursor-pointer text-slate-300 hover:text-slate-100 shadow-[0_0_10px_rgba(255,255,255,0.02)]"
        type="button"
        title="Open Configuration Panel"
      >
        <Settings className="w-5.5 h-5.5" />
      </button>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onToggle}>
      <div 
        className="cyber-glass bg-slate-900/90 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-950/50 backdrop-blur-md border-b border-slate-800/80 p-5 rounded-t-2xl z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wider uppercase text-slate-200">Simulation Configuration</h2>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Engine Tuning Console</span>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="text-slate-400 hover:text-slate-200 hover:bg-slate-800/85 text-xl cursor-pointer rounded-xl w-8 h-8 flex items-center justify-center border border-transparent hover:border-slate-700/50 transition-all"
            type="button"
          >
            ×
          </button>
        </div>
        
        {/* Configuration Form */}
        <div className="p-5 space-y-6">
          {/* Pendulum Settings */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-blue-500 rounded-full shadow-[0_0_8px_#3b82f6]"></span>
              Pendulum Dynamics
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Pendulum Mass (kg)
                </label>
                <input
                  type="number"
                  value={localConfig.pendulumMass || ''}
                  onChange={(e) => handleChange('pendulumMass', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-950/60 border border-slate-800/80 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 text-slate-100 font-mono text-sm"
                  step="10"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Max Height (m)
                </label>
                <input
                  type="number"
                  value={localConfig.maxHeight || ''}
                  onChange={(e) => handleChange('maxHeight', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-950/60 border border-slate-800/80 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 text-slate-100 font-mono text-sm"
                  step="1"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Gravity (m/s²)
                </label>
                <input
                  type="number"
                  value={localConfig.gravity || ''}
                  onChange={(e) => handleChange('gravity', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-950/60 border border-slate-800/80 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 text-slate-100 font-mono text-sm"
                  step="0.1"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Initial Soil Density (kg/m³)
                </label>
                <input
                  type="number"
                  value={localConfig.initialSoilDensity || ''}
                  onChange={(e) => handleChange('initialSoilDensity', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-950/60 border border-slate-800/80 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 text-slate-100 font-mono text-sm"
                  step="10"
                />
              </div>
            </div>
          </div>
          
          {/* Power System Settings */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]"></span>
              Power Grids & Drive Systems
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Solar Power Input (W)
                </label>
                <input
                  type="number"
                  value={localConfig.solarPower || ''}
                  onChange={(e) => handleChange('solarPower', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-950/60 border border-slate-800/80 rounded-xl focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 text-slate-100 font-mono text-sm"
                  step="10"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Motor Drive Power (W)
                </label>
                <input
                  type="number"
                  value={localConfig.motorPower || ''}
                  onChange={(e) => handleChange('motorPower', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-950/60 border border-slate-800/80 rounded-xl focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 text-slate-100 font-mono text-sm"
                  step="10"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Motor Efficiency (%)
                </label>
                <input
                  type="number"
                  value={localConfig.motorEfficiency * 100 || ''}
                  onChange={(e) => handleChange('motorEfficiency', parseFloat(e.target.value) / 100)}
                  className="w-full px-4 py-2 bg-slate-950/60 border border-slate-800/80 rounded-xl focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 text-slate-100 font-mono text-sm"
                  step="1"
                  min="0"
                  max="100"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Generator Efficiency (%)
                </label>
                <input
                  type="number"
                  value={localConfig.generatorEfficiency * 100 || ''}
                  onChange={(e) => handleChange('generatorEfficiency', parseFloat(e.target.value) / 100)}
                  className="w-full px-4 py-2 bg-slate-950/60 border border-slate-800/80 rounded-xl focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 text-slate-100 font-mono text-sm"
                  step="1"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>
          
          {/* Battery Settings */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-amber-500 rounded-full shadow-[0_0_8px_#f59e0b]"></span>
              Accumulator System
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Battery Voltage (V)
                </label>
                <select
                  value={localConfig.batteryVoltage}
                  onChange={(e) => handleChange('batteryVoltage', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-950/60 border border-slate-800/80 rounded-xl focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 text-slate-100 font-medium text-sm cursor-pointer"
                >
                  <option className="bg-slate-900" value={24}>24V DC</option>
                  <option className="bg-slate-900" value={48}>48V DC</option>
                </select>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Initial Capacity (%)
                </label>
                <input
                  type="number"
                  value={localConfig.batteryCapacity || ''}
                  onChange={(e) => handleChange('batteryCapacity', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-950/60 border border-slate-800/80 rounded-xl focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 text-slate-100 font-mono text-sm"
                  step="1"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-950/50 backdrop-blur-md p-5 border-t border-slate-800/80 rounded-b-2xl">
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-lg shadow-blue-500/10 cursor-pointer border border-blue-500/20"
            >
              <Save className="w-4 h-4" />
              Save Configuration
            </button>
            
            <button
              onClick={handleResetConfig}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-slate-200 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-lg cursor-pointer border border-slate-700/20"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Default
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
