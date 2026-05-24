'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { History, TrendingUp, TrendingDown, Zap, Activity, Gauge, Clock, Mountain, Droplet, ArrowUp, ArrowDown, Award } from 'lucide-react';

interface HistoricalData {
  id: string;
  name: string;
  timestamp: number;
  statistics: {
    totalTime: number;
    totalEnergyGenerated: number;
    totalImpacts: number;
    maxSoilCompaction: number;
    avgGeneratorPower: number;
    avgMotorPower: number;
    avgBatteryCapacity: number;
    finalSoilDensity: number;
    totalEnergyConsumed: number;
    efficiency: number;
  };
}

interface HistoricalComparisonProps {
  historicalData: HistoricalData[];
  currentData: any;
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
      efficiency: data.statistics.efficiency
    })),
    ...(currentData ? [{
      name: 'Current',
      energy: currentData.totalEnergyGenerated / 1000,
      impacts: currentData.totalImpacts,
      compaction: currentData.maxSoilCompaction,
      motorPower: currentData.avgMotorPower || 0,
      generatorPower: currentData.avgGeneratorPower || 0,
      battery: currentData.avgBatteryCapacity || 0,
      density: currentData.finalSoilDensity || 0,
      time: currentData.totalTime || 0,
      consumed: currentData.totalEnergyConsumed ? currentData.totalEnergyConsumed / 1000 : 0,
      efficiency: currentData.efficiency || 0
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
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-2xl border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
            <History className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Historical Comparison</h3>
            <p className="text-sm text-gray-500">Performance analysis across runs</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-medium">
            {comparisonData.length} Runs
          </span>
        </div>
      </div>
      
      {comparisonData.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <History className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No historical data available</p>
          <p className="text-sm mt-2">Run simulations to build comparison data</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Statistics Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-700">Best Energy</span>
              </div>
              <div className="text-2xl font-bold text-green-800">{energyStats.max.toFixed(2)} kJ</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Avg Energy</span>
              </div>
              <div className="text-2xl font-bold text-blue-800">{energyStats.avg.toFixed(2)} kJ</div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium text-amber-700">Most Impacts</span>
              </div>
              <div className="text-2xl font-bold text-amber-800">{impactStats.max.toFixed(0)}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Gauge className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Avg Efficiency</span>
              </div>
              <div className="text-2xl font-bold text-purple-800">{efficiencyStats.avg.toFixed(1)}%</div>
            </div>
          </div>
          {/* Energy Comparison */}
          <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-4 border border-slate-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-600" />
              Energy Generated (kJ)
            </h4>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: number) => [`${value.toFixed(2)} kJ`, 'Energy']}
                />
                <Bar dataKey="energy" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Power Systems Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                Motor vs Generator Power (W)
              </h4>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Area type="monotone" dataKey="motorPower" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="generatorPower" stackId="2" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-amber-600" />
                Battery Capacity (%)
              </h4>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Battery']}
                  />
                  <Line type="monotone" dataKey="battery" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4, fill: '#f59e0b' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Impacts & Compaction Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-4 border border-red-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Mountain className="w-4 h-4 text-red-600" />
                Total Impacts
              </h4>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [value, 'Impacts']}
                  />
                  <Bar dataKey="impacts" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Droplet className="w-4 h-4 text-green-600" />
                Soil Compaction (%)
              </h4>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Compaction']}
                  />
                  <Line type="monotone" dataKey="compaction" stroke="#22c55e" strokeWidth={2} dot={{ r: 4, fill: '#22c55e' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Detailed Metrics Table */}
          <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-4 border border-slate-200 overflow-x-auto">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Detailed Metrics
            </h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Run</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Time (s)</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Energy (kJ)</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Consumed (kJ)</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Density (kg/m³)</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Efficiency (%)</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((data, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-white transition-colors">
                    <td className="py-2 px-3 font-medium text-gray-900">{data.name}</td>
                    <td className="py-2 px-3 text-gray-600">{data.time.toFixed(1)}</td>
                    <td className="py-2 px-3 text-gray-600">{data.energy.toFixed(2)}</td>
                    <td className="py-2 px-3 text-gray-600">{data.consumed.toFixed(2)}</td>
                    <td className="py-2 px-3 text-gray-600">{data.density.toFixed(0)}</td>
                    <td className="py-2 px-3 text-gray-600">{data.efficiency.toFixed(1)}</td>
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
