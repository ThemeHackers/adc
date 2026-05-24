'use client';

import React from 'react';
import { Activity, TrendingUp, Zap, Layers } from 'lucide-react';

interface EnergyMetricsProps {
  potentialEnergy: number;
  kineticEnergy: number;
  totalEnergy: number;
  soilDensity: number;
  impactCount: number;
}

export default function EnergyMetrics({
  potentialEnergy,
  kineticEnergy,
  totalEnergy,
  soilDensity,
  impactCount
}: EnergyMetricsProps) {
  const metrics = [
    {
      title: 'Potential Energy',
      value: potentialEnergy,
      unit: 'kJ',
      icon: Activity,
      color: '#3b82f6',
      bgColor: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
      format: (v: number) => (v / 1000).toFixed(2)
    },
    {
      title: 'Kinetic Energy',
      value: kineticEnergy,
      unit: 'kJ',
      icon: Zap,
      color: '#f97316',
      bgColor: 'from-orange-50 to-orange-100',
      borderColor: 'border-orange-200',
      format: (v: number) => (v / 1000).toFixed(2)
    },
    {
      title: 'Total Energy',
      value: totalEnergy,
      unit: 'kJ',
      icon: TrendingUp,
      color: '#8b5cf6',
      bgColor: 'from-purple-50 to-purple-100',
      borderColor: 'border-purple-200',
      format: (v: number) => (v / 1000).toFixed(2)
    },
    {
      title: 'Soil Density',
      value: soilDensity,
      unit: 'kg/m³',
      icon: Layers,
      color: '#d97706',
      bgColor: 'from-amber-50 to-amber-100',
      borderColor: 'border-amber-200',
      format: (v: number) => v.toFixed(0)
    }
  ];
  
  return (
    <div className="space-y-3">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className={`bg-gradient-to-r ${metric.bgColor} rounded-xl p-4 border ${metric.borderColor} shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white shadow-sm" style={{ color: metric.color }}>
                <metric.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">{metric.title}</div>
                <div className="text-2xl font-bold text-gray-900">
                  {metric.format(metric.value)}
                </div>
              </div>
            </div>
            <div className="text-sm font-bold text-gray-500">
              {metric.unit}
            </div>
          </div>
        </div>
      ))}
      
      {/* Impact counter */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xs font-medium text-white/90 uppercase tracking-wide">Total Impacts</div>
              <div className="text-3xl font-bold text-white">
                {impactCount}
              </div>
            </div>
          </div>
          <div className="text-xs font-bold text-white/80 bg-white/20 px-3 py-1 rounded-full">
            DC Events
          </div>
        </div>
      </div>
    </div>
  );
}
