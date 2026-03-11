import { clsx } from 'clsx';

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: '대기', className: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' },
  paid: { label: '완료', className: 'bg-green-500/10 text-green-600 dark:text-green-400' },
  failed: { label: '실패', className: 'bg-red-500/10 text-red-600 dark:text-red-400' },
  cancelled: { label: '취소', className: 'bg-muted text-muted-foreground' },
  refunded: { label: '환불', className: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  partial_refunded: { label: '부분환불', className: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
};

export function PaymentStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? { label: status, className: 'bg-muted text-muted-foreground' };
  return (
    <span className={clsx('inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium', config.className)}>
      {config.label}
    </span>
  );
}
