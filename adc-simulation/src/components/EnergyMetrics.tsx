'use client';

import React from 'react';
import { Activity, TrendingUp, Zap, Layers, Coins } from 'lucide-react';

interface EnergyMetricsProps {
  potentialEnergy: number;
  kineticEnergy: number;
  totalEnergy: number;
  soilDensity: number;
  impactCount: number;
  estimatedEnergyValueTHB: number;
  estimatedConsumptionCostTHB: number;
  estimatedNetValueTHB: number;
  electricityRateTHBPerKWh: number;
}

export default function EnergyMetrics({
  potentialEnergy,
  kineticEnergy,
  totalEnergy,
  soilDensity,
  impactCount,
  estimatedEnergyValueTHB,
  estimatedConsumptionCostTHB,
  estimatedNetValueTHB,
  electricityRateTHBPerKWh
}: EnergyMetricsProps) {
  const metrics = [
    {
      title: 'Potential Energy',
      value: potentialEnergy,
      unit: 'kJ',
      icon: Activity,
      color: 'text-blue-400',
      borderColor: 'border-l-blue-500',
      glowColor: 'rgba(59,130,246,0.15)',
      iconBg: 'bg-blue-500/10',
      iconBorder: 'border-blue-500/20',
      format: (v: number) => (v / 1000).toFixed(2)
    },
    {
      title: 'Kinetic Energy',
      value: kineticEnergy,
      unit: 'kJ',
      icon: Zap,
      color: 'text-orange-400',
      borderColor: 'border-l-orange-500',
      glowColor: 'rgba(249,115,22,0.15)',
      iconBg: 'bg-orange-500/10',
      iconBorder: 'border-orange-500/20',
      format: (v: number) => (v / 1000).toFixed(2)
    },
    {
      title: 'Total Energy',
      value: totalEnergy,
      unit: 'kJ',
      icon: TrendingUp,
      color: 'text-purple-400',
      borderColor: 'border-l-purple-500',
      glowColor: 'rgba(139,92,246,0.15)',
      iconBg: 'bg-purple-500/10',
      iconBorder: 'border-purple-500/20',
      format: (v: number) => (v / 1000).toFixed(2)
    },
    {
      title: 'Soil Density',
      value: soilDensity,
      unit: 'kg/m³',
      icon: Layers,
      color: 'text-amber-400',
      borderColor: 'border-l-amber-500',
      glowColor: 'rgba(245,158,11,0.15)',
      iconBg: 'bg-amber-500/10',
      iconBorder: 'border-amber-500/20',
      format: (v: number) => v.toFixed(0)
    },
    {
      title: 'Electricity Bill',
      value: estimatedConsumptionCostTHB,
      unit: 'THB',
      icon: Coins,
      color: 'text-emerald-400',
      borderColor: 'border-l-emerald-500',
      glowColor: 'rgba(16,185,129,0.15)',
      iconBg: 'bg-emerald-500/10',
      iconBorder: 'border-emerald-500/20',
      format: (v: number) => `฿${v.toFixed(2)}`
    }
  ];
  
  return (
    <div className="space-y-3">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className={`cyber-glass rounded-xl p-3.5 border-l-4 ${metric.borderColor} shadow-lg transition-all duration-300 hover:translate-x-1`}
          style={{ boxShadow: `0 4px 15px ${metric.glowColor}` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg border ${metric.iconBg} ${metric.iconBorder} ${metric.color}`}>
                <metric.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{metric.title}</div>
                <div className="text-xl font-black text-slate-100 mt-0.5" style={{ fontFamily: 'var(--font-mono), monospace' }}>
                  {metric.format(metric.value)}
                </div>
              </div>
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {metric.unit}
            </div>
          </div>
        </div>
      ))}
      
      {/* Impact counter */}
      <div className="bg-gradient-to-r from-rose-600 to-red-600 rounded-xl p-4 shadow-xl transition-all duration-300 hover:shadow-[0_0_15px_rgba(244,63,94,0.4)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10 border border-white/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-white/80 uppercase tracking-wider">Total Impacts</div>
              <div className="text-3xl font-black text-white mt-0.5" style={{ fontFamily: 'var(--font-mono), monospace' }}>
                {impactCount}
              </div>
            </div>
          </div>
          <div className="text-[10px] font-bold text-white/95 bg-white/25 px-2.5 py-1 rounded-full uppercase tracking-wider">
            DC Events
          </div>
        </div>
      </div>

      {/* Bill estimate */}
      <div className="cyber-glass rounded-xl border border-emerald-500/25 p-4 shadow-lg">
        <div className="mb-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Thailand Electricity Bill Estimate</div>
          <div className="mt-1 text-2xl font-black text-emerald-400" style={{ fontFamily: 'var(--font-mono), monospace' }}>฿{estimatedConsumptionCostTHB.toFixed(2)}</div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800/80 text-[10px] font-bold text-slate-300 uppercase tracking-wider">
          <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/60 flex flex-col justify-between">
            <span className="text-slate-500 block mb-0.5">Value</span>
            <span className="text-slate-100 font-mono text-[11px] sm:text-xs">฿{estimatedEnergyValueTHB.toFixed(2)}</span>
          </div>
          <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/60 flex flex-col justify-between">
            <span className="text-slate-500 block mb-0.5">Bill</span>
            <span className="text-slate-100 font-mono text-[11px] sm:text-xs">฿{estimatedConsumptionCostTHB.toFixed(2)}</span>
          </div>
          <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/60 flex flex-col justify-between">
            <span className="text-slate-500 block mb-0.5">Net</span>
            <span className="text-slate-100 font-mono text-[11px] sm:text-xs">฿{estimatedNetValueTHB.toFixed(2)}</span>
          </div>
          <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/60 flex flex-col justify-between">
            <span className="text-slate-500 block mb-0.5">Rate</span>
            <span className="text-slate-100 font-mono text-[11px] sm:text-xs">฿{electricityRateTHBPerKWh.toFixed(2)}/u</span>
          </div>
        </div>
      </div>
    </div>
  );
}
