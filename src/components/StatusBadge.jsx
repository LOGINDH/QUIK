import React from 'react';
import { Clock, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

const StatusBadge = ({ status = 'pending', className = '' }) => {
  const normalized = (status || '').toLowerCase();

  const config = {
    pending: {
      label: 'Searching Nearby',
      bg: 'bg-emerald-100/70',
      text: 'text-emerald-900',
      border: 'border-emerald-300',
      icon: Clock,
      dot: 'bg-emerald-600 animate-pulse',
    },
    accepted: {
      label: 'Provider on the Way',
      bg: 'bg-emerald-800 text-white',
      text: 'text-white',
      border: 'border-emerald-800',
      icon: CheckCircle2,
      dot: 'bg-emerald-300 animate-ping',
    },
    completed: {
      label: 'Completed',
      bg: 'bg-emerald-950 text-white',
      text: 'text-emerald-100',
      border: 'border-emerald-950',
      icon: CheckCircle2,
      dot: 'bg-emerald-400',
    },
    cancelled: {
      label: 'Cancelled',
      bg: 'bg-stone-100',
      text: 'text-stone-700',
      border: 'border-stone-300',
      icon: XCircle,
      dot: 'bg-stone-500',
    },
  };

  const current = config[normalized] || config.pending;
  const IconComponent = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-2xs ${current.bg} ${current.border} ${current.text} ${className}`}
    >
      <span className={`w-2 h-2 rounded-full ${current.dot}`} />
      <IconComponent className="w-3.5 h-3.5" />
      <span>{current.label}</span>
    </span>
  );
};

export default StatusBadge;
