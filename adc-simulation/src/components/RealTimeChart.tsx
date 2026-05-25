'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

interface RealTimeChartProps {
  data: Array<{
    time: number;
    value: number;
  }>;
  title: string;
  color: string;
  unit: string;
  maxDataPoints?: number;
  type?: 'line' | 'area';
}

export default function RealTimeChart({
  data,
  title,
  color,
  unit,
  maxDataPoints = 50,
  type = 'line'
}: RealTimeChartProps) {
  const chartData = data.slice(-maxDataPoints);
  
  return (
    <div className="cyber-glass rounded-2xl p-5 shadow-2xl transition-all duration-300 hover:border-slate-700/80">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-200 text-base tracking-wide">{title}</h3>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Live Telemetry</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-950/40 border border-slate-800/80 px-2.5 py-1.5 rounded-xl">
          <div 
            className="w-2 h-2 rounded-full"
            style={{ 
              backgroundColor: color,
              boxShadow: `0 0 6px ${color}`
            }}
          />
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{unit}</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        {type === 'area' ? (
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity="0.6" />
            <XAxis
              dataKey="time"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${Number(value).toFixed(0)}s`}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${Number(value).toFixed(0)}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                color: '#f8fafc'
              }}
              formatter={(value) => {
                const numeric = Array.isArray(value) ? Number(value[0] ?? 0) : Number(value ?? 0);
                return [`${numeric.toFixed(2)} ${unit}`, title];
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              fill={`url(#gradient-${color})`}
              dot={false}
              isAnimationActive={false}
              style={{
                filter: `drop-shadow(0 0 2px ${color}40)`
              }}
            />
          </AreaChart>
        ) : (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity="0.6" />
            <XAxis
              dataKey="time"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${Number(value).toFixed(0)}s`}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${Number(value).toFixed(0)}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                color: '#f8fafc'
              }}
              formatter={(value) => {
                const numeric = Array.isArray(value) ? Number(value[0] ?? 0) : Number(value ?? 0);
                return [`${numeric.toFixed(2)} ${unit}`, title];
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2, fill: 'white' }}
              isAnimationActive={false}
              style={{
                filter: `drop-shadow(0 0 2px ${color}40)`
              }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
