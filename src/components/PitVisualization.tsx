'use client';

import React from 'react';

interface PitVisualizationProps {
  height: number;
  state: string;
  soilCompaction: number;
  soilDensity: number;
  impactCount: number;
  tamperVelocity: number;
  solarPower: number;
  motorPower: number;
  generatorPower: number;
  loadPower: number;
  batteryCapacity: number;
  batteryVoltage: number;
  batteryCurrent: number;
  potentialEnergy: number;
  kineticEnergy: number;
  totalEnergy: number;
  viewMode?: '2d' | '3d';
  tamperMass: number;
  impactForce?: number;
  craterDepth?: number;
  contactPressure?: number;
  onTamperClick?: () => void;
  onSoilClick?: () => void;
  onHeightClick?: () => void;
  onStateClick?: () => void;
  onCompactionClick?: () => void;
}

export default function PitVisualization({
  height,
  state,
  soilCompaction,
  soilDensity,
  impactCount,
  tamperVelocity,
  solarPower,
  motorPower,
  generatorPower,
  loadPower,
  batteryCapacity,
  batteryVoltage,
  batteryCurrent,
  potentialEnergy,
  kineticEnergy,
  totalEnergy,
  viewMode = '3d',
  tamperMass,
  impactForce = 0,
  craterDepth = 0,
  contactPressure = 0,
  onTamperClick,
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
  const batteryRatio = Math.max(0, Math.min(batteryCapacity, 100)) / 100;
  const sceneWidth = 1000;
  const sceneHeight = 580;
  const bobX = is3d ? 520 : 500;
  const topAnchorY = 76;
  const groundY = is3d ? 420 : 412;
  const travelDistance = 240;
  const bobRadius = is3d ? 46 : 42;
  const bobY = groundY - (heightRatio * travelDistance);
  const soilSurfaceY = (is3d ? 414 : 408) - (compactedRatio * (is3d ? 118 : 110));
  const crackCount = Math.max(0, Math.min(6, Math.round(compactedRatio * 6)));

  const cylinderHeight = bobRadius * 1.5;
  const ryRatio = is3d ? 0.45 : 0.25;
  const ropeBottomY = Math.max(topAnchorY + 18, bobY - cylinderHeight / 2);

  const stateMeta = (() => {
    switch (state) {
      case 'CHARGING':
        return {
          label: 'Charging',
          color: '#10b981',
          glow: 'rgba(16, 185, 129, 0.25)',
          accent: 'from-emerald-400 to-teal-400'
        };
      case 'DISCHARGING':
        return {
          label: 'Discharging',
          color: '#3b82f6',
          glow: 'rgba(59, 130, 246, 0.25)',
          accent: 'from-sky-400 to-blue-400'
        };
      case 'IMPACT':
        return {
          label: 'Impact/DC',
          color: '#f43f5e',
          glow: 'rgba(244, 63, 94, 0.35)',
          accent: 'from-rose-400 to-red-500'
        };
      default:
        return {
          label: 'Idle',
          color: '#64748b',
          glow: 'rgba(100, 116, 139, 0.15)',
          accent: 'from-slate-400 to-slate-500'
        };
    }
  })();

  const tamperColor = stateMeta.color;

  return (
    <div className={`relative flex h-auto flex-col rounded-2xl border text-slate-100 shadow-2xl cyber-glass border-slate-800 bg-slate-950/30 overflow-hidden`}>
      {/* Background glow highlights */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${is3d ? 'bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.08),transparent_40%)]' : 'bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.06),transparent_45%)]'}`} />
      <div className="absolute inset-0 opacity-15 bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative flex-[1.2] min-h-[320px] sm:min-h-[420px]">
        <svg
          viewBox={`0 0 ${sceneWidth} ${sceneHeight}`}
          className="absolute inset-0 h-full w-full"
          role="img"
          aria-label="Live tamper and soil visualization"
        >
        <defs>
          <style>{`
            @keyframes rotate-pulley-ccw {
              from { transform: rotate(360deg); }
              to { transform: rotate(0deg); }
            }
            @keyframes rotate-pulley-cw {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes solar-flow {
              to { stroke-dashoffset: -20; }
            }
            @keyframes gen-flow {
              to { stroke-dashoffset: 20; }
            }
            @keyframes shockwave-expand {
              0% { rx: 10px; ry: 2px; opacity: 1; stroke-width: 6px; }
              100% { rx: 200px; ry: 40px; opacity: 0; stroke-width: 0.5px; }
            }
            @keyframes ejecta-left {
              0% { transform: translate(0, 0) scale(1); opacity: 1; }
              100% { transform: translate(-80px, -50px) scale(0.2); opacity: 0; }
            }
            @keyframes ejecta-right {
              0% { transform: translate(0, 0) scale(1); opacity: 1; }
              100% { transform: translate(80px, -50px) scale(0.2); opacity: 0; }
            }
            .animate-pulley-ccw {
              animation: rotate-pulley-ccw 1.5s linear infinite;
            }
            .animate-pulley-cw {
              animation: rotate-pulley-cw 1s linear infinite;
            }
            .flow-solar {
              animation: solar-flow 0.8s linear infinite;
            }
            .flow-gen {
              animation: gen-flow 0.6s linear infinite;
            }
            .shockwave-anim {
              animation: shockwave-expand 0.6s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
            }
            .ejecta-l {
              animation: ejecta-left 0.45s ease-out infinite;
            }
            .ejecta-r {
              animation: ejecta-right 0.45s ease-out infinite;
            }
          `}</style>
          <linearGradient id="skyGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#0f172a" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="soilGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#78350f" />
            <stop offset="48%" stopColor="#451a03" />
            <stop offset="100%" stopColor="#1e0b00" />
          </linearGradient>
          <linearGradient id="compactedSoilGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>
          <linearGradient id="ropeGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <linearGradient id="cylinderBodyGradient" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={tamperColor} stopOpacity="0.95" />
            <stop offset="25%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="65%" stopColor={tamperColor} />
            <stop offset="100%" stopColor="#020617" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="cylinderTopGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
            <stop offset="100%" stopColor={tamperColor} />
          </linearGradient>
          <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#020617" floodOpacity="0.7" />
          </filter>
          <filter id="deepShadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="18" stdDeviation="16" floodColor="#020617" floodOpacity="0.8" />
          </filter>
        </defs>

        <rect x="0" y="0" width={sceneWidth} height={sceneHeight} fill="url(#skyGradient)" />

        {/* Top Anchor Glow */}
        <ellipse cx={is3d ? 540 : 500} cy="110" rx={is3d ? 110 : 92} ry={is3d ? 42 : 36} fill={stateMeta.glow} opacity="0.8" />

        {is3d && (
          <g opacity="0.9">
            <path d="M 148 405 L 198 422 L 184 550 L 132 528 Z" fill="#2d170b" opacity="0.68" />
            <path d="M 802 405 L 852 422 L 840 550 L 786 528 Z" fill="#1e1106" opacity="0.8" />
            <path d="M 180 390 L 820 390 L 852 422 L 198 422 Z" fill="#f59e0b" opacity="0.08" />
          </g>
        )}

        {/* Soil shadow projection */}
        <path
          d={is3d ? 'M 120 394 L 880 394 L 840 446 L 160 446 Z' : 'M 120 392 L 880 392 L 820 440 L 180 440 Z'}
          fill="#020617"
          fillOpacity="0.5"
        />

        {/* Geological layers (soil background) */}
        <path
          d={is3d ? 'M 160 388 L 840 388 L 800 548 L 200 548 Z' : 'M 180 390 L 820 390 L 780 548 L 220 548 Z'}
          fill="url(#soilGradient)"
          opacity="0.95"
        />

        {/* Compacted Area overlay (glowing) */}
        {is3d ? (
          <>
            <path
              d={`M 200 ${soilSurfaceY} L 800 ${soilSurfaceY} L 774 548 L 226 548 Z`}
              fill="url(#compactedSoilGradient)"
              opacity={0.3 + compactedRatio * 0.5}
            />
            {/* Edge highlights for 3D depth */}
            <path
              d={`M 800 ${soilSurfaceY} L 844 ${soilSurfaceY + 22} L 818 548 L 774 548 Z`}
              fill="#2d1303"
              opacity="0.8"
            />
            <path
              d={`M 200 ${soilSurfaceY} L 174 ${soilSurfaceY + 18} L 200 548 L 226 548 Z`}
              fill="#542005"
              opacity="0.8"
            />
          </>
        ) : (
          <path
            d={`M 220 ${soilSurfaceY} L 780 ${soilSurfaceY} L 760 548 L 240 548 Z`}
            fill="url(#compactedSoilGradient)"
            opacity={0.3 + compactedRatio * 0.5}
          />
        )}

        {/* Glowing soil surface outline */}
        <path
          d={is3d ? `M 200 ${soilSurfaceY} L 800 ${soilSurfaceY}` : `M 220 ${soilSurfaceY} L 780 ${soilSurfaceY}`}
          stroke="#f59e0b"
          strokeOpacity={0.15 + compactedRatio * 0.45}
          strokeWidth="3.5"
          style={{ filter: `drop-shadow(0 0 4px rgba(245,158,11, ${0.2 + compactedRatio * 0.6}))` }}
        />

        {/* Original baseline outline */}
        <path
          d={is3d ? 'M 160 388 L 840 388' : 'M 180 390 L 820 390'}
          stroke="#475569"
          strokeOpacity="0.4"
          strokeWidth="3"
        />

        {/* Compaction Grid lines */}
        {Array.from({ length: 5 }).map((_, index) => {
          const y = 430 + index * 23;
          return (
            <line
              key={index}
              x1={is3d ? '230' : '250'}
              x2={is3d ? '770' : '750'}
              y1={y}
              y2={y}
              stroke="#fbbf24"
              strokeOpacity={0.06 + compactedRatio * 0.08}
              strokeWidth="1.5"
            />
          );
        })}

        {/* Compaction Crack paths */}
        {Array.from({ length: crackCount }).map((_, index) => {
          const startX = (is3d ? 236 : 255) + index * 90;
          return (
            <path
              key={index}
              d={`M ${startX} 392 L ${startX + 12} ${410 + index * 4} L ${startX + 4} ${432 + index * 3}`}
              fill="none"
              stroke="#1e0b00"
              strokeOpacity="0.8"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}

        {/* Solar HUD (Top-Left) */}
        <g transform="translate(40, 40)" opacity="0.85">
          <rect x="0" y="0" width="135" height="44" rx="8" fill="#030712" fillOpacity="0.75" stroke="#10b981" strokeWidth="1.5" style={{ filter: 'drop-shadow(0 0 6px rgba(16,185,129,0.15))' }} />
          <g transform="translate(12, 12)">
            {/* Grid Icon */}
            <rect x="0" y="0" width="8" height="8" fill="#10b981" rx="1.5" />
            <rect x="11" y="0" width="8" height="8" fill="#10b981" rx="1.5" />
            <rect x="0" y="11" width="8" height="8" fill="#10b981" rx="1.5" />
            <rect x="11" y="11" width="8" height="8" fill="#10b981" rx="1.5" />
          </g>
          <text x="38" y="20" fill="#cbd5e1" fontSize="9" fontWeight="900" letterSpacing="0.08em">SOLAR ARRAY</text>
          <text x="38" y="32" fill="#10b981" fontSize="10" fontWeight="bold" fontFamily="var(--font-mono), monospace">{solarPower.toFixed(0)} W</text>
        </g>

        {/* Battery HUD (Top-Right) */}
        <g transform="translate(825, 40)" opacity="0.85">
          <rect x="0" y="0" width="135" height="44" rx="8" fill="#030712" fillOpacity="0.75" stroke="#8b5cf6" strokeWidth="1.5" style={{ filter: 'drop-shadow(0 0 6px rgba(139,92,246,0.15))' }} />
          <g transform="translate(12, 14)">
            {/* Battery Icon */}
            <rect x="0" y="0" width="18" height="11" fill="none" stroke="#8b5cf6" strokeWidth="1.5" rx="2" />
            <rect x="20" y="3" width="2" height="5" fill="#8b5cf6" rx="0.5" />
            <rect x="2.5" y="2" width={13 * (batteryCapacity / 100)} height="7" fill="#8b5cf6" />
          </g>
          <text x="40" y="20" fill="#cbd5e1" fontSize="9" fontWeight="900" letterSpacing="0.08em">BATTERY BANK</text>
          <text x="40" y="32" fill="#8b5cf6" fontSize="10" fontWeight="bold" fontFamily="var(--font-mono), monospace">{batteryCapacity.toFixed(1)}%</text>
        </g>

        {/* Solar laser path wire */}
        <path d={`M 175 62 L 320 62 L ${bobX - 30} ${topAnchorY}`} fill="none" stroke="#1e293b" strokeWidth="2.5" />
        {state === 'CHARGING' && (
          <path
            d={`M 175 62 L 320 62 L ${bobX - 30} ${topAnchorY}`}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeDasharray="8, 8"
            className="flow-solar"
          />
        )}

        {/* Battery laser path wire */}
        <path d={`M ${bobX + 30} ${topAnchorY} L 680 62 L 825 62`} fill="none" stroke="#1e293b" strokeWidth="2.5" />
        {state === 'DISCHARGING' && (
          <path
            d={`M ${bobX + 30} ${topAnchorY} L 680 62 L 825 62`}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2.5"
            strokeDasharray="8, 8"
            className="flow-gen"
            style={{ direction: 'rtl' }}
          />
        )}

        {/* Hanging rope */}
        <line
          x1={bobX}
          y1={topAnchorY}
          x2={bobX}
          y2={ropeBottomY}
          stroke="url(#ropeGradient)"
          strokeWidth={is3d ? '10' : '8'}
          strokeLinecap="round"
          opacity="0.9"
        />

        <line
          x1={bobX}
          y1={topAnchorY}
          x2={bobX}
          y2={ropeBottomY}
          stroke="#020617"
          strokeOpacity="0.5"
          strokeWidth={is3d ? '2' : '1.5'}
          strokeLinecap="round"
        />

        {/* Winch Pulley Wheel with spokes and rotation */}
        <g
          className={state === 'CHARGING' ? 'animate-pulley-ccw' : state === 'DISCHARGING' ? 'animate-pulley-cw' : ''}
          style={{ transformOrigin: `${bobX}px ${topAnchorY}px` }}
        >
          <circle cx={bobX} cy={topAnchorY} r="18" fill="#1e293b" stroke="#475569" strokeWidth="3" />
          <circle cx={bobX} cy={topAnchorY} r="14" fill="#334155" />
          {/* Wheel spokes */}
          <line x1={bobX - 14} y1={topAnchorY} x2={bobX + 14} y2={topAnchorY} stroke="#475569" strokeWidth="2.5" />
          <line x1={bobX} y1={topAnchorY - 14} x2={bobX} y2={topAnchorY + 14} stroke="#475569" strokeWidth="2.5" />
          <circle cx={bobX} cy={topAnchorY} r="4" fill="#0f172a" />
        </g>

        {/* Tamper weight cylinder */}
        <g transform={is3d ? `translate(12, 6)` : 'translate(0, 0)'}>
          {/* Glowing bottom shadow */}
          <ellipse
            cx={bobX + (is3d ? 12 : 0)}
            cy={bobY + cylinderHeight / 2 + (is3d ? 12 : 8)}
            rx={bobRadius + 8}
            ry={bobRadius * ryRatio * 1.2}
            fill="#020617"
            fillOpacity={is3d ? '0.6' : '0.4'}
            filter="url(#deepShadow)"
          />
          {/* Cylinder Body */}
          <path
            d={`M ${bobX - bobRadius} ${bobY - cylinderHeight / 2}
                L ${bobX - bobRadius} ${bobY + cylinderHeight / 2}
                A ${bobRadius} ${bobRadius * ryRatio} 0 0 0 ${bobX + bobRadius} ${bobY + cylinderHeight / 2}
                L ${bobX + bobRadius} ${bobY - cylinderHeight / 2}
                A ${bobRadius} ${bobRadius * ryRatio} 0 0 0 ${bobX - bobRadius} ${bobY - cylinderHeight / 2} Z`}
            fill="url(#cylinderBodyGradient)"
            stroke={tamperColor}
            strokeWidth="4"
            filter="url(#softShadow)"
            opacity="0.98"
            className="cursor-pointer"
            onClick={onTamperClick}
            style={{
              filter: state === 'IMPACT' ? `drop-shadow(0 0 8px ${tamperColor})` : 'none',
              transition: 'stroke 0.3s ease, filter 0.3s ease'
            }}
          />
          {/* Cylinder Top Face */}
          <ellipse
            cx={bobX}
            cy={bobY - cylinderHeight / 2}
            rx={bobRadius}
            ry={bobRadius * ryRatio}
            fill="url(#cylinderTopGradient)"
            stroke={tamperColor}
            strokeWidth="2"
            className="cursor-pointer"
            onClick={onTamperClick}
          />
          {/* Top Face Inner Rim (Glowing effect) */}
          <ellipse
            cx={bobX}
            cy={bobY - cylinderHeight / 2}
            rx={bobRadius - 3}
            ry={(bobRadius - 3) * ryRatio}
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.25"
            strokeWidth="1.5"
            className="pointer-events-none"
          />
        </g>

        {/* Animated Impact Shockwaves and Soil Ejecta Splash */}
        {state === 'IMPACT' && (
          <g>
            <ellipse cx={bobX + (is3d ? 10 : 0)} cy={groundY} rx="120" ry="24" fill="none" stroke="#f43f5e" strokeWidth="4" className="shockwave-anim" style={{ transformOrigin: `${bobX + (is3d ? 10 : 0)}px ${groundY}px` }} />
            <ellipse cx={bobX + (is3d ? 10 : 0)} cy={groundY} rx="120" ry="24" fill="none" stroke="#f43f5e" strokeWidth="2" className="shockwave-anim" style={{ transformOrigin: `${bobX + (is3d ? 10 : 0)}px ${groundY}px`, animationDelay: '0.2s' }} />

            {/* Soil Ejecta Dust Sparks */}
            <g className="ejecta-l" style={{ transformOrigin: `${bobX - 20}px ${groundY - 10}px` }}>
              <circle cx={bobX - 30} cy={groundY - 8} r="5.5" fill="#b45309" />
              <circle cx={bobX - 55} cy={groundY - 20} r="4" fill="#78350f" />
              <circle cx={bobX - 75} cy={groundY - 32} r="2.5" fill="#451a03" />
            </g>
            <g className="ejecta-r" style={{ transformOrigin: `${bobX + 40}px ${groundY - 10}px` }}>
              <circle cx={bobX + 30} cy={groundY - 8} r="5.5" fill="#b45309" />
              <circle cx={bobX + 55} cy={groundY - 20} r="4" fill="#78350f" />
              <circle cx={bobX + 75} cy={groundY - 32} r="2.5" fill="#451a03" />
            </g>
          </g>
        )}

        {/* Left vertical rule */}
        <rect x={is3d ? '108' : '116'} y="150" width="12" height="260" rx="6" fill="#020617" fillOpacity="0.6" />
        {Array.from({ length: 6 }).map((_, index) => {
          const markHeight = 150 + index * 52;
          return (
            <g key={index}>
                <line x1={is3d ? '102' : '110'} x2={is3d ? '140' : '146'} y1={markHeight} y2={markHeight} stroke="#475569" strokeWidth="2" opacity="0.8" />
                <text x={is3d ? '84' : '92'} y={markHeight + 5} fill="#94a3b8" fontSize="15" fontWeight="bold" fontFamily="var(--font-mono), monospace" textAnchor="end" opacity="0.9">
                {maxHeight - index * 3}m
              </text>
            </g>
          );
        })}

        {/* Visual Title */}
        <text x="500" y="36" fill="#f8fafc" fontSize="20" fontWeight="800" textAnchor="middle" opacity="0.95" letterSpacing="0.05em">
          {is3d ? '3D DEPTH VIEW' : '2D OVERVIEW'} · {clampedHeight.toFixed(2)}m
        </text>

        <text x="500" y="60" fill="#64748b" fontSize="11" fontWeight="bold" textAnchor="middle" opacity="0.9" letterSpacing="0.02em">
          {is3d ? 'ENHANCED GEOMETRICAL & DEPTH CUES' : 'ANALYTICAL PROJECTION PROFILE'}
        </text>
        </svg>
      </div>

      {/* Bottom metrics section */}
      <div className="relative border-t border-slate-800/80 bg-slate-950/70 px-4 py-4 backdrop-blur-md sm:px-5">
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          <button
            type="button"
            onClick={onStateClick}
            className="rounded-2xl border border-slate-800 bg-slate-900/30 p-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-900/50 hover:border-slate-700/50 cursor-pointer"
            title="Click for impact details"
          >
            <div className="text-[9px] uppercase tracking-[0.25em] text-slate-500 font-bold">Impact Force</div>
            <div className="mt-2 text-2xl font-black text-rose-500 leading-none" style={{ fontFamily: 'var(--font-mono), monospace' }}>
              {(impactForce / 1000).toFixed(1)}<span className="ml-0.5 text-xs font-semibold text-slate-400">kN</span>
            </div>
            <div className="mt-2 text-[10px] text-slate-400 font-mono">
              Crater: {(craterDepth * 100).toFixed(1)} cm
            </div>
          </button>

          <button
            type="button"
            onClick={onHeightClick}
            className="rounded-2xl border border-slate-800 bg-slate-900/30 p-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-900/50 hover:border-slate-700/50 cursor-pointer"
            title="Click for height details"
          >
            <div className="text-[9px] uppercase tracking-[0.25em] text-slate-500 font-bold">Fall Height</div>
            <div className="mt-2 text-2xl font-black text-slate-100 leading-none" style={{ fontFamily: 'var(--font-mono), monospace' }}>
              {clampedHeight.toFixed(2)}<span className="ml-0.5 text-xs font-semibold text-slate-400">m</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-900 p-0.5">
              <div className={`h-full rounded-full bg-gradient-to-r ${stateMeta.accent} transition-all duration-300`} style={{ width: `${heightRatio * 100}%` }} />
            </div>
          </button>

          <button
            type="button"
            onClick={onCompactionClick}
            className="rounded-2xl border border-slate-800 bg-slate-900/30 p-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-900/50 hover:border-slate-700/50 cursor-pointer"
            title="Click for compaction details"
          >
            <div className="text-[9px] uppercase tracking-[0.25em] text-slate-500 font-bold">Soil Compaction</div>
            <div className="mt-2 text-2xl font-black text-amber-400 leading-none" style={{ fontFamily: 'var(--font-mono), monospace' }}>
              {soilCompaction.toFixed(1)}<span className="ml-0.5 text-xs font-semibold text-slate-400">%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-900 p-0.5">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300" style={{ width: `${Math.max(0, Math.min(100, soilCompaction))}%` }} />
            </div>
          </button>

          <button
            type="button"
            onClick={onTamperClick}
            className="rounded-2xl border border-slate-800 bg-slate-900/30 p-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-900/50 hover:border-slate-700/50 cursor-pointer"
            title="Click for energy details"
          >
            <div className="text-[9px] uppercase tracking-[0.25em] text-slate-500 font-bold">Total Energy</div>
            <div className="mt-2 text-base font-black text-slate-100" style={{ fontFamily: 'var(--font-mono), monospace' }}>{(totalEnergy / 1000).toFixed(2)} kJ</div>
            <div className="text-[9px] sm:text-[10px] text-slate-350 font-semibold mt-1.5 flex flex-wrap gap-x-1.5 gap-y-0.5">
              <span>PE: {(potentialEnergy / 1000).toFixed(1)} kJ</span>
              <span className="text-slate-600">•</span>
              <span>KE: {(kineticEnergy / 1000).toFixed(1)} kJ</span>
            </div>
          </button>
        </div>

        <div className="mt-3 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-3">
            <div className="text-[9px] uppercase tracking-[0.25em] text-slate-500 font-bold">Battery Charge</div>
            <div className="mt-2 text-2xl font-black text-slate-100 leading-none" style={{ fontFamily: 'var(--font-mono), monospace' }}>{batteryCapacity.toFixed(1)}<span className="ml-0.5 text-xs font-semibold text-slate-400">%</span></div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-900 p-0.5">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-300" style={{ width: `${batteryRatio * 100}%` }} />
            </div>
            <div className="mt-2 text-[10px] text-slate-400 font-mono">{batteryVoltage.toFixed(0)}V · {batteryCurrent.toFixed(1)}A</div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-3">
            <div className="text-[9px] uppercase tracking-[0.25em] text-slate-500 font-bold">Grid Power</div>
            <div className="mt-2 text-base font-black text-slate-100" style={{ fontFamily: 'var(--font-mono), monospace' }}>Solar {solarPower.toFixed(0)}W</div>
            <div className="text-[9px] sm:text-[10px] text-slate-350 font-semibold mt-1.5 flex flex-wrap gap-x-1.5 gap-y-0.5">
              <span>Motor: {motorPower.toFixed(0)}W</span>
              <span className="text-slate-600">•</span>
              <span>Gen: {generatorPower.toFixed(0)}W</span>
            </div>
            <div className="text-[9px] sm:text-[10px] text-slate-400 font-medium mt-1">Load: {loadPower.toFixed(0)}W</div>
          </div>

          <button
            type="button"
            onClick={onTamperClick}
            className="rounded-2xl border border-slate-800 bg-slate-900/30 p-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-900/50 hover:border-slate-700/50 cursor-pointer"
            title="Click for tamper details"
          >
            <div className="text-[9px] uppercase tracking-[0.25em] text-slate-500 font-bold">Telemetry Velocity</div>
            <div className="mt-2 text-2xl font-black text-slate-100 leading-none" style={{ fontFamily: 'var(--font-mono), monospace' }}>{tamperVelocity.toFixed(2)}<span className="ml-0.5 text-xs font-semibold text-slate-400">m/s</span></div>
            <div className="text-[9px] sm:text-[10px] text-slate-350 font-semibold mt-1.5 flex flex-wrap gap-x-1.5 gap-y-0.5">
              <span>Mass: {tamperMass.toFixed(0)} kg</span>
              <span className="text-slate-600">•</span>
              <span>Impacts: {impactCount}</span>
            </div>
          </button>

          <button
            type="button"
            onClick={onSoilClick}
            className="rounded-2xl border border-slate-800 bg-slate-900/30 p-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-900/50 hover:border-slate-700/50 cursor-pointer"
            title="Click for soil details"
          >
            <div className="text-[9px] uppercase tracking-[0.25em] text-slate-500 font-bold">Soil Condition</div>
            <div className="mt-2 text-2xl font-black text-amber-400 leading-none" style={{ fontFamily: 'var(--font-mono), monospace' }}>{soilDensity.toFixed(0)}<span className="ml-0.5 text-xs font-semibold text-slate-400">kg/m³</span></div>
            <div className="mt-2 text-[10px] text-slate-400 font-medium">Compaction {soilCompaction.toFixed(1)}%</div>
          </button>
        </div>

        <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-xs text-slate-400 flex items-center justify-between flex-wrap gap-2">
          <button
            type="button"
            onClick={onSoilClick}
            className="inline-flex items-center gap-2 font-bold text-slate-300 transition-colors hover:text-amber-200 cursor-pointer"
            title="Click for soil details"
          >
            <span className="inline-block h-2 w-2 rounded-full animate-ping" style={{ backgroundColor: tamperColor }} />
            Soil layer cutaway analysis profile
          </button>
          <span>Compaction dynamically raises visible mass density.</span>
        </div>
      </div>
    </div>
  );
}
