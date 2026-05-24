'use client';

import React from 'react';
import { Zap, Sun, Battery, Cpu } from 'lucide-react';

interface PowerGaugeProps {
  title: string;
  value: number;
  max: number;
  unit: string;
  icon: 'sun' | 'battery' | 'cpu' | 'zap';
  color: string;
}

export default function PowerGauge({ title, value, max, unit, icon, color }: PowerGaugeProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const getIcon = () => {
    switch (icon) {
      case 'sun':
        return <Sun className="w-6 h-6" />;
      case 'battery':
        return <Battery className="w-6 h-6" />;
      case 'cpu':
        return <Cpu className="w-6 h-6" />;
      case 'zap':
        return <Zap className="w-6 h-6" />;
    }
  };
  
  return (
    <div className="bg-white rounded-xl p-5 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl shadow-md" style={{ backgroundColor: `${color}15`, border: `2px solid ${color}30` }}>
            <div style={{ color }}>{getIcon()}</div>
          </div>
          <h3 className="font-bold text-gray-800">{title}</h3>
        </div>
        <div 
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ backgroundColor: color, opacity: value > 0 ? 1 : 0.3 }}
        />
      </div>
      
      <div className="relative h-36">
        {/* Gauge background */}
        <svg viewBox="0 0 200 120" className="w-full h-full">
          <defs>
            <linearGradient id={`gauge-gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
              <stop offset="100%" stopColor={color} stopOpacity="1"/>
            </linearGradient>
          </defs>
          
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#f3f4f6"
            strokeWidth="14"
            strokeLinecap="round"
          />
          
          {/* Value arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={`url(#gauge-gradient-${color})`}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 2.51} 251`}
            style={{ transition: 'stroke-dasharray 0.5s ease' }}
          />
          
          {/* Value text */}
          <text
            x="100"
            y="80"
            textAnchor="middle"
            className="text-3xl font-bold fill-gray-900"
            style={{ fontFamily: 'system-ui, sans-serif' }}
          >
            {value.toFixed(0)}
          </text>
          
          {/* Unit text */}
          <text
            x="100"
            y="100"
            textAnchor="middle"
            className="text-sm font-medium fill-gray-500"
          >
            {unit}
          </text>
        </svg>
      </div>
      
      <div className="mt-3 flex justify-between text-xs font-medium text-gray-400">
        <span>0</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
