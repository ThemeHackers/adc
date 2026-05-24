'use client';

import React from 'react';
import { FileText, Download, Calendar } from 'lucide-react';
import { SimulationStatistics } from '@/lib/dataLogger';
import { SimulationConfig } from '@/components/ConfigurationPanel';

interface ReportGeneratorProps {
  statistics: SimulationStatistics;
  config: SimulationConfig;
  onGenerateReport: () => void;
}

export default function ReportGenerator({ statistics, config, onGenerateReport }: ReportGeneratorProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  const generatePDFReport = () => {
    const reportContent = `
<!DOCTYPE html>
<html>
<head>
  <title>ADC Simulation Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
      background: #0f172a;
      color: #f8fafc;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #334155;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .section {
      margin-bottom: 30px;
      background: #1e293b;
      padding: 20px;
      border-radius: 12px;
      border: 1px solid #334155;
    }
    .section h2 {
      color: #38bdf8;
      border-bottom: 1px solid #334155;
      padding-bottom: 10px;
      margin-top: 0;
    }
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin: 20px 0;
    }
    .stat-item {
      background: #0f172a;
      padding: 15px;
      border-radius: 8px;
      border: 1px solid #334155;
    }
    .stat-label {
      font-weight: bold;
      color: #94a3b8;
      font-size: 13px;
      text-transform: uppercase;
      tracking-wide: 0.05em;
    }
    .stat-value {
      font-size: 24px;
      color: #f8fafc;
      margin-top: 5px;
      font-family: monospace;
    }
    .config-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .config-table th, .config-table td {
      border: 1px solid #334155;
      padding: 12px;
      text-align: left;
    }
    .config-table th {
      background: #0f172a;
      color: #94a3b8;
    }
    .config-table td {
      color: #cbd5e1;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #334155;
      color: #64748b;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>ADC Simulation Report</h1>
    <p>Artificial Dynamic Compaction Monitoring System</p>
    <p>Generated: ${new Date().toLocaleString()}</p>
  </div>

  <div class="section">
    <h2>Simulation Statistics</h2>
    <div class="stat-grid">
      <div class="stat-item">
        <div class="stat-label">Total Simulation Time</div>
        <div class="stat-value">${statistics.totalTime.toFixed(2)}s</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Total Energy Generated</div>
        <div class="stat-value">${(statistics.totalEnergyGenerated / 1000).toFixed(2)} kJ</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Estimated Energy Value</div>
        <div class="stat-value">฿${statistics.estimatedEnergyValueTHB.toFixed(2)}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Net Energy Balance</div>
        <div class="stat-value">${(statistics.netEnergy / 1000).toFixed(2)} kJ</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Estimated Electricity Bill</div>
        <div class="stat-value">฿${statistics.estimatedConsumptionCostTHB.toFixed(2)}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Estimated Net Value</div>
        <div class="stat-value">฿${statistics.estimatedNetValueTHB.toFixed(2)}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Total Impacts</div>
        <div class="stat-value">${statistics.totalImpacts}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Impact Rate</div>
        <div class="stat-value">${statistics.impactRate.toFixed(2)} impacts/min</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Max Soil Compaction</div>
        <div class="stat-value">${statistics.maxSoilCompaction.toFixed(1)}%</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Avg Generator Power</div>
        <div class="stat-value">${statistics.avgGeneratorPower.toFixed(2)} W</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Battery Stability</div>
        <div class="stat-value">${statistics.batteryStabilityIndex.toFixed(1)}%</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Final Soil Density</div>
        <div class="stat-value">${statistics.finalSoilDensity.toFixed(0)} kg/m³</div>
      </div>
    </div>
    <p style="color:#94a3b8;font-size:12px;margin-top:10px;">Energy-to-money conversion uses the ERC large-business average tariff of ฿${statistics.electricityRateTHBPerKWh.toFixed(2)} per kWh and applies it to total system usage (motor + load).</p>
  </div>

  <div class="section">
    <h2>Configuration Parameters</h2>
    <table class="config-table">
      <tr>
        <th>Parameter</th>
        <th>Value</th>
      </tr>
      <tr>
        <td>Pendulum Mass</td>
        <td>${config.pendulumMass} kg</td>
      </tr>
      <tr>
        <td>Max Height</td>
        <td>${config.maxHeight} m</td>
      </tr>
      <tr>
        <td>Gravity</td>
        <td>${config.gravity} m/s²</td>
      </tr>
      <tr>
        <td>Solar Power</td>
        <td>${config.solarPower} W</td>
      </tr>
      <tr>
        <td>Motor Power</td>
        <td>${config.motorPower} W</td>
      </tr>
      <tr>
        <td>Battery Voltage</td>
        <td>${config.batteryVoltage} V</td>
      </tr>
      <tr>
        <td>Motor Efficiency</td>
        <td>${(config.motorEfficiency * 100).toFixed(1)}%</td>
      </tr>
      <tr>
        <td>Generator Efficiency</td>
        <td>${(config.generatorEfficiency * 100).toFixed(1)}%</td>
      </tr>
    </table>
  </div>

  <div class="footer">
    <p>ADC Simulation System v1.0 | Physics-based Real-time Monitoring</p>
    <p>This report was automatically generated by the ADC Simulation Dashboard</p>
  </div>
</body>
</html>
    `;
    
    const blob = new Blob([reportContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `adc_simulation_report_${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    onGenerateReport();
  };
  
  return (
    <div className="cyber-glass rounded-2xl p-5 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-200 text-sm tracking-wide">Generate Report</h3>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Analysis Engine</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium bg-slate-950/40 border border-slate-800/80 px-2.5 py-1.5 rounded-xl">
          <Calendar className="w-4 h-4 text-purple-400" />
          {mounted ? new Date().toLocaleDateString() : ''}
        </div>
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Time</div>
            <div className="text-base font-bold text-slate-200 mt-1" style={{ fontFamily: 'var(--font-mono), monospace' }}>{statistics.totalTime.toFixed(1)}s</div>
          </div>
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Energy Gen</div>
            <div className="text-base font-bold text-slate-200 mt-1" style={{ fontFamily: 'var(--font-mono), monospace' }}>{(statistics.totalEnergyGenerated / 1000).toFixed(1)} kJ</div>
          </div>
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Impacts</div>
            <div className="text-base font-bold text-slate-200 mt-1" style={{ fontFamily: 'var(--font-mono), monospace' }}>{statistics.totalImpacts}</div>
          </div>
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Max Compaction</div>
            <div className="text-base font-bold text-slate-200 mt-1" style={{ fontFamily: 'var(--font-mono), monospace' }}>{statistics.maxSoilCompaction.toFixed(1)}%</div>
          </div>
        </div>
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Net Energy Balance</div>
          <div className="text-base font-bold text-slate-200 mt-1" style={{ fontFamily: 'var(--font-mono), monospace' }}>{(statistics.netEnergy / 1000).toFixed(1)} kJ</div>
        </div>
      </div>
      
      <button
        onClick={generatePDFReport}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white py-3 px-4 rounded-xl font-bold text-sm tracking-wider uppercase shadow-lg shadow-purple-500/10 cursor-pointer transition-all duration-300"
      >
        <Download className="w-5 h-5" />
        Download Report
      </button>
    </div>
  );
}
