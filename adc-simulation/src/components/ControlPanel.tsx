'use client';

import React from 'react';
import { Play, Pause, RotateCcw, Zap, Sun, Battery, Activity } from 'lucide-react';

interface ControlPanelProps {
  currentState: string;
  onStateChange: (state: string) => void;
  onReset: () => void;
  isRunning: boolean;
  onToggleRunning: () => void;
}

export default function ControlPanel({
  currentState,
  onStateChange,
  onReset,
  isRunning,
  onToggleRunning
}: ControlPanelProps) {
  const states = [
    { id: 'IDLE', label: 'Idle', icon: Activity, color: 'bg-gray-500' },
    { id: 'CHARGING', label: 'Charging', icon: Sun, color: 'bg-green-500' },
    { id: 'DISCHARGING', label: 'Discharging', icon: Battery, color: 'bg-blue-500' },
    { id: 'IMPACT', label: 'Impact/DC', icon: Zap, color: 'bg-red-500' }
  ];
  
  return (
    <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
      <h3 className="font-semibold text-gray-700 mb-4">Control Panel</h3>
      
      {/* State selection */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {states.map((state) => (
          <button
            key={state.id}
            onClick={() => onStateChange(state.id)}
            className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
              currentState === state.id
                ? `${state.color} text-white border-transparent`
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
            }`}
          >
            <state.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{state.label}</span>
          </button>
        ))}
      </div>
      
      {/* Control buttons */}
      <div className="flex gap-2">
        <button
          onClick={onToggleRunning}
          className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg font-medium transition-all ${
            isRunning
              ? 'bg-orange-500 hover:bg-orange-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Start
            </>
          )}
        </button>
        
        <button
          onClick={onReset}
          className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-medium transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>
      
      {/* Current state indicator */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600 mb-1">Current State</div>
        <div className="text-lg font-bold text-gray-900">{currentState}</div>
      </div>
    </div>
  );
}
