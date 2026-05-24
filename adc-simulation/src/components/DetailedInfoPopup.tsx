'use client';

import React from 'react';
import { X, Zap, Activity, Gauge, Droplet, Mountain, Clock, TrendingUp } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {Object.entries(data).map(([key, item]) => (
            <div
              key={key}
              className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {item.icon && (
                    <div 
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: item.color ? `${item.color}20` : '#e2e8f0' }}
                    >
                      {item.icon}
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-gray-600 font-medium">{item.label}</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {typeof item.value === 'number' ? item.value.toFixed(2) : item.value}
                      {item.unit && <span className="text-lg text-gray-600 ml-1">{item.unit}</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 p-4 border-t border-slate-200 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-semibold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
