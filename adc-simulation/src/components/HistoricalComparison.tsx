'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { History, TrendingUp, TrendingDown, Zap, Activity, Gauge, Clock, Mountain, Droplet, Award } from 'lucide-react';
import { SimulationStatistics } from '@/lib/dataLogger';

interface HistoricalData {
  id: string;
  name: string;
  timestamp: number;
  statistics: SimulationStatistics;
}

interface HistoricalComparisonProps {
  historicalData: HistoricalData[];
  currentData: SimulationStatistics | null;
}

export default function HistoricalComparison({ historicalData, currentData }: HistoricalComparisonProps) {
  const comparisonData = [
    ...historicalData.map(data => ({
      name: data.name,
      energy: data.statistics.totalEnergyGenerated / 1000,
      impacts: data.statistics.totalImpacts,
      compaction: data.statistics.maxSoilCompaction,
      motorPower: data.statistics.avgMotorPower,
      generatorPower: data.statistics.avgGeneratorPower,
      battery: data.statistics.avgBatteryCapacity,
      density: data.statistics.finalSoilDensity,
      time: data.statistics.totalTime,
      consumed: data.statistics.totalEnergyConsumed / 1000,
      efficiency: data.statistics.energyEfficiency,
      stability: data.statistics.batteryStabilityIndex
    })),
    ...(currentData ? [{
      name: 'Current',
      energy: currentData.totalEnergyGenerated / 1000,
      impacts: currentData.totalImpacts,
      compaction: currentData.maxSoilCompaction,
      motorPower: currentData.avgMotorPower,
      generatorPower: currentData.avgGeneratorPower,
      battery: currentData.avgBatteryCapacity,
      density: currentData.finalSoilDensity,
      time: currentData.totalTime,
      consumed: currentData.totalEnergyConsumed / 1000,
      efficiency: currentData.energyEfficiency,
      stability: currentData.batteryStabilityIndex
    }] : [])
  ];
  
  const calculateStats = (key: string) => {
    if (comparisonData.length === 0) return { avg: 0, max: 0, min: 0 };
    const values = comparisonData.map(d => d[key as keyof typeof d] as number);
    return {
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      max: Math.max(...values),
      min: Math.min(...values)
    };
  };
  
  const energyStats = calculateStats('energy');
  const impactStats = calculateStats('impacts');
  const compactionStats = calculateStats('compaction');
  const efficiencyStats = calculateStats('efficiency');
  const stabilityStats = calculateStats('stability');
  
  return (
    <div className="cyber-glass rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/20 text-white">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-200">Historical Comparison</h3>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Performance analysis across runs</p>
          </div>
        </div>
        <div>
          <span className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-full font-bold text-xs uppercase tracking-wider">
            {comparisonData.length} Simulation Runs
          </span>
        </div>
      </div>
      
      {comparisonData.length === 0 ? (
        <div className="text-center py-12 text-slate-500 bg-slate-950/20 border border-slate-800/80 rounded-2xl">
          <History className="w-16 h-16 mx-auto mb-4 opacity-15" />
          <p className="text-base font-bold text-slate-400">No historical data available</p>
          <p className="text-xs mt-1 text-slate-500">Run simulations to build comparison data</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Statistics Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            <div className="bg-emerald-950/10 border border-emerald-500/20 rounded-xl p-3.5 shadow-md">
              <div className="flex items-center gap-2 mb-2 text-emerald-400">
                <Award className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Best Energy</span>
              </div>
              <div className="text-lg font-black text-slate-200" style={{ fontFamily: 'var(--font-mono), monospace' }}>{energyStats.max.toFixed(2)} <span className="text-xs text-slate-400 font-medium">kJ</span></div>
            </div>
            
            <div className="bg-blue-950/10 border border-blue-500/20 rounded-xl p-3.5 shadow-md">
              <div className="flex items-center gap-2 mb-2 text-blue-400">
                <TrendingUp className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Avg Energy</span>
              </div>
              <div className="text-lg font-black text-slate-200" style={{ fontFamily: 'var(--font-mono), monospace' }}>{energyStats.avg.toFixed(2)} <span className="text-xs text-slate-400 font-medium">kJ</span></div>
            </div>
            
            <div className="bg-amber-950/10 border border-amber-500/20 rounded-xl p-3.5 shadow-md">
              <div className="flex items-center gap-2 mb-2 text-amber-400">
                <Activity className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Most Impacts</span>
              </div>
              <div className="text-lg font-black text-slate-200" style={{ fontFamily: 'var(--font-mono), monospace' }}>{impactStats.max.toFixed(0)}</div>
            </div>
            
            <div className="bg-purple-950/10 border border-purple-500/20 rounded-xl p-3.5 shadow-md">
              <div className="flex items-center gap-2 mb-2 text-purple-400">
                <Gauge className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Avg Efficiency</span>
              </div>
              <div className="text-lg font-black text-slate-200" style={{ fontFamily: 'var(--font-mono), monospace' }}>{efficiencyStats.avg.toFixed(1)}%</div>
            </div>
            
            <div className="bg-teal-950/10 border border-teal-500/20 rounded-xl p-3.5 shadow-md">
              <div className="flex items-center gap-2 mb-2 text-teal-400">
                <Mountain className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Avg Compact</span>
              </div>
              <div className="text-lg font-black text-slate-200" style={{ fontFamily: 'var(--font-mono), monospace' }}>{compactionStats.avg.toFixed(1)}%</div>
            </div>
            
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5 shadow-md">
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <TrendingDown className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Avg Stability</span>
              </div>
              <div className="text-lg font-black text-slate-200" style={{ fontFamily: 'var(--font-mono), monospace' }}>{stabilityStats.avg.toFixed(1)}%</div>
            </div>
          </div>
          
          {/* Energy Comparison */}
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 shadow-inner">
            <h4 className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
              <Zap className="w-4 h-4 text-purple-400" />
              Energy Generated (kJ)
            </h4>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity="0.6" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#f8fafc'
                  }}
                  formatter={(value: any) => [`${Number(value).toFixed(2)} kJ`, 'Energy']}
                />
                <Bar dataKey="energy" fill="#8b5cf6" radius={[6, 6, 0, 0]} style={{ filter: 'drop-shadow(0 0 2px rgba(139,92,246,0.3))' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Power Systems & Battery Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 shadow-inner">
              <h4 className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
                <Activity className="w-4 h-4 text-blue-400" />
                Motor vs Generator Power (W)
              </h4>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity="0.6" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#f8fafc'
                    }}
                  />
                  <Area type="monotone" dataKey="motorPower" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                  <Area type="monotone" dataKey="generatorPower" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 shadow-inner">
              <h4 className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
                <Gauge className="w-4 h-4 text-amber-400" />
                Battery Capacity (%)
              </h4>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity="0.6" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#f8fafc'
                    }}
                    formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Battery']}
                  />
                  <Line type="monotone" dataKey="battery" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 1 }} style={{ filter: 'drop-shadow(0 0 2px rgba(245,158,11,0.3))' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Impacts & Compaction Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 shadow-inner">
              <h4 className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
                <Mountain className="w-4 h-4 text-rose-400" />
                Total Impacts
              </h4>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity="0.6" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#f8fafc'
                    }}
                    formatter={(value: any) => [value, 'Impacts']}
                  />
                  <Bar dataKey="impacts" fill="#f43f5e" radius={[4, 4, 0, 0]} style={{ filter: 'drop-shadow(0 0 2px rgba(244,63,94,0.3))' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 shadow-inner">
              <h4 className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
                <Droplet className="w-4 h-4 text-emerald-400" />
                Soil Compaction (%)
              </h4>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity="0.6" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#f8fafc'
                    }}
                    formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Compaction']}
                  />
                  <Line type="monotone" dataKey="compaction" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#10b981', strokeWidth: 1 }} style={{ filter: 'drop-shadow(0 0 2px rgba(16,185,129,0.3))' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Detailed Metrics Table */}
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 shadow-inner overflow-x-auto">
            <h4 className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
              <Clock className="w-4 h-4 text-indigo-400" />
              Detailed Metrics Log
            </h4>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="text-left py-2 px-3">Run Name</th>
                  <th className="text-left py-2 px-3">Time (s)</th>
                  <th className="text-left py-2 px-3">Energy (kJ)</th>
                  <th className="text-left py-2 px-3">Consumed (kJ)</th>
                  <th className="text-left py-2 px-3">Density (kg/m³)</th>
                  <th className="text-left py-2 px-3">Efficiency (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {comparisonData.map((data, index) => (
                  <tr key={index} className="hover:bg-slate-900/30 transition-colors text-slate-300">
                    <td className="py-2.5 px-3 font-semibold text-slate-200">{data.name}</td>
                    <td className="py-2.5 px-3 font-mono">{data.time.toFixed(1)}</td>
                    <td className="py-2.5 px-3 font-mono">{data.energy.toFixed(2)}</td>
                    <td className="py-2.5 px-3 font-mono">{data.consumed.toFixed(2)}</td>
                    <td className="py-2.5 px-3 font-mono">{data.density.toFixed(0)}</td>
                    <td className="py-2.5 px-3 font-mono">{data.efficiency.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
