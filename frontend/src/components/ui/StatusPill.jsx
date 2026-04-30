import React from 'react';
import { clsx } from 'clsx';
import { Check, X, AlertTriangle, Info } from 'lucide-react';

export const StatusPill = ({ status = 'info', className }) => {
  const styles = {
    present: 'bg-success/20 text-success border-success/30',
    absent: 'bg-danger/20 text-danger border-danger/30',
    warning: 'bg-warning/20 text-warning border-warning/30',
    info: 'bg-info/20 text-info border-info/30',
  };

  const icons = {
    present: Check,
    absent: X,
    warning: AlertTriangle,
    info: Info,
  };

  const Icon = icons[status];

  return (
    <span
      className={clsx(
        'rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-widest inline-flex items-center gap-1.5 border',
        styles[status],
        className
      )}
    >
      <Icon size={12} strokeWidth={2.5} />
      {status}
    </span>
  );
};

export default StatusPill;
