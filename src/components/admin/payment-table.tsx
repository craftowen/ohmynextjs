import Link from 'next/link';
import { PaymentStatusBadge } from './payment-status-badge';
import type { PaymentWithUser } from '@/lib/admin/queries';
import { clsx } from 'clsx';

const statuses = [
  { value: '', label: '전체' },
  { value: 'pending', label: '대기' },
  { value: 'paid', label: '완료' },
  { value: 'failed', label: '실패' },
  { value: 'cancelled', label: '취소' },
  { value: 'refunded', label: '환불' },
];

interface PaymentTableProps {
  payments: PaymentWithUser[];
  currentStatus: string;
}

const formatAmount = (amount: number) => `₩${amount.toLocaleString()}`;
const formatDate = (date: Date | null) =>
  date ? new Date(date).toLocaleDateString('ko-KR') : '-';

export function PaymentTable({ payments, currentStatus }: PaymentTableProps) {
  return (
    <div>
      {/* Status filter tabs - Linear style */}
      <div className="mb-4 flex items-center gap-1" role="tablist" aria-label="결제 상태 필터">
        {statuses.map((s) => (
          <Link
            key={s.value}
            href={s.value ? `/admin/payments?status=${s.value}` : '/admin/payments'}
            role="tab"
            aria-selected={currentStatus === s.value}
            className={clsx(
              'rounded-md px-2.5 py-1 text-[13px] font-medium transition-colors',
              currentStatus === s.value
                ? 'bg-accent text-foreground'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
            )}
          >
            {s.label}
          </Link>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-lg border border-border bg-card overflow-x-auto">
        <table className="w-full text-[13px]" role="table">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-2.5 text-left text-[12px] font-medium text-muted-foreground">주문ID</th>
              <th className="px-4 py-2.5 text-left text-[12px] font-medium text-muted-foreground">유저</th>
              <th className="px-4 py-2.5 text-right text-[12px] font-medium text-muted-foreground">금액</th>
              <th className="px-4 py-2.5 text-left text-[12px] font-medium text-muted-foreground">상태</th>
              <th className="px-4 py-2.5 text-left text-[12px] font-medium text-muted-foreground">결제수단</th>
              <th className="px-4 py-2.5 text-left text-[12px] font-medium text-muted-foreground">결제일</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-b-0 hover:bg-accent/50 transition-colors">
                <td className="px-4 py-2.5 font-mono text-[12px]">{p.orderId}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{p.user?.email ?? '-'}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{formatAmount(p.amount)}</td>
                <td className="px-4 py-2.5"><PaymentStatusBadge status={p.status} /></td>
                <td className="px-4 py-2.5 text-muted-foreground">{p.method ?? '-'}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{formatDate(p.paidAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col divide-y divide-border rounded-lg border border-border bg-card md:hidden">
        {payments.map((p) => (
          <div key={p.id} className="px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[12px] text-muted-foreground">{p.orderId}</span>
              <PaymentStatusBadge status={p.status} />
            </div>
            <p className="mt-1 text-[12px] text-muted-foreground">{p.user?.email ?? '-'}</p>
            <p className="mt-1 text-[15px] font-semibold tabular-nums">{formatAmount(p.amount)}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{formatDate(p.paidAt)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
