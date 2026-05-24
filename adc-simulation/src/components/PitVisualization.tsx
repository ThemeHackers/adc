'use client';

import React from 'react';

interface PitVisualizationProps {
  height: number;
  state: string;
  soilCompaction: number;
  viewMode?: '2d' | '3d';
  onPendulumClick?: () => void;
  onSoilClick?: () => void;
  onHeightClick?: () => void;
  onStateClick?: () => void;
  onCompactionClick?: () => void;
}

export default function PitVisualization({ 
  height, 
  state, 
  soilCompaction,
  viewMode = '3d',
  onPendulumClick,
  onSoilClick,
  onHeightClick,
  onStateClick,
  onCompactionClick
}: PitVisualizationProps) {
  const is3d = viewMode === '3d';
  const maxHeight = 15;
  const clampedHeight = Math.max(0, Math.min(height, maxHeight));
  const heightRatio = clampedHeight / maxHeight;
  const compactedRatio = Math.max(0, Math.min(soilCompaction, 100)) / 100;
  const sceneWidth = 1000;
  const sceneHeight = 580;
  const bobX = is3d ? 520 : 500;
  const topAnchorY = 76;
  const groundY = is3d ? 420 : 412;
  const travelDistance = 240;
  const bobRadius = is3d ? 46 : 42;
  const bobY = groundY - (heightRatio * travelDistance);
  const ropeBottomY = Math.max(topAnchorY + 18, bobY - bobRadius + (is3d ? 4 : 8));
  const soilSurfaceY = (is3d ? 414 : 408) - (compactedRatio * (is3d ? 118 : 110));
  const crackCount = Math.max(0, Math.min(6, Math.round(compactedRatio * 6)));

  const stateMeta = (() => {
    switch (state) {
      case 'CHARGING':
        return {
          label: 'Charging',
          color: '#22c55e',
          glow: 'rgba(34, 197, 94, 0.35)',
          accent: 'from-emerald-400 to-lime-400'
        };
      case 'DISCHARGING':
        return {
          label: 'Discharging',
          color: '#3b82f6',
          glow: 'rgba(59, 130, 246, 0.35)',
          accent: 'from-sky-400 to-blue-400'
        };
      case 'IMPACT':
        return {
          label: 'Impact',
          color: '#ef4444',
          glow: 'rgba(239, 68, 68, 0.4)',
          accent: 'from-rose-400 to-red-500'
        };
      default:
        return {
          label: 'Idle',
          color: '#94a3b8',
          glow: 'rgba(148, 163, 184, 0.25)',
          accent: 'from-slate-300 to-slate-500'
        };
    }
  })();
  
  const pendulumColor = stateMeta.color;
  
  return (
    <div className={`relative flex h-full min-h-[640px] flex-col overflow-hidden rounded-2xl border text-white shadow-2xl ${is3d ? 'border-slate-200 bg-slate-950' : 'border-slate-300 bg-slate-900'}`}>
      <div className={`absolute inset-0 ${is3d ? 'bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.22),transparent_32%),linear-gradient(180deg,#0f172a_0%,#0b1b2f_42%,#1f2937_100%)]' : 'bg-[radial-gradient(circle_at_top,rgba(125,211,252,0.16),transparent_30%),linear-gradient(180deg,#111827_0%,#172554_45%,#0f172a_100%)]'}`} />
      <div className={`absolute inset-0 opacity-30 ${is3d ? 'bg-[linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:40px_40px]' : 'bg-[linear-gradient(rgba(125,211,252,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.10)_1px,transparent_1px)] bg-[size:32px_32px]'}`} />
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-sky-300/25 to-transparent" />

      <div className="relative flex-[1.2] min-h-[420px]">
        <svg
          viewBox={`0 0 ${sceneWidth} ${sceneHeight}`}
          className="absolute inset-0 h-full w-full"
          role="img"
          aria-label="Live pendulum and soil visualization"
        >
        <defs>
          <linearGradient id="skyGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.22" />
            <stop offset="55%" stopColor="#0f172a" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#1e293b" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="soilGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#c08457" />
            <stop offset="48%" stopColor="#8b5a2b" />
            <stop offset="100%" stopColor="#5b3417" />
          </linearGradient>
          <linearGradient id="compactedSoilGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#8b5a2b" />
            <stop offset="100%" stopColor="#42210b" />
          </linearGradient>
          <linearGradient id="ropeGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>
          <linearGradient id="bobGradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor={pendulumColor} />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.35" />
          </linearGradient>
          <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#020617" floodOpacity="0.5" />
          </filter>
          <filter id="deepShadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="18" stdDeviation="16" floodColor="#020617" floodOpacity="0.55" />
          </filter>
        </defs>

        <rect x="0" y="0" width={sceneWidth} height={sceneHeight} fill="url(#skyGradient)" />

        <ellipse cx={is3d ? 540 : 500} cy="110" rx={is3d ? 110 : 92} ry={is3d ? 42 : 36} fill={stateMeta.glow} opacity="0.9" />

        {is3d && (
          <g opacity="0.9">
            <path d="M 148 405 L 198 422 L 184 550 L 132 528 Z" fill="#5b3417" opacity="0.68" />
            <path d="M 802 405 L 852 422 L 840 550 L 786 528 Z" fill="#2f1d0d" opacity="0.8" />
            <path d="M 180 390 L 820 390 L 852 422 L 198 422 Z" fill="#f59e0b" opacity="0.12" />
          </g>
        )}

        <path
          d={is3d ? 'M 120 394 L 880 394 L 840 446 L 160 446 Z' : 'M 120 392 L 880 392 L 820 440 L 180 440 Z'}
          fill="#0f172a"
          fillOpacity="0.2"
        />

        <path
          d={is3d ? 'M 160 388 L 840 388 L 800 548 L 200 548 Z' : 'M 180 390 L 820 390 L 780 548 L 220 548 Z'}
          fill="url(#soilGradient)"
          opacity="0.96"
        />

        {is3d ? (
          <>
            <path
              d={`M 200 ${soilSurfaceY} L 800 ${soilSurfaceY} L 774 548 L 226 548 Z`}
              fill="url(#compactedSoilGradient)"
              opacity={0.58 + compactedRatio * 0.32}
            />
            <path
              d={`M 800 ${soilSurfaceY} L 844 ${soilSurfaceY + 22} L 818 548 L 774 548 Z`}
              fill="#3f230f"
              opacity="0.8"
            />
            <path
              d={`M 200 ${soilSurfaceY} L 174 ${soilSurfaceY + 18} L 200 548 L 226 548 Z`}
              fill="#6b3f1f"
              opacity="0.8"
            />
          </>
        ) : (
          <path
            d={`M 220 ${soilSurfaceY} L 780 ${soilSurfaceY} L 760 548 L 240 548 Z`}
            fill="url(#compactedSoilGradient)"
            opacity={0.55 + compactedRatio * 0.35}
          />
        )}

        <path
          d={is3d ? 'M 160 388 L 840 388' : 'M 180 390 L 820 390'}
          stroke="#f8fafc"
          strokeOpacity="0.5"
          strokeWidth="4"
        />

        <path
          d={is3d ? 'M 200 388 L 800 388 L 774 548 L 226 548 Z' : 'M 220 390 L 780 390 L 760 548 L 240 548 Z'}
          fill="none"
          stroke="#facc15"
          strokeOpacity={0.2 + compactedRatio * 0.15}
          strokeWidth="3"
        />

        {Array.from({ length: 5 }).map((_, index) => {
          const y = 430 + index * 23;
          return (
            <line
              key={index}
              x1={is3d ? '230' : '250'}
              x2={is3d ? '770' : '750'}
              y1={y}
              y2={y}
              stroke="#fde68a"
              strokeOpacity={0.08 + compactedRatio * 0.05}
              strokeWidth="2"
            />
          );
        })}

        {Array.from({ length: crackCount }).map((_, index) => {
          const startX = (is3d ? 236 : 255) + index * 90;
          return (
            <path
              key={index}
              d={`M ${startX} 392 L ${startX + 12} ${410 + index * 4} L ${startX + 4} ${432 + index * 3}`}
              fill="none"
              stroke="#2b1707"
              strokeOpacity="0.55"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}

        <line
          x1={bobX}
          y1={topAnchorY}
          x2={bobX}
          y2={ropeBottomY}
          stroke="url(#ropeGradient)"
          strokeWidth={is3d ? '12' : '10'}
          strokeLinecap="round"
          opacity="0.95"
        />

        <line
          x1={bobX}
          y1={topAnchorY}
          x2={bobX}
          y2={ropeBottomY}
          stroke="#0f172a"
          strokeOpacity="0.45"
          strokeWidth={is3d ? '3' : '2'}
          strokeLinecap="round"
        />

        <circle cx={bobX} cy={topAnchorY} r="10" fill="#e2e8f0" stroke="#334155" strokeWidth="4" />

        <g transform={is3d ? `translate(12, 6)` : 'translate(0, 0)'}>
          <ellipse
            cx={bobX + (is3d ? 12 : 0)}
            cy={bobY + (is3d ? 18 : 16)}
            rx={bobRadius + 8}
            ry={bobRadius * 0.55}
            fill="#020617"
            fillOpacity={is3d ? '0.45' : '0.25'}
            filter="url(#deepShadow)"
          />
          <circle
            cx={bobX}
            cy={bobY}
            r={bobRadius}
            fill="url(#bobGradient)"
            stroke={pendulumColor}
            strokeWidth="6"
            filter="url(#softShadow)"
            opacity="0.98"
            className="cursor-pointer"
            onClick={onPendulumClick}
          />
        </g>

        <circle
          cx={bobX - 12}
          cy={bobY - 12}
          r="14"
          fill="#ffffff"
          fillOpacity="0.2"
        />

        {state === 'IMPACT' && (
          <g>
            <circle cx={bobX + (is3d ? 10 : 0)} cy={groundY - 6} r={is3d ? '104' : '92'} fill="none" stroke="#f87171" strokeOpacity="0.75" strokeWidth="5" />
            <circle cx={bobX + (is3d ? 10 : 0)} cy={groundY - 6} r={is3d ? '148' : '132'} fill="none" stroke="#fb7185" strokeOpacity="0.35" strokeWidth="3" />
          </g>
        )}

          <rect x={is3d ? '108' : '116'} y="150" width="16" height="260" rx="8" fill="#0f172a" fillOpacity="0.45" />
        {Array.from({ length: 6 }).map((_, index) => {
          const markHeight = 150 + index * 52;
          return (
            <g key={index}>
                <line x1={is3d ? '102' : '110'} x2={is3d ? '144' : '150'} y1={markHeight} y2={markHeight} stroke="#cbd5e1" strokeWidth="3" opacity="0.8" />
                <text x={is3d ? '84' : '92'} y={markHeight + 5} fill="#e2e8f0" fontSize="18" textAnchor="end" opacity="0.9">
                {maxHeight - index * 3}m
              </text>
            </g>
          );
        })}

          <text x="500" y="36" fill="#f8fafc" fontSize="22" fontWeight="700" textAnchor="middle" opacity="0.95">
            {is3d ? '3D depth view' : '2D overview'} · {clampedHeight.toFixed(2)}m
        </text>

          <text x="500" y="62" fill="#cbd5e1" fontSize="13" textAnchor="middle" opacity="0.9">
            {is3d ? 'Enhanced depth and shadow cues for presentation mode' : 'Clean analytical view for precise inspection'}
        </text>
        </svg>
      </div>

        <div className="relative border-t border-white/10 bg-slate-950/80 px-4 py-4 backdrop-blur-md sm:px-5">
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          <button
            type="button"
            onClick={onStateClick}
              className="min-h-[116px] rounded-2xl border border-white/10 bg-white/5 p-2.5 text-left transition-transform hover:-translate-y-0.5 hover:bg-white/10 sm:p-3"
            title="Click for state details"
          >
              <div className="text-[10px] uppercase tracking-[0.28em] text-slate-400">State</div>
              <div className="mt-2 flex flex-col gap-1.5">
                <div className="text-lg sm:text-xl font-extrabold leading-none tracking-tight" style={{ color: pendulumColor }}>
                {state}
              </div>
                <div className="inline-flex w-fit rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-slate-900" style={{ backgroundColor: pendulumColor }}>
                {stateMeta.label}
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={onHeightClick}
            className="rounded-2xl border border-white/10 bg-white/5 p-2.5 text-left transition-transform hover:-translate-y-0.5 hover:bg-white/10 sm:p-3"
            title="Click for height details"
          >
            <div className="text-[10px] uppercase tracking-[0.28em] text-slate-400">Height</div>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-white leading-none">
              {clampedHeight.toFixed(2)}<span className="ml-1 text-sm sm:text-base font-semibold text-slate-300">m</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${stateMeta.accent} transition-all duration-300`}
                style={{ width: `${heightRatio * 100}%` }}
              />
            </div>
          </button>

          <button
            type="button"
            onClick={onCompactionClick}
            className="rounded-2xl border border-white/10 bg-white/5 p-2.5 text-left transition-transform hover:-translate-y-0.5 hover:bg-white/10 sm:p-3"
            title="Click for compaction details"
          >
            <div className="text-[10px] uppercase tracking-[0.28em] text-slate-400">Soil Compaction</div>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-amber-300 leading-none">
              {soilCompaction.toFixed(1)}<span className="ml-1 text-sm sm:text-base font-semibold text-slate-300">%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${stateMeta.accent} transition-all duration-300`}
                style={{ width: `${Math.max(0, Math.min(100, soilCompaction))}%` }}
              />
            </div>
          </button>
        </div>

        <div className="mt-2.5 rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2.5 text-xs text-slate-300 sm:px-4 sm:py-3 sm:text-sm">
          <button
            type="button"
            onClick={onSoilClick}
            className="inline-flex items-center gap-2 font-medium text-white transition-colors hover:text-amber-200"
            title="Click for soil details"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: pendulumColor }} />
            Soil layer cutaway
          </button>
          <span className="mx-2 text-slate-500">•</span>
          <span>Compaction increases visible density.</span>
        </div>
      </div>
    </div>
  );
}
