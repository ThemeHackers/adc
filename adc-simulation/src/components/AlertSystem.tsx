'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

export interface Alert {
  id: string;
  type: 'warning' | 'success' | 'info' | 'error';
  message: string;
  timestamp: number;
  autoDismiss?: boolean;
}

interface AlertSystemProps {
  alerts: Alert[];
  onDismiss: (id: string) => void;
}

const ALERT_COOLDOWN_MS = 4000;
const MAX_ACTIVE_ALERTS = 4;
const AUTO_DISMISS_MS = 5000;

export default function AlertSystem({ alerts, onDismiss }: AlertSystemProps) {
  const dismissTimersRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const activeIds = new Set(alerts.map(alert => alert.id));

    dismissTimersRef.current.forEach((timerId, alertId) => {
      if (!activeIds.has(alertId)) {
        window.clearTimeout(timerId);
        dismissTimersRef.current.delete(alertId);
      }
    });

    alerts.forEach(alert => {
      if (alert.autoDismiss === false || dismissTimersRef.current.has(alert.id)) {
        return;
      }

      const timerId = window.setTimeout(() => {
        dismissTimersRef.current.delete(alert.id);
        onDismiss(alert.id);
      }, AUTO_DISMISS_MS);

      dismissTimersRef.current.set(alert.id, timerId);
    });
  }, [alerts, onDismiss]);

  useEffect(() => {
    const timers = dismissTimersRef.current;

    return () => {
      timers.forEach(timerId => window.clearTimeout(timerId));
      timers.clear();
    };
  }, []);

  const getAlertStyles = (type: Alert['type']) => {
    switch (type) {
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: 'text-yellow-600',
          iconBg: 'bg-yellow-100'
        };
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: 'text-green-600',
          iconBg: 'bg-green-100'
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-600',
          iconBg: 'bg-red-100'
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          iconBg: 'bg-blue-100'
        };
    }
  };

  const getIcon = (type: Alert['type']) => {
    switch (type) {
      case 'warning':
        return AlertTriangle;
      case 'success':
        return CheckCircle;
      case 'error':
        return AlertTriangle;
      default:
        return Info;
    }
  };

  const visibleAlerts = alerts.slice(-MAX_ACTIVE_ALERTS);

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-40 space-y-2 max-w-sm pointer-events-none">
      {visibleAlerts.map((alert) => {
        const styles = getAlertStyles(alert.type);
        const Icon = getIcon(alert.type);

        return (
          <div
            key={alert.id}
            className={`${styles.bg} ${styles.border} border rounded-lg p-3 shadow-lg animate-in slide-in-from-right duration-300 pointer-events-auto`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${styles.iconBg} flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${styles.icon}`} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 leading-snug">
                  {alert.message}
                </p>
                <p className="text-[11px] text-gray-500 mt-1">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </p>
              </div>

              <button
                onClick={() => onDismiss(alert.id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Dismiss alert"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function useAlertManager() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const lastAlertAtRef = useRef<Map<string, number>>(new Map());
  const activeAlertBySignatureRef = useRef<Map<string, string>>(new Map());

  const addAlert = (message: string, type: Alert['type'] = 'info', autoDismiss = true) => {
    const signature = `${type}:${message}`;
    const now = Date.now();
    const lastShownAt = lastAlertAtRef.current.get(signature) ?? 0;
    const existingId = activeAlertBySignatureRef.current.get(signature);

    if (now - lastShownAt < ALERT_COOLDOWN_MS) {
      return existingId ?? `suppressed-${signature}`;
    }

    const id = `${now}-${Math.random().toString(36).slice(2, 8)}`;
    const alert: Alert = {
      id,
      type,
      message,
      timestamp: now,
      autoDismiss
    };

    lastAlertAtRef.current.set(signature, now);
    activeAlertBySignatureRef.current.set(signature, id);

    setAlerts(prev => {
      const withoutDuplicate = prev.filter(item => `${item.type}:${item.message}` !== signature);
      return [...withoutDuplicate, alert].slice(-MAX_ACTIVE_ALERTS);
    });

    return id;
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => {
      const dismissed = prev.find(alert => alert.id === id);

      if (dismissed) {
        const signature = `${dismissed.type}:${dismissed.message}`;
        activeAlertBySignatureRef.current.delete(signature);
      }

      return prev.filter(alert => alert.id !== id);
    });
  };

  const clearAllAlerts = () => {
    setAlerts([]);
    lastAlertAtRef.current.clear();
    activeAlertBySignatureRef.current.clear();
  };

  return {
    alerts,
    addAlert,
    dismissAlert,
    clearAllAlerts
  };
}