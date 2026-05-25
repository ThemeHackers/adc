'use client';

import React from 'react';
import { Play, Pause, RotateCcw, Zap, Sun, Battery, Activity } from 'lucide-react';
import { Scenario } from '@/lib/scenarios';

interface ControlPanelProps {
  currentState: string;
  onStateChange: (state: string) => void;
  onReset: () => void;
  isRunning: boolean;
  onToggleRunning: () => void;
  scenarios: Scenario[];
  onSelectScenario: (scenario: Scenario) => void;
  activeScenarioId?: string;
}

export default function ControlPanel({
  currentState,
  onStateChange,
  onReset,
  isRunning,
  onToggleRunning,
  scenarios,
  onSelectScenario,
  activeScenarioId
}: ControlPanelProps) {
  const states = [
    { id: 'IDLE', label: 'Idle', icon: Activity, activeClass: 'bg-slate-700/80 border-slate-500 shadow-[0_0_12px_rgba(148,163,184,0.3)]', defaultClass: 'border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200' },
    { id: 'CHARGING', label: 'Charging', icon: Sun, activeClass: 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]', defaultClass: 'border-slate-800 hover:border-emerald-500/30 text-slate-400 hover:text-emerald-400' },
    { id: 'DISCHARGING', label: 'Discharging', icon: Battery, activeClass: 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.3)]', defaultClass: 'border-slate-800 hover:border-blue-500/30 text-slate-400 hover:text-blue-400' },
    { id: 'IMPACT', label: 'Impact/DC', icon: Zap, activeClass: 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.3)]', defaultClass: 'border-slate-800 hover:border-rose-500/30 text-slate-400 hover:text-rose-400' }
  ];

  const getActiveColor = () => {
    switch (currentState) {
      case 'CHARGING': return 'text-emerald-400';
      case 'DISCHARGING': return 'text-blue-400';
      case 'IMPACT': return 'text-rose-400';
      default: return 'text-slate-400';
    }
  };
  
  return (
    <div className="cyber-glass rounded-2xl p-5 shadow-2xl">
      <h3 className="font-bold text-slate-200 mb-4 tracking-wide uppercase text-xs">Command Console</h3>
      
      {/* State selection */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {states.map((state) => (
          <button
            key={state.id}
            onClick={() => onStateChange(state.id)}
            className={`flex items-center gap-2 p-2 sm:p-3 rounded-xl border-2 transition-all duration-300 font-bold text-[10px] sm:text-xs cursor-pointer ${
              currentState === state.id ? state.activeClass : `bg-slate-950/40 ${state.defaultClass}`
            }`}
          >
            <state.icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />
            <span className="truncate">{state.label}</span>
          </button>
        ))}
      </div>
      
      {/* Control buttons */}
      <div className="flex gap-2">
        <button
          onClick={onToggleRunning}
          className={`flex-1 flex items-center justify-center gap-1.5 p-2.5 sm:p-3 rounded-xl font-black text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 cursor-pointer shadow-lg ${
            isRunning
              ? 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-orange-500/10'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-500/10'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
              <span>Pause Run</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
              <span>Start Run</span>
            </>
          )}
        </button>
        
        <button
          onClick={onReset}
          className="flex-1 flex items-center justify-center gap-1.5 p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-slate-100 font-black text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 cursor-pointer shadow-lg shadow-slate-900/30"
        >
          <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Reset System</span>
        </button>
      </div>

      {/* Demo Scenario Presets */}
      <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2">
        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Demo Workflows</div>
        <div className="grid grid-cols-2 gap-2">
          {scenarios.map((sc) => (
            <button
              key={sc.id}
              onClick={() => onSelectScenario(sc)}
              className={`p-2 rounded-xl border text-left transition-all duration-300 cursor-pointer flex flex-col justify-between h-[68px] ${
                activeScenarioId === sc.id
                  ? 'bg-indigo-500/15 border-indigo-500 text-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                  : 'bg-slate-950/40 border-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              type="button"
              title={sc.description}
            >
              <div className="font-bold text-[10px] sm:text-[11px] truncate w-full">{sc.name}</div>
              <div className="text-[8px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">{sc.description}</div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Current state indicator */}
      <div className="mt-4 p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">System State</span>
          <div className={`text-lg font-black tracking-widest mt-0.5 ${getActiveColor()}`}>{currentState}</div>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isRunning ? 'Active' : 'Standby'}</span>
        </div>
      </div>
    </div>
  );
}
