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
    if (capacity > 75) return { text: 'text-green-500', bg: 'bg-green-500', gradient: 'from-green-400 to-green-600' };
    if (capacity > 50) return { text: 'text-yellow-500', bg: 'bg-yellow-500', gradient: 'from-yellow-400 to-yellow-600' };
    if (capacity > 25) return { text: 'text-orange-500', bg: 'bg-orange-500', gradient: 'from-orange-400 to-orange-600' };
    return { text: 'text-red-500', bg: 'bg-red-500', gradient: 'from-red-400 to-red-600' };
  };
  
  const colors = getBatteryColor();
  const isCharging = current > 0;
  
  return (
    <div className="bg-white rounded-xl p-5 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl shadow-md ${colors.text} bg-opacity-10`} style={{ backgroundColor: `${colors.text}15`, border: `2px solid ${colors.text}30` }}>
            {isCharging ? (
              <BatteryCharging className={`w-6 h-6 ${colors.text} animate-pulse`} />
            ) : (
              <div className={colors.text}>{getBatteryIcon()}</div>
            )}
          </div>
          <h3 className="font-bold text-gray-800">Battery System</h3>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-900">{voltage}V</div>
          <div className="text-sm text-gray-500 font-medium">System Voltage</div>
        </div>
      </div>
      
      {/* Battery capacity bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span className="font-medium">Capacity</span>
          <span className="font-bold text-gray-900">{capacity.toFixed(1)}%</span>
        </div>
        <div className="w-full h-8 bg-gray-100 rounded-full overflow-hidden shadow-inner">
          <div
            className={`h-full transition-all duration-500 bg-gradient-to-r ${colors.gradient} shadow-lg`}
            style={{ width: `${capacity}%` }}
          />
        </div>
      </div>
      
      {/* Current flow indicator */}
      <div className="flex items-center justify-between text-sm bg-gray-50 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isCharging ? 'bg-green-500 animate-pulse' : 'bg-red-500 animate-pulse'}`} />
          <span className="font-medium text-gray-700">
            {isCharging ? 'Charging' : 'Discharging'}
          </span>
        </div>
        <div className="font-mono font-bold text-gray-900">
          {Math.abs(current).toFixed(2)} A
        </div>
      </div>
    </div>
  );
}
