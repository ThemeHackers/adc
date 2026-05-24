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
        className="fixed top-4 right-4 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all z-50 cursor-pointer hover:bg-gray-100"
        type="button"
      >
        <Settings className="w-6 h-6 text-gray-700" />
      </button>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onToggle}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Settings className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Simulation Configuration
              </h2>
            </div>
            <button
              onClick={onToggle}
              className="text-gray-500 hover:text-gray-700 text-2xl cursor-pointer hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
              type="button"
            >
              ×
            </button>
          </div>
        </div>
        
        {/* Configuration Form */}
        <div className="p-6 space-y-6">
          {/* Pendulum Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-500 rounded"></span>
              Pendulum Settings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Pendulum Mass (kg)
                </label>
                <input
                  type="number"
                  value={localConfig.pendulumMass || ''}
                  onChange={(e) => handleChange('pendulumMass', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
                  step="10"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Max Height (m)
                </label>
                <input
                  type="number"
                  value={localConfig.maxHeight || ''}
                  onChange={(e) => handleChange('maxHeight', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
                  step="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Gravity (m/s²)
                </label>
                <input
                  type="number"
                  value={localConfig.gravity || ''}
                  onChange={(e) => handleChange('gravity', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
                  step="0.1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Initial Soil Density (kg/m³)
                </label>
                <input
                  type="number"
                  value={localConfig.initialSoilDensity || ''}
                  onChange={(e) => handleChange('initialSoilDensity', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
                  step="10"
                />
              </div>
            </div>
          </div>
          
          {/* Power System Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-1 h-6 bg-green-500 rounded"></span>
              Power System
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Solar Power (W)
                </label>
                <input
                  type="number"
                  value={localConfig.solarPower || ''}
                  onChange={(e) => handleChange('solarPower', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 font-medium"
                  step="10"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Motor Power (W)
                </label>
                <input
                  type="number"
                  value={localConfig.motorPower || ''}
                  onChange={(e) => handleChange('motorPower', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 font-medium"
                  step="10"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Motor Efficiency (%)
                </label>
                <input
                  type="number"
                  value={localConfig.motorEfficiency * 100 || ''}
                  onChange={(e) => handleChange('motorEfficiency', parseFloat(e.target.value) / 100)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 font-medium"
                  step="1"
                  min="0"
                  max="100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Generator Efficiency (%)
                </label>
                <input
                  type="number"
                  value={localConfig.generatorEfficiency * 100 || ''}
                  onChange={(e) => handleChange('generatorEfficiency', parseFloat(e.target.value) / 100)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 font-medium"
                  step="1"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>
          
          {/* Battery Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-1 h-6 bg-yellow-500 rounded"></span>
              Battery System
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Battery Voltage (V)
                </label>
                <select
                  value={localConfig.batteryVoltage}
                  onChange={(e) => handleChange('batteryVoltage', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900 font-medium"
                >
                  <option value={24}>24V</option>
                  <option value={48}>48V</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Initial Capacity (%)
                </label>
                <input
                  type="number"
                  value={localConfig.batteryCapacity || ''}
                  onChange={(e) => handleChange('batteryCapacity', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900 font-medium"
                  step="1"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              <Save className="w-5 h-5" />
              Save Configuration
            </button>
            
            <button
              onClick={handleResetConfig}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Reset to Default
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
