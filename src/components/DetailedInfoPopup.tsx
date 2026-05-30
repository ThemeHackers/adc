'use client';

import React from 'react';
import { X } from 'lucide-react';

interface DetailedInfoPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: {
    [key: string]: {
      label: string;
      value: string | number;
      unit?: string;
      icon?: React.ReactNode;
      color?: string;
    };
  };
}

export default function DetailedInfoPopup({ isOpen, onClose, title, data }: DetailedInfoPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div className="cyber-glass bg-slate-900/90 rounded-2xl shadow-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto border border-slate-800">
        {/* Header */}
        <div className="sticky top-0 bg-slate-950/50 backdrop-blur-md border-b border-slate-800/80 text-slate-100 p-5 rounded-t-2xl z-10 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black tracking-wider uppercase text-slate-200">{title}</h2>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Diagnostic Readout</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800/80 rounded-xl transition-all border border-transparent hover:border-slate-700/50 cursor-pointer text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          {Object.entries(data).map(([key, item]) => (
            <div
              key={key}
              className="bg-slate-950/40 border border-slate-800/80 hover:border-slate-700/50 rounded-xl p-4 transition-all duration-300 hover:translate-x-0.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {item.icon && (
                    <div
                      className="p-2 rounded-xl border"
                      style={{
                        backgroundColor: item.color ? `${item.color}10` : 'rgba(148,163,184,0.1)',
                        borderColor: item.color ? `${item.color}20` : 'rgba(148,163,184,0.2)'
                      }}
                    >
                      <div style={{ color: item.color || '#94a3b8' }}>{item.icon}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{item.label}</div>
                    <div className="text-xl font-black text-slate-100 mt-0.5" style={{ fontFamily: 'var(--font-mono), monospace' }}>
                      {typeof item.value === 'number'
                        ? Number.isInteger(item.value)
                          ? item.value.toString()
                          : item.value.toFixed(2)
                        : item.value}
                      {item.unit && <span className="text-xs text-slate-400 font-bold ml-1 uppercase tracking-widest">{item.unit}</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-950/50 backdrop-blur-md p-4 border-t border-slate-800/80 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-slate-200 py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg border border-slate-700/30 transition-all duration-300 cursor-pointer"
          >
            Close Readout
          </button>
        </div>
      </div>
    </div>
  );
}
