'use client';

import React from 'react';
import { Battery, BatteryCharging, BatteryFull, BatteryLow, BatteryMedium } from 'lucide-react';

interface BatteryBarProps {
  capacity: number;
  voltage: number;
  current: number;
}

export default function BatteryBar({ capacity, voltage, current }: BatteryBarProps) {
  const getBatteryIcon = () => {
    if (capacity > 75) return <BatteryFull className="w-8 h-8" />;
    if (capacity > 50) return <BatteryMedium className="w-8 h-8" />;
    if (capacity > 25) return <BatteryLow className="w-8 h-8" />;
    return <Battery className="w-8 h-8" />;
  };
  
  const getBatteryColor = () => {
    if (capacity > 75) return { text: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', gradient: 'from-emerald-400 to-teal-500', glow: 'rgba(16,185,129,0.3)' };
    if (capacity > 50) return { text: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10', gradient: 'from-amber-400 to-orange-500', glow: 'rgba(245,158,11,0.3)' };
    if (capacity > 25) return { text: 'text-orange-400', border: 'border-orange-500/30', bg: 'bg-orange-500/10', gradient: 'from-orange-400 to-rose-500', glow: 'rgba(249,115,22,0.3)' };
    return { text: 'text-rose-400', border: 'border-rose-500/30', bg: 'bg-rose-500/10', gradient: 'from-rose-500 to-red-600', glow: 'rgba(244,63,94,0.3)' };
  };
  
  const colors = getBatteryColor();
  const isCharging = current > 0;
  
  return (
    <div className="cyber-glass rounded-2xl p-5 shadow-2xl transition-all duration-300 hover:border-slate-700/80">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className={`p-2.5 rounded-xl border ${colors.text} ${colors.bg} ${colors.border}`}
            style={{ boxShadow: `0 0 10px ${colors.glow}` }}
          >
            {isCharging ? (
              <BatteryCharging className={`w-6 h-6 ${colors.text} animate-pulse`} />
            ) : (
              <div className={colors.text}>{getBatteryIcon()}</div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-slate-200">Battery System</h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Storage Cell</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-slate-100" style={{ fontFamily: 'var(--font-mono), monospace' }}>{voltage.toFixed(0)}<span className="text-base text-slate-400 font-medium ml-0.5">V</span></div>
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">System Voltage</div>
        </div>
      </div>
      
      {/* Battery capacity bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-2">
          <span className="font-bold text-slate-400 uppercase tracking-wider">Capacity</span>
          <span className={`font-black ${colors.text}`} style={{ fontFamily: 'var(--font-mono), monospace' }}>{capacity.toFixed(1)}%</span>
        </div>
        <div className="w-full h-7 bg-slate-950/80 rounded-full overflow-hidden border border-slate-800 p-0.5 shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${colors.gradient}`}
            style={{ 
              width: `${capacity}%`,
              boxShadow: `0 0 8px ${colors.glow}`
            }}
          />
        </div>
      </div>
      
      {/* Current flow indicator */}
      <div className="flex items-center justify-between text-xs bg-slate-950/40 border border-slate-800/80 rounded-xl p-3">
        <div className="flex items-center gap-2">
          <div 
            className={`w-2.5 h-2.5 rounded-full ${isCharging ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} 
            style={{ boxShadow: `0 0 6px ${isCharging ? '#10b981' : '#f43f5e'}` }}
          />
          <span className="font-bold text-slate-300 uppercase tracking-wider">
            {isCharging ? 'Charging Mode' : 'Discharging Mode'}
          </span>
        </div>
        <div className={`font-mono font-bold text-sm ${isCharging ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isCharging ? '+' : ''}{current.toFixed(2)} A
        </div>
      </div>
    </div>
  );
}
