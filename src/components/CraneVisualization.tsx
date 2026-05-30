'use client';

import React from 'react';
import { Shield, Settings, Info, Zap, Sun, Award } from 'lucide-react';

interface CraneVisualizationProps {
  height: number;
  state: string;
  maxHeight: number;
  tamperMass: number;
  soilCompaction: number;
  soilType: string;
  motorPower: number;
  generatorPower: number;
  solarPower: number;
}

export default function CraneVisualization({
  height,
  state,
  maxHeight = 15,
  tamperMass,
  soilCompaction,
  soilType = 'sand',
  motorPower,
  generatorPower,
  solarPower,
}: CraneVisualizationProps) {
  const maxH = maxHeight > 0 ? maxHeight : 15;
  const clampedHeight = Math.max(0, Math.min(height, maxH));
  const heightRatio = clampedHeight / maxH;
  const compactedRatio = Math.max(0, Math.min(soilCompaction, 100)) / 100;


  const width = 450;
  const heightTotal = 600;
  const groundY = 510;





  const travelDistance = 392;
  const weightHeight = 30;
  const weightY = (groundY - weightHeight) - heightRatio * travelDistance;



  const winchX = 120;
  const winchY = 445;
  const boomTipX = 350;
  const boomTipY = 75;


  const soilThemes = (() => {
    switch (soilType) {
      case 'clay':
        return {
          name: 'Clay',
          topColor: '#8a3a27',
          midColor: '#6e2b1c',
          botColor: '#4f1d12',
          glowColor: '#ef4444',
        };
      case 'gravel':
        return {
          name: 'Gravel',
          topColor: '#6b7280',
          midColor: '#4b5563',
          botColor: '#1f2937',
          glowColor: '#9ca3af',
        };
      case 'loam':
        return {
          name: 'Loam',
          topColor: '#78350f',
          midColor: '#5c220a',
          botColor: '#361105',
          glowColor: '#f59e0b',
        };
      case 'sand':
      default:
        return {
          name: 'Sand',
          topColor: '#d97706',
          midColor: '#b45309',
          botColor: '#78350f',
          glowColor: '#fbbf24',
        };
    }
  })();


  const maxCraterDepth = 18;
  const currentCraterDepth = compactedRatio * maxCraterDepth;


  const stateMeta = (() => {
    switch (state) {
      case 'CHARGING':
        return {
          label: 'Lifting (CHARGING)',
          color: '#10b981',
          glow: 'rgba(16, 185, 129, 0.45)',
          class: 'text-emerald-400',
          ledClass: 'charging-pulse',
        };
      case 'DISCHARGING':
        return {
          label: 'Regenerating (DISCHARGING)',
          color: '#3b82f6',
          glow: 'rgba(59, 130, 246, 0.45)',
          class: 'text-blue-400',
          ledClass: 'discharging-pulse',
        };
      case 'IMPACT':
        return {
          label: 'Impact (IMPACT)',
          color: '#f43f5e',
          glow: 'rgba(244, 63, 94, 0.6)',
          class: 'text-rose-400',
          ledClass: 'impact-flash',
        };
      case 'IDLE':
      default:
        return {
          label: 'Standby (IDLE)',
          color: '#64748b',
          glow: 'rgba(100, 116, 139, 0.25)',
          class: 'text-slate-400',
          ledClass: 'idle-steady',
        };
    }
  })();

  return (
    <div className="cyber-glass rounded-2xl p-4 shadow-2xl relative border border-slate-800 bg-slate-950/30 overflow-hidden flex flex-col h-full min-h-[780px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.05),transparent_45%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div>
          <h3 className="font-extrabold text-slate-200 tracking-wide uppercase text-xs flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75`} style={{ backgroundColor: stateMeta.color }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: stateMeta.color }} />
            </span>
            Compactor Rig Simulator
          </h3>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Heavy Machinery Digital Twin</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] bg-slate-900 border border-slate-800 px-2 py-1 rounded-md text-slate-400 font-semibold uppercase tracking-wider">
            Soil: {soilThemes.name}
          </span>
        </div>
      </div>

      {/* Vector Canvas Container */}
      <div className="relative flex-1 w-full min-h-[600px] bg-slate-950/20 rounded-xl border border-slate-900/60 overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${heightTotal}`}
          className="absolute inset-0 w-full h-full"
          role="img"
          aria-label="Crawler crane compaction simulation vector display"
        >
          <defs>
            <style>{`
              @keyframes spin-ccw {
                from { transform: rotate(360deg); }
                to { transform: rotate(0deg); }
              }
              @keyframes spin-cw {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              @keyframes cable-vibrate {
                0%, 100% { stroke-width: 2.2px; }
                50% { stroke-width: 2.7px; filter: drop-shadow(0 0 1px rgba(255,255,255,0.4)); }
              }
              @keyframes beacon-blink {
                0%, 100% { opacity: 0.2; }
                50% { opacity: 1; fill: #f59e0b; filter: drop-shadow(0 0 5px #f59e0b); }
              }
              @keyframes led-pulse-green {
                0%, 100% { stroke: #10b981; filter: drop-shadow(0 0 1px #10b981); }
                50% { stroke: #34d399; filter: drop-shadow(0 0 6px #34d399); }
              }
              @keyframes led-pulse-blue {
                0%, 100% { stroke: #3b82f6; filter: drop-shadow(0 0 1px #3b82f6); }
                50% { stroke: #60a5fa; filter: drop-shadow(0 0 6px #60a5fa); }
              }
              @keyframes led-flash-red {
                0%, 100% { stroke: #ef4444; filter: drop-shadow(0 0 1px #ef4444); }
                50% { stroke: #f87171; filter: drop-shadow(0 0 8px #ef4444); }
              }
              @keyframes crane-dust-l {
                0% { transform: translate(0, 0) scale(0.6); opacity: 0.8; }
                100% { transform: translate(-70px, -40px) scale(1.8); opacity: 0; }
              }
              @keyframes crane-dust-r {
                0% { transform: translate(0, 0) scale(0.6); opacity: 0.8; }
                100% { transform: translate(70px, -40px) scale(1.8); opacity: 0; }
              }
              @keyframes shock-ripple {
                0% { rx: 6px; ry: 1.5px; opacity: 1; stroke-width: 5px; }
                100% { rx: 110px; ry: 25px; opacity: 0; stroke-width: 0.5px; }
              }
              .anim-spin-ccw {
                animation: spin-ccw 2.5s linear infinite;
              }
              .anim-spin-cw {
                animation: spin-cw 0.8s linear infinite;
              }
              .anim-vibrate {
                animation: cable-vibrate 0.15s linear infinite;
              }
              .anim-beacon {
                animation: beacon-blink 1.2s ease-in-out infinite;
              }
              .led-charging {
                animation: led-pulse-green 1s ease-in-out infinite;
              }
              .led-discharging {
                animation: led-pulse-blue 0.5s ease-in-out infinite;
              }
              .led-impact {
                animation: led-flash-red 0.15s linear infinite;
              }
              .crane-dust-left {
                animation: crane-dust-l 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              }
              .crane-dust-right {
                animation: crane-dust-r 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              }
              .crane-ripple {
                animation: shock-ripple 0.6s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
              }
            `}</style>

            <linearGradient id="craneBodyGrad" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            <linearGradient id="craneYellowGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>

            <linearGradient id="soilTopGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={soilThemes.topColor} />
              <stop offset="100%" stopColor={soilThemes.midColor} />
            </linearGradient>

            <linearGradient id="soilBotGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={soilThemes.midColor} />
              <stop offset="100%" stopColor={soilThemes.botColor} />
            </linearGradient>

            <pattern id="hazardStripe" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="10" height="20" fill="#fbbf24" />
              <rect x="10" width="10" height="20" fill="#000000" />
            </pattern>
          </defs>

          {/* Sky Gradient */}
          <rect x="0" y="0" width={width} height={groundY} fill="url(#skyGradient)" />
          <ellipse cx="225" cy="300" rx="200" ry="120" fill={stateMeta.glow} opacity="0.3" filter="blur(40px)" />

          {/* Geological Soil Layers at Bottom */}
          <g>
            {/* Topsoil Layer with dynamic Compaction Crater at x=350 */}
            <path
              d={`M 0 ${groundY}
                  L 280 ${groundY}
                  Q 350 ${groundY + currentCraterDepth} 410 ${groundY}
                  L ${width} ${groundY}
                  L ${width} 540
                  L 0 540 Z`}
              fill="url(#soilTopGrad)"
            />

            {/* Subsoil Layer */}
            <path
              d={`M 0 540 L ${width} 540 L ${width} 570 L 0 570 Z`}
              fill="url(#soilBotGrad)"
              opacity="0.9"
            />

            {/* Bedrock / Deep Soil Layer */}
            <path
              d={`M 0 570 L ${width} 570 L ${width} ${heightTotal} L 0 ${heightTotal} Z`}
              fill={soilThemes.botColor}
              opacity="0.95"
            />

            {/* Compacted area indicator lines (vertical dots/waves below weight) */}
            <line
              x1="350" y1={groundY + currentCraterDepth + 2}
              x2="350" y2="580"
              stroke={soilThemes.glowColor}
              strokeWidth="2.5"
              strokeDasharray="4, 6"
              strokeOpacity={0.25 + compactedRatio * 0.5}
            />
            <path
              d={`M 310 ${groundY + 30} Q 350 ${groundY + 45 + compactedRatio * 10} 390 ${groundY + 30}`}
              fill="none"
              stroke={soilThemes.glowColor}
              strokeWidth="1.5"
              strokeOpacity={0.15 + compactedRatio * 0.4}
            />
            <path
              d={`M 290 ${groundY + 55} Q 350 ${groundY + 70 + compactedRatio * 15} 410 ${groundY + 55}`}
              fill="none"
              stroke={soilThemes.glowColor}
              strokeWidth="1"
              strokeOpacity={0.1 + compactedRatio * 0.3}
            />

            {/* Ground surface neon outline */}
            <path
              d={`M 0 ${groundY}
                  L 280 ${groundY}
                  Q 350 ${groundY + currentCraterDepth} 410 ${groundY}
                  L ${width} ${groundY}`}
              fill="none"
              stroke={soilThemes.glowColor}
              strokeWidth="2.5"
              strokeOpacity="0.8"
              style={{ filter: `drop-shadow(0 0 3px ${soilThemes.glowColor})` }}
            />
          </g>

          {/* Crawler Crane tracks shadow */}
          <ellipse cx="130" cy="510" rx="90" ry="12" fill="#020617" fillOpacity="0.75" />

          {/* --- CRAWLER CRANE MACHINE --- */}
          <g>
            {/* 1. Track Assembly */}
            {/* Main Tread Belt */}
            <rect x="50" y="478" width="160" height="32" rx="16" fill="#1e293b" stroke="#0f172a" strokeWidth="3.5" />
            {/* Treads Pattern (slots) */}
            {Array.from({ length: 9 }).map((_, i) => (
              <line
                key={i}
                x1={65 + i * 16}
                y1="479"
                x2={65 + i * 16}
                y2="509"
                stroke="#090d16"
                strokeWidth="4.5"
                strokeOpacity="0.85"
              />
            ))}
            {/* Inner roller wheels */}
            {Array.from({ length: 6 }).map((_, i) => (
              <circle
                key={i}
                cx={70 + i * 24}
                cy="494"
                r="7"
                fill="#475569"
                stroke="#0f172a"
                strokeWidth="2.5"
              />
            ))}
            {/* Large drive gears */}
            <circle cx="58" cy="494" r="10" fill="#334155" stroke="#0f172a" strokeWidth="2.5" />
            <circle cx="202" cy="494" r="10" fill="#334155" stroke="#0f172a" strokeWidth="2.5" />

            {/* 2. Platform Base / Turntable */}
            <rect x="75" y="466" width="110" height="13" fill="#334155" stroke="#0f172a" strokeWidth="2" />
            <circle cx="130" cy="471" r="5" fill="#475569" />

            {/* 3. Cabin & Engine House */}
            {/* Main engine enclosure */}
            <path
              d="M 70 410 L 145 410 L 145 466 L 70 466 Z"
              fill="url(#craneBodyGrad)"
              stroke="#0f172a"
              strokeWidth="2.5"
            />
            {/* Ventilation Grills */}
            <rect x="78" y="420" width="18" height="36" fill="#090d16" rx="2" />
            <line x1="82" y1="425" x2="82" y2="451" stroke="#334155" strokeWidth="1.5" />
            <line x1="87" y1="425" x2="87" y2="451" stroke="#334155" strokeWidth="1.5" />
            <line x1="92" y1="425" x2="92" y2="451" stroke="#334155" strokeWidth="1.5" />

            {/* Counterweight */}
            <path
              d="M 52 416 L 70 416 L 70 466 L 52 458 Z"
              fill="url(#hazardStripe)"
              stroke="#0f172a"
              strokeWidth="2"
            />
            <text x="61" y="445" fill="#000000" fontSize="7" fontWeight="bold" transform="rotate(-90 61 445)" textAnchor="middle">
              50T
            </text>

            {/* Winch Drum inside cab */}
            <g
              className={state === 'CHARGING' ? 'anim-spin-ccw' : state === 'DISCHARGING' ? 'anim-spin-cw' : ''}
              style={{ transformOrigin: `${winchX}px ${winchY}px` }}
            >
              <circle cx={winchX} cy={winchY} r="13" fill="#475569" stroke="#090d16" strokeWidth="2" />
              <circle cx={winchX} cy={winchY} r="10" fill="#cbd5e1" strokeDasharray="3, 3" strokeWidth="1.5" />
              <line x1={winchX - 10} y1={winchY} x2={winchX + 10} y2={winchY} stroke="#090d16" strokeWidth="2" />
              <line x1={winchX} y1={winchY - 10} x2={winchX} y2={winchY + 10} stroke="#090d16" strokeWidth="2" />
            </g>

            {/* Operator's Cab (Glass cockpit in front) */}
            <path
              d="M 145 410 L 182 410 L 192 432 L 182 466 L 145 466 Z"
              fill="#0f172a"
              stroke="#0f172a"
              strokeWidth="2.5"
            />
            {/* Cab Windows */}
            <path
              d="M 149 414 L 178 414 L 187 433 L 178 462 L 149 462 Z"
              fill="#083344"
              opacity="0.75"
              stroke="#06b6d4"
              strokeWidth="1.5"
              style={{ filter: 'drop-shadow(0 0 2px rgba(6,182,212,0.3))' }}
            />
            {/* Glass Highlights */}
            <line x1="154" y1="418" x2="175" y2="418" stroke="#22d3ee" strokeWidth="1" opacity="0.3" />
            <line x1="172" y1="422" x2="183" y2="444" stroke="#22d3ee" strokeWidth="1.5" opacity="0.4" />
            {/* Operator seat outline */}
            <path d="M 156 450 L 164 450 L 166 438" fill="none" stroke="#334155" strokeWidth="2" />
            <circle cx="163" cy="433" r="3" fill="#475569" />

            {/* Cab top antenna with flashing amber warning beacon */}
            <line x1="140" y1="410" x2="140" y2="395" stroke="#475569" strokeWidth="1.5" />
            <circle cx="140" cy="394" r="3.5" className="anim-beacon" fill="#b45309" />

            {/* 4. A-Frame Gantry mast */}
            <line x1="90" y1="410" x2="110" y2="330" stroke="#64748b" strokeWidth="4.5" />
            <line x1="135" y1="410" x2="110" y2="330" stroke="#64748b" strokeWidth="4.5" />
            <circle cx="110" cy="330" r="6.5" fill="#334155" stroke="#0f172a" strokeWidth="2" />

            {/* Mast tension wire ropes */}
            {/* Rear anchor to A-Frame */}
            <line x1="72" y1="410" x2="110" y2="330" stroke="#475569" strokeWidth="2" strokeDasharray="1, 1" />
            {/* A-Frame to Boom Tip */}
            <line x1="110" y1="330" x2={boomTipX} y2={boomTipY} stroke="#334155" strokeWidth="2.5" />

            {/* 5. Lattice Boom */}
            {/* Main Boom Structure chords */}
            <line x1="180" y1="458" x2={boomTipX} y2={boomTipY} stroke="url(#craneYellowGrad)" strokeWidth="6" strokeLinecap="round" />
            <line x1="185" y1="450" x2={boomTipX - 6} y2={boomTipY + 9} stroke="url(#craneYellowGrad)" strokeWidth="6" strokeLinecap="round" />

            {/* Lattice Zigzag bracing */}
            {Array.from({ length: 11 }).map((_, i) => {
              const fraction1 = i / 11;
              const fraction2 = (i + 1) / 11;
              const ax = 180 + fraction1 * (boomTipX - 180);
              const ay = 458 + fraction1 * (boomTipY - 458);
              const bx = 185 + fraction2 * ((boomTipX - 6) - 185);
              const by = 450 + fraction2 * ((boomTipY + 9) - 450);

              const cx = 185 + fraction1 * ((boomTipX - 6) - 185);
              const cy = 450 + fraction1 * ((boomTipY + 9) - 450);
              const dx = 180 + fraction2 * (boomTipX - 180);
              const dy = 458 + fraction2 * (boomTipY - 458);

              return (
                <g key={i}>
                  <line x1={ax} y1={ay} x2={bx} y2={by} stroke="#0f172a" strokeWidth="2" />
                  <line x1={cx} y1={cy} x2={dx} y2={dy} stroke="#0f172a" strokeWidth="2" />
                </g>
              );
            })}

            {/* Boom Mounted LED Indicator strip */}
            <line
              x1="205" y1="410"
              x2="320" y2="155"
              strokeWidth="2.5"
              strokeLinecap="round"
              className={
                state === 'CHARGING'
                  ? 'led-charging'
                  : state === 'DISCHARGING'
                  ? 'led-discharging'
                  : state === 'IMPACT'
                  ? 'led-impact'
                  : ''
              }
              stroke={stateMeta.color}
              style={{ opacity: 0.8 }}
            />

            {/* Boom Tip Pulley Wheel */}
            <g
              className={state === 'CHARGING' ? 'anim-spin-ccw' : state === 'DISCHARGING' ? 'anim-spin-cw' : ''}
              style={{ transformOrigin: `${boomTipX}px ${boomTipY}px` }}
            >
              <circle cx={boomTipX} cy={boomTipY} r="14" fill="#334155" stroke="#0f172a" strokeWidth="3" />
              <circle cx={boomTipX} cy={boomTipY} r="10" fill="#475569" />
              <line x1={boomTipX - 14} y1={boomTipY} x2={boomTipX + 14} y2={boomTipY} stroke="#0f172a" strokeWidth="2" />
              <line x1={boomTipX} y1={boomTipY - 14} x2={boomTipX} y2={boomTipY + 14} stroke="#0f172a" strokeWidth="2" />
              <circle cx={boomTipX} cy={boomTipY} r="4" fill="#090d16" />
            </g>

            {/* 6. Vertical Guide Leads Truss System */}
            {/* Holds the sliding weight in vertical guides */}
            <line x1={boomTipX - 11} y1="75" x2={boomTipX - 11} y2={groundY} stroke="#334155" strokeWidth="2.5" strokeOpacity="0.8" />
            <line x1={boomTipX + 11} y1="75" x2={boomTipX + 11} y2={groundY} stroke="#334155" strokeWidth="2.5" strokeOpacity="0.8" />
            {/* Guide cross-braces */}
            {Array.from({ length: 14 }).map((_, i) => {
              const y = 85 + i * 30;
              if (y < groundY) {
                return (
                  <g key={i} opacity="0.35">
                    <line x1={boomTipX - 11} y1={y} x2={boomTipX + 11} y2={y + 12} stroke="#475569" strokeWidth="1.5" />
                    <line x1={boomTipX + 11} y1={y} x2={boomTipX - 11} y2={y + 12} stroke="#475569" strokeWidth="1.5" />
                    <line x1={boomTipX - 11} y1={y} x2={boomTipX + 11} y2={y} stroke="#475569" strokeWidth="1.5" />
                  </g>
                );
              }
              return null;
            })}

            {/* 7. Wire Cable ropes */}
            {/* Cable 1: Winch to Boom Tip Pulley */}
            <line
              x1={winchX + 7}
              y1={winchY - 7}
              x2={boomTipX - 5}
              y2={boomTipY + 5}
              stroke="#94a3b8"
              strokeWidth="2.2"
              className={state === 'DISCHARGING' || state === 'CHARGING' ? 'anim-vibrate' : ''}
              strokeOpacity="0.9"
            />
            {/* Cable 2: Boom Tip Pulley down to Tamper Weight */}
            <line
              x1={boomTipX}
              y1={boomTipY}
              x2={boomTipX}
              y2={weightY}
              stroke="#e2e8f0"
              strokeWidth="2.5"
              className={state === 'DISCHARGING' || state === 'CHARGING' ? 'anim-vibrate' : ''}
              strokeOpacity="0.95"
            />

            {/* 8. Tamper Weight (Solid sliding metal block) */}
            <g transform={`translate(${boomTipX - 11}, ${weightY})`}>
              {/* Block shadow cast on the guide rails */}
              <rect x="0" y="0" width="22" height={weightHeight} fill="#090d16" opacity="0.6" rx="2" />
              {/* Main weight cylinder/block body */}
              <rect
                x="0"
                y="0"
                width="22"
                height={weightHeight}
                fill="url(#craneYellowGrad)"
                stroke="#090d16"
                strokeWidth="2"
                rx="2"
                style={{
                  filter: state === 'IMPACT' ? 'drop-shadow(0 0 6px #f43f5e)' : 'none',
                  transition: 'filter 0.15s ease',
                }}
              />
              {/* Inner details for weight to look heavy and structured */}
              <line x1="4" y1="4" x2="4" y2={weightHeight - 4} stroke="#090d16" strokeWidth="1.2" opacity="0.3" />
              <line x1="18" y1="4" x2="18" y2={weightHeight - 4} stroke="#090d16" strokeWidth="1.2" opacity="0.3" />
              {/* Heavy bolts */}
              <circle cx="6" cy="6" r="1.5" fill="#334155" />
              <circle cx="16" cy="6" r="1.5" fill="#334155" />
              <circle cx="6" cy={weightHeight - 6} r="1.5" fill="#334155" />
              <circle cx="16" cy={weightHeight - 6} r="1.5" fill="#334155" />
              {/* Weight text label */}
              <text x="11" y="18" fill="#000000" fontSize="8" fontWeight="950" textAnchor="middle" fontFamily="var(--font-mono), monospace">
                {tamperMass >= 1000 ? `${(tamperMass / 1000).toFixed(0)}T` : `${tamperMass}k`}
              </text>
            </g>
          </g>

          {/* --- DYNAMIC IMPACT EFFECTS --- */}
          {state === 'IMPACT' && (
            <g>
              {/* Dust splash particle circles flying left and right */}
              <g className="crane-dust-left" style={{ transformOrigin: `340px ${groundY}px` }}>
                <circle cx="330" cy={groundY} r="7" fill={soilThemes.topColor} opacity="0.9" />
                <circle cx="315" cy={groundY - 15} r="5" fill={soilThemes.midColor} opacity="0.75" />
                <circle cx="300" cy={groundY - 25} r="3.5" fill={soilThemes.botColor} opacity="0.5" />
              </g>
              <g className="crane-dust-right" style={{ transformOrigin: `360px ${groundY}px` }}>
                <circle cx="370" cy={groundY} r="7" fill={soilThemes.topColor} opacity="0.9" />
                <circle cx="385" cy={groundY - 15} r="5" fill={soilThemes.midColor} opacity="0.75" />
                <circle cx="400" cy={groundY - 25} r="3.5" fill={soilThemes.botColor} opacity="0.5" />
              </g>

              {/* Shockwave expanding wave ripples */}
              <ellipse
                cx="350"
                cy={groundY + currentCraterDepth / 2}
                rx="20"
                ry="5"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="4"
                className="crane-ripple"
                style={{ transformOrigin: `350px ${groundY}px` }}
              />
              <ellipse
                cx="350"
                cy={groundY + currentCraterDepth / 2}
                rx="20"
                ry="5"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2.5"
                className="crane-ripple"
                style={{ transformOrigin: `350px ${groundY}px`, animationDelay: '0.15s' }}
              />
            </g>
          )}

          {/* Vertical Scale ruler on the left edge of leads */}
          <g opacity="0.75">
            {Array.from({ length: 6 }).map((_, idx) => {
              const rulerH = 88 + idx * (travelDistance / 5);
              const labelM = maxH - idx * (maxH / 5);
              return (
                <g key={idx}>
                  <line x1="324" y1={rulerH} x2="330" y2={rulerH} stroke="#94a3b8" strokeWidth="1.5" />
                  <text
                    x="320"
                    y={rulerH + 3.5}
                    fill="#94a3b8"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="var(--font-mono), monospace"
                    textAnchor="end"
                  >
                    {labelM.toFixed(0)}m
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Floating Real-time HUD on the Crane screen */}
        <div className="absolute bottom-4 left-4 right-4 bg-slate-950/75 backdrop-blur-md border border-slate-800/80 rounded-xl p-3 flex justify-between text-[11px] font-mono select-none">
          <div className="space-y-1">
            <div className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">COMPACTION TELEMETRY</div>
            <div className="flex gap-2">
              <span className="text-slate-400">Height:</span>
              <span className="text-white font-extrabold">{clampedHeight.toFixed(2)}m</span>
            </div>
            <div className="flex gap-2">
              <span className="text-slate-400">Compaction:</span>
              <span className="text-amber-400 font-extrabold">{soilCompaction.toFixed(1)}%</span>
            </div>
          </div>
          <div className="space-y-1 text-right">
            <div className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">ENERGY FLOW STATUS</div>
            <div className="text-white font-bold">
              {state === 'CHARGING' && (
                <span className="text-emerald-400 flex items-center gap-1 justify-end">
                  <Sun className="w-3.5 h-3.5" /> +{motorPower.toFixed(0)}W Lift
                </span>
              )}
              {state === 'DISCHARGING' && (
                <span className="text-blue-400 flex items-center gap-1 justify-end">
                  <Zap className="w-3.5 h-3.5" /> +{generatorPower.toFixed(0)}W Gen
                </span>
              )}
              {state === 'IMPACT' && (
                <span className="text-rose-400 font-extrabold flex items-center gap-1 justify-end">
                  <Shield className="w-3.5 h-3.5" /> IMPACT event
                </span>
              )}
              {state === 'IDLE' && <span className="text-slate-500">Rig Standby</span>}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-black" style={{ color: stateMeta.color }}>
              {stateMeta.label}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Summary Indicators */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-2">
          <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Weight Position</div>
          <div className="text-slate-200 font-black mt-1" style={{ fontFamily: 'var(--font-mono), monospace' }}>
            {clampedHeight.toFixed(2)} / {maxH}m
          </div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-2">
          <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Operational Mode</div>
          <div className="text-slate-200 font-black mt-1 uppercase" style={{ fontFamily: 'var(--font-mono), monospace', color: stateMeta.color }}>
            {state}
          </div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-2">
          <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Soil Compaction</div>
          <div className="text-amber-400 font-black mt-1" style={{ fontFamily: 'var(--font-mono), monospace' }}>
            {soilCompaction.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}
