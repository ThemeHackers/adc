'use client';

import React, { useState } from 'react';
import { SimulationData } from '@/lib/simulation-engine';
import { SOIL_DATABASE } from '@/lib/formulas';
import { Activity, Flame, ShieldAlert, Cpu, Hammer, BatteryCharging, Wind } from 'lucide-react';

interface MathTelemetryPanelProps {
  data: SimulationData;
}

export default function MathTelemetryPanel({ data }: MathTelemetryPanelProps) {
  const [activeTab, setActiveTab] = useState<'aerodynamics' | 'braking' | 'soil' | 'battery'>('soil');
  const tamperMass = data?.tamperMass ?? 500;
  const soilType = data?.soilType ?? 'sand';
  const soilCompaction = data?.soilCompaction ?? 0;
  const stiffness = data?.stiffness ?? 2.0e6;
  const kineticEnergy = data?.kineticEnergy ?? 0;
  const impactForce = data?.impactForce ?? 0;
  const craterDepth = data?.craterDepth ?? 0;
  const contactPressure = data?.contactPressure ?? 0;
  const gearRatio = data?.gearRatio ?? 15.0;
  const tamperVelocity = data?.tamperVelocity ?? 0;
  const generatorEMF = data?.generatorEMF ?? 0;
  const batteryVoltage = data?.batteryVoltage ?? 24.0;
  const batteryCurrent = data?.batteryCurrent ?? 0;
  const loadResistance = data?.loadResistance ?? 2.0;
  const state = data?.state ?? 'IDLE';
  const dragCoefficient = data?.dragCoefficient ?? 0.82;
  const dragForce = data?.dragForce ?? 0;
  const terminalVelocity = data?.terminalVelocity ?? 0;
  const batteryCapacity = data?.batteryCapacity ?? 50.0;
  const voltageTerminal = data?.voltageTerminal ?? batteryVoltage;
  const batteryTemp = data?.batteryTemp ?? 25.0;

  const vol = tamperMass / 7850;
  const radius = Math.pow(vol / (Math.PI * 3), 1 / 3);
  const area = Math.PI * Math.pow(radius, 2);
  const props = SOIL_DATABASE[soilType] || SOIL_DATABASE.sand;

  const rInt = batteryVoltage > 36 ? 0.08 : 0.04;
  const frictionForce = Math.max(1, (40 + 15 * Math.abs(tamperVelocity)) * (tamperMass / 500));
  const brakingForce = state === 'DISCHARGING' ? (0.15 * gearRatio * batteryCurrent) : 0;
  const accelVal = -9.81 + (brakingForce + dragForce + frictionForce) / tamperMass;

  const currentSoilName = (() => {
    switch (soilType) {
      case 'sand': return 'Sand';
      case 'clay': return 'Clay';
      case 'gravel': return 'Gravel';
      case 'loam': return 'Loam';
      default: return 'Sand';
    }
  })();

  return (
    <div className="cyber-glass rounded-2xl p-5 shadow-2xl transition-all duration-300 border border-slate-800/80">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-5 gap-3">
        <div>
          <h2 className="text-lg font-black tracking-wider uppercase text-slate-200 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400 animate-pulse" />
            Physics & Mathematical Telemetry Board
          </h2>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Real-time Mathematical & Mechanical Analysis Panel</span>
        </div>

        {/* Tab selection */}
        <div className="flex flex-wrap gap-1 bg-slate-950/60 p-1 border border-slate-800 rounded-xl shadow-inner">
          <button
            onClick={() => setActiveTab('soil')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'soil'
                ? 'bg-slate-800 text-white shadow-lg border border-slate-700/50'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Soil Impact
          </button>
          <button
            onClick={() => setActiveTab('braking')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'braking'
                ? 'bg-slate-800 text-white shadow-lg border border-slate-700/50'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            EM Braking
          </button>
          <button
            onClick={() => setActiveTab('aerodynamics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'aerodynamics'
                ? 'bg-slate-800 text-white shadow-lg border border-slate-700/50'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Drag Force
          </button>
          <button
            onClick={() => setActiveTab('battery')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'battery'
                ? 'bg-slate-800 text-white shadow-lg border border-slate-700/50'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Battery Thermal
          </button>
        </div>
      </div>

      {/* Main content display */}
      <div className="bg-slate-950/50 rounded-xl border border-slate-850 p-4 font-mono text-sm leading-relaxed text-slate-300 relative overflow-hidden">
        {/* Render Tab 1: Soil Mechanics */}
        {activeTab === 'soil' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <span className="text-amber-400 font-bold uppercase text-xs flex items-center gap-1.5">
                <Hammer className="w-4 h-4" /> Soil Compaction & Bearing Capacity
              </span>
              <span className="text-[10px] text-slate-500">DYNAMIC COMPACTION MODEL</span>
            </div>

            {/* Render equations */}
            <div className="space-y-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800/50">
              <div className="text-[11px] text-slate-500 font-bold">1. SOIL STIFFNESS:</div>
              <div className="text-slate-200 font-bold">
                k_s = k_0 × (1 + 3 × (compaction / 100)²)
              </div>
              <div className="text-slate-400 text-xs">
                = {props.initialStiffness.toExponential(2)} N/m × (1 + 3 × ({ (soilCompaction / 100).toFixed(4) })²)
                = <span className="text-amber-400 font-bold">{(stiffness / 1e6).toFixed(3)} MN/m</span>
              </div>
            </div>

            <div className="space-y-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800/50">
              <div className="text-[11px] text-slate-500 font-bold">2. PEAK IMPACT FORCE & CRATER:</div>
              <div className="text-slate-200 font-bold">
                F_peak = √(2 × E_k × k_s) , d_crater = F_peak / k_s
              </div>
              <div className="text-slate-400 text-xs">
                F_peak = √(2 × {(kineticEnergy / 1000).toFixed(2)} kJ × {(stiffness / 1e6).toFixed(2)} MN/m)
                = <span className="text-amber-400 font-bold">{(impactForce / 1000).toFixed(1)} kN</span>
                <br />
                d_crater = {(craterDepth * 100).toFixed(1)} cm (depth)
              </div>
            </div>

            <div className="space-y-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800/50">
              <div className="text-[11px] text-slate-500 font-bold">3. ULTIMATE BEARING CAPACITY:</div>
              <div className="text-slate-200 font-bold">
                P_contact = F_peak / A_base vs q_u
              </div>
              <div className="text-slate-400 text-xs">
                P_contact = {(impactForce / 1000).toFixed(1)} kN / {area.toFixed(4)} m²
                = <span className="text-amber-400 font-bold">{(contactPressure / 1000).toFixed(1)} kPa</span>
                <br />
                q_u (Soil type limit: {currentSoilName})
                = <span className="text-blue-400">{(props.ultimateBearingCapacity / 1000).toFixed(0)} kPa</span>
              </div>
            </div>

            {/* Compaction status indicator */}
            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs text-slate-500 font-bold">PLASTIC COMPACTION STATUS:</span>
              {contactPressure > props.ultimateBearingCapacity ? (
                <span className="flex items-center gap-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 font-black px-2.5 py-1 rounded text-xs animate-pulse">
                  <ShieldAlert className="w-4 h-4" /> ACTIVE (Plastic Deformation)
                </span>
              ) : (
                <span className="bg-slate-800 border border-slate-700 text-slate-400 font-bold px-2.5 py-1 rounded text-xs">
                  ELASTIC ONLY (No Permanent Deformation)
                </span>
              )}
            </div>
          </div>
        )}

        {/* Render Tab 2: EM Braking */}
        {activeTab === 'braking' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <span className="text-blue-400 font-bold uppercase text-xs flex items-center gap-1.5">
                <BatteryCharging className="w-4 h-4" /> Electromagnetic Generator Dynamics
              </span>
              <span className="text-[10px] text-slate-500">ENERGY HARVESTING SYSTEM</span>
            </div>

            {/* Render equations */}
            <div className="space-y-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800/50">
              <div className="text-[11px] text-slate-500 font-bold">1. GENERATOR BACK EMF:</div>
              <div className="text-slate-200 font-bold">
                E_g = K_e × Gear_ratio × |v|
              </div>
              <div className="text-slate-400 text-xs">
                = 0.15 × {gearRatio.toFixed(1)} × {Math.abs(tamperVelocity).toFixed(2)} m/s
                = <span className="text-blue-400 font-bold">{generatorEMF.toFixed(2)} V</span>
              </div>
            </div>

            <div className="space-y-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800/50">
              <div className="text-[11px] text-slate-500 font-bold">2. GENERATION CURRENT:</div>
              <div className="text-slate-200 font-bold">
                I_a = max(0, (E_g - V_batt) / (R_load + R_gen_int + R_batt_int))
              </div>
              <div className="text-slate-400 text-xs">
                = ({generatorEMF.toFixed(2)}V - {batteryVoltage.toFixed(1)}V) / ({loadResistance.toFixed(1)}Ω + 0.40Ω + {rInt.toFixed(2)}Ω)
                = <span className="text-blue-400 font-bold">
                  {state === 'DISCHARGING' ? batteryCurrent.toFixed(2) : '0.00'} A
                </span>
                <span className="ml-2 text-[10px] text-slate-500">
                  {generatorEMF > batteryVoltage ? '(Diodes Conduction)' : '(Blocked by Diodes)'}
                </span>
              </div>
            </div>

            <div className="space-y-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800/50">
              <div className="text-[11px] text-slate-500 font-bold">3. ELECTROMAGNETIC BRAKING FORCE:</div>
              <div className="text-slate-200 font-bold">
                F_brake = K_t × Gear_ratio × I_a
              </div>
              <div className="text-slate-400 text-xs">
                = 0.15 × {gearRatio.toFixed(1)} × {(state === 'DISCHARGING' ? batteryCurrent : 0).toFixed(2)} A
                = <span className="text-blue-400 font-bold">
                  {(state === 'DISCHARGING'
                    ? (0.15 * gearRatio * batteryCurrent)
                    : 0
                  ).toFixed(1)} N
                </span>
              </div>
            </div>

            {/* Differential Equation details */}
            <div className="bg-slate-950 px-3 py-2 rounded border border-slate-800 text-xs text-slate-400">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Equation of Motion (Descent):</div>
              m·a = -m·g + F_brake + F_drag + F_friction
              <br />
              Acceleration = {state === 'DISCHARGING' || state === 'IMPACT' ? accelVal.toFixed(3) : '0.000'} m/s²
            </div>
          </div>
        )}

        {/* Render Tab 3: Aerodynamics */}
        {activeTab === 'aerodynamics' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <span className="text-cyan-400 font-bold uppercase text-xs flex items-center gap-1.5">
                <Wind className="w-4 h-4" /> Aerodynamic Drag & Terminal Velocity
              </span>
              <span className="text-[10px] text-slate-500">FLUID DYNAMICS MODEL</span>
            </div>

            {/* Render equations */}
            <div className="space-y-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800/50">
              <div className="text-[11px] text-slate-500 font-bold">1. TAMPER GEOMETRY:</div>
              <div className="text-slate-200 font-bold">
                V_cylinder = m / ρ_steel , Area = π × r²
              </div>
              <div className="text-slate-400 text-xs">
                Volume = {(tamperMass / 7850).toFixed(4)} m³ (mass {tamperMass} kg / steel 7850 kg/m³)
                <br />
                Radius = {radius.toFixed(3)} m ,
                Base Area = <span className="text-cyan-400 font-bold">{area.toFixed(4)} m²</span>
              </div>
            </div>

            <div className="space-y-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800/50">
              <div className="text-[11px] text-slate-500 font-bold">2. AERODYNAMIC DRAG FORCE:</div>
              <div className="text-slate-200 font-bold">
                F_drag = 0.5 × ρ_air × C_d × Area × v²
              </div>
              <div className="text-slate-400 text-xs">
                = 0.5 × 1.225 × {dragCoefficient.toFixed(2)} × {area.toFixed(4)} m² × ({Math.abs(tamperVelocity).toFixed(2)} m/s)²
                = <span className="text-cyan-400 font-bold">{dragForce.toFixed(2)} N</span>
              </div>
            </div>

            <div className="space-y-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800/50">
              <div className="text-[11px] text-slate-500 font-bold">3. THEORETICAL TERMINAL VELOCITY:</div>
              <div className="text-slate-200 font-bold">
                v_terminal = √( (2 × m × g) / (ρ_air × C_d × Area) )
              </div>
              <div className="text-slate-400 text-xs">
                = √( (2 × {tamperMass} × 9.81) / (1.225 × {dragCoefficient.toFixed(2)} × {area.toFixed(4)}) )
                = <span className="text-cyan-400 font-bold">{terminalVelocity.toFixed(1)} m/s</span>
              </div>
            </div>
          </div>
        )}

        {/* Render Tab 4: Battery Model */}
        {activeTab === 'battery' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <span className="text-purple-400 font-bold uppercase text-xs flex items-center gap-1.5">
                <Cpu className="w-4 h-4" /> Battery Thermodynamics & Equivalent Circuit
              </span>
              <span className="text-[10px] text-slate-500">BATTERY TELEMETRY LOG</span>
            </div>

            {/* Render equations */}
            <div className="space-y-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800/50">
              <div className="text-[11px] text-slate-500 font-bold">1. EQUIVALENT TERMINAL VOLTAGE:</div>
              <div className="text-slate-200 font-bold">
                V_term = V_oc(SoC) + I × R_int
              </div>
              <div className="text-slate-400 text-xs">
                V_oc ({batteryCapacity.toFixed(1)}% SoC) = {(voltageTerminal - batteryCurrent * (batteryVoltage > 36 ? 0.08 : 0.04)).toFixed(2)} V
                <br />
                V_term = OCV + {batteryCurrent.toFixed(1)}A × {batteryVoltage > 36 ? 0.08 : 0.04}Ω
                = <span className="text-purple-400 font-bold">{voltageTerminal.toFixed(2)} V</span>
              </div>
            </div>

            <div className="space-y-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800/50">
              <div className="text-[11px] text-slate-500 font-bold">2. INTERNAL THERMAL HEATING:</div>
              <div className="text-slate-200 font-bold">
                P_heat = I² × R_int
              </div>
              <div className="text-slate-400 text-xs">
                = ({batteryCurrent.toFixed(1)}A)² × {batteryVoltage > 36 ? 0.08 : 0.04}Ω
                = <span className="text-purple-400 font-bold">{(Math.pow(batteryCurrent, 2) * (batteryVoltage > 36 ? 0.08 : 0.04)).toFixed(2)} W</span>
              </div>
            </div>

            <div className="space-y-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800/50">
              <div className="text-[11px] text-slate-500 font-bold">3. THERMODYNAMICS STATE:</div>
              <div className="text-slate-200 font-bold">
                dT/dt = (P_heat - h_cool × (T_batt - T_amb)) / C_thermal
              </div>
              <div className="text-slate-400 text-xs">
                dT/dt = ({(Math.pow(batteryCurrent, 2) * (batteryVoltage > 36 ? 0.08 : 0.04)).toFixed(2)}W - 1.5 × ({batteryTemp.toFixed(1)}°C - 25°C)) / 1200 J/K
                <br />
                Temperature = <span className={`${batteryTemp > 45 ? 'text-red-400 animate-pulse font-black' : 'text-purple-400 font-bold'}`}>{batteryTemp.toFixed(2)} °C</span>
              </div>
            </div>

            {/* Battery high temp warning */}
            {batteryTemp > 45 && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 font-bold px-3 py-2 rounded-lg text-xs animate-bounce">
                <Flame className="w-5 h-5 text-red-500" /> WARNING: Battery Temperature Exceeded safety limits ({batteryTemp.toFixed(1)}°C)
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
