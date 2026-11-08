import type { OrderStatus } from '../types';
import { formatStatus } from '../utils/format';

const statusStyles: Record<OrderStatus | string, string> = {
  pending: 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-300',
  confirmed: 'bg-blue-50 text-blue-800 ring-1 ring-inset ring-blue-300',
  preparing: 'bg-purple-50 text-purple-800 ring-1 ring-inset ring-purple-300',
  'out-for-delivery': 'bg-indigo-50 text-indigo-800 ring-1 ring-inset ring-indigo-300',
  delivered: 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-300',
  cancelled: 'bg-red-50 text-red-800 ring-1 ring-inset ring-red-300',
};

interface OrderStatusBadgeProps {
  status: OrderStatus | string;
  className?: string;
}

export default function OrderStatusBadge({
  status,
  className = '',
}: OrderStatusBadgeProps) {
  const badgeStyle =
    statusStyles[status] || 'bg-slate-100 text-slate-800 ring-1 ring-inset ring-slate-300';

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${badgeStyle} ${className}`}
    >
      {formatStatus(status)}
    </span>
  );
}
