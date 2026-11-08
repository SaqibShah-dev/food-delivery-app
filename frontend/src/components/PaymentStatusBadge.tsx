import type { PaymentStatus } from '../types';
import { formatStatus } from '../utils/format';

const paymentStyles: Record<PaymentStatus | string, string> = {
  pending: 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-300',
  paid: 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-300',
  failed: 'bg-red-50 text-red-800 ring-1 ring-inset ring-red-300',
  refunded: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-300',
};

interface PaymentStatusBadgeProps {
  status: PaymentStatus | string;
  className?: string;
}

export default function PaymentStatusBadge({
  status,
  className = '',
}: PaymentStatusBadgeProps) {
  const badgeStyle =
    paymentStyles[status] || 'bg-slate-100 text-slate-800 ring-1 ring-inset ring-slate-300';

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${badgeStyle} ${className}`}
    >
      {formatStatus(status)}
    </span>
  );
}
