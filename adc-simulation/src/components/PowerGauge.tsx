'use client';

import React from 'react';
import { Zap, Sun, Battery, Cpu } from 'lucide-react';

interface PowerGaugeProps {
  title: string;
  value: number;
  min?: number;
  max: number;
  unit: string;
  icon: 'sun' | 'battery' | 'cpu' | 'zap';
  color: string;
}

export default function PowerGauge({ title, value, min = 0, max, unit, icon, color }: PowerGaugeProps) {
  const range = max - min;
  const percentage = range > 0 ? Math.max(0, Math.min(((value - min) / range) * 100, 100)) : 0;
  
  const getIcon = () => {
    switch (icon) {
      case 'sun':
        return <Sun className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'battery':
        return <Battery className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'cpu':
        return <Cpu className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'zap':
        return <Zap className="w-5 h-5 sm:w-6 sm:h-6" />;
    }
  };
  
  return (
    <div className="cyber-glass rounded-2xl p-4 sm:p-5 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-slate-600/50 hover:shadow-[0_0_15px_rgba(255,255,255,0.03)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div 
            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow-inner border shrink-0"
            style={{ 
              backgroundColor: `${color}10`, 
              borderColor: `${color}30`,
              boxShadow: `0 0 10px ${color}15`
            }}
          >
            <div style={{ color }}>{getIcon()}</div>
          </div>
          <h3 className="font-bold text-slate-100 text-[10px] sm:text-xs md:text-sm tracking-wide leading-tight line-clamp-2">{title}</h3>
        </div>
        <div 
          className="w-2 h-2 rounded-full animate-pulse shadow-lg"
          style={{ 
            backgroundColor: color, 
            opacity: value > 0 ? 1 : 0.3,
            boxShadow: value > 0 ? `0 0 8px ${color}` : 'none'
          }}
        />
      </div>
      
      <div className="relative h-32 sm:h-36">
        <svg viewBox="0 0 200 120" className="w-full h-full">
          <defs>
            <linearGradient id={`gauge-gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={`${color}40`}/>
              <stop offset="100%" stopColor={color}/>
            </linearGradient>
          </defs>
          
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#1e293b"
            strokeWidth="12"
            strokeLinecap="round"
            opacity="0.6"
          />
          
          {/* Value arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={`url(#gauge-gradient-${color})`}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 2.51} 251`}
            style={{ 
              transition: 'stroke-dasharray 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              filter: `drop-shadow(0 0 4px ${color}50)`
            }}
          />
          
          {/* Value text */}
          <text
            x="100"
            y="80"
            textAnchor="middle"
            className="text-3xl font-black fill-slate-100"
            style={{ fontFamily: 'var(--font-mono), monospace' }}
          >
            {value.toFixed(0)}
          </text>
          
          {/* Unit text */}
          <text
            x="100"
            y="102"
            textAnchor="middle"
            className="text-xs font-bold fill-slate-400 uppercase tracking-widest"
          >
            {unit}
          </text>
        </svg>
      </div>
      
      <div className="mt-1 flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
