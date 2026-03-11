import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { requireAdmin } from '@/lib/admin/auth';
import { getUserById, getUserAuditLogs, getUserPayments } from '@/lib/admin/queries';
import { UserDetailCard } from '@/components/admin/user-detail-card';
import { UserActivityTimeline } from '@/components/admin/user-activity-timeline';
import { PaymentStatusBadge } from '@/components/admin/payment-status-badge';
import { routes } from '@/lib/routes';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminUserDetailPage({ params }: Props) {
  const { id } = await params;
  const [user, admin] = await Promise.all([
    getUserById(id),
    requireAdmin(),
  ]);

  if (!user) notFound();

  return (
    <div className="flex flex-col">
      <div className="flex h-[52px] shrink-0 items-center gap-3 border-b border-border px-6">
        <Link
          href={routes.admin.users}
          className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          유저 목록
        </Link>
        <span className="text-border">/</span>
        <h1 className="text-[14px] font-semibold truncate">
          {user.name ?? user.email}
        </h1>
      </div>

      <div className="space-y-6 p-6">
        <UserDetailCard user={user} currentAdminId={admin.userId} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Suspense fallback={<SectionSkeleton title="활동 내역" />}>
            <ActivitySection userId={id} />
          </Suspense>

          <Suspense fallback={<SectionSkeleton title="결제 내역" />}>
            <PaymentsSection userId={id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

async function ActivitySection({ userId }: { userId: string }) {
  const logs = await getUserAuditLogs(userId);

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-6 py-3">
        <h3 className="text-[13px] font-semibold">활동 내역</h3>
      </div>
      <div className="p-6">
        <UserActivityTimeline logs={logs} />
      </div>
    </div>
  );
}

async function PaymentsSection({ userId }: { userId: string }) {
  const paymentsList = await getUserPayments(userId);

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-6 py-3">
        <h3 className="text-[13px] font-semibold">결제 내역</h3>
      </div>
      {paymentsList.length === 0 ? (
        <div className="flex h-32 items-center justify-center text-[13px] text-muted-foreground">
          결제 내역이 없습니다.
        </div>
      ) : (
        <div className="divide-y divide-border">
          {paymentsList.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between px-6 py-3">
              <div className="min-w-0">
                <p className="text-[13px] font-medium truncate">{payment.orderId}</p>
                <p className="text-[11px] text-muted-foreground">
                  {payment.method ?? '-'} &middot;{' '}
                  {payment.paidAt
                    ? new Date(payment.paidAt).toLocaleDateString('ko-KR')
                    : new Date(payment.createdAt).toLocaleDateString('ko-KR')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-semibold">
                  {payment.amount.toLocaleString('ko-KR')}
                  <span className="ml-0.5 text-[11px] font-normal text-muted-foreground">
                    {payment.currency}
                  </span>
                </span>
                <PaymentStatusBadge status={payment.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SectionSkeleton({ title }: { title: string }) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-6 py-3">
        <h3 className="text-[13px] font-semibold">{title}</h3>
      </div>
      <div className="p-6 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 rounded bg-muted/60 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
        ))}
      </div>
    </div>
  );
}
