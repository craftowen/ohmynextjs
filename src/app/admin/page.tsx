import { Suspense } from 'react';
import { Users, UserPlus, DollarSign, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { StatCard } from '@/components/admin/stat-card';
import { PaymentStatusBadge } from '@/components/admin/payment-status-badge';
import { getAdminStats, getRecentUsers, getRecentPayments } from '@/lib/admin/queries';

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col">
      {/* Page header */}
      <div className="flex h-[52px] shrink-0 items-center border-b border-border px-6">
        <h1 className="text-[14px] font-semibold">대시보드</h1>
      </div>

      <div className="p-6 space-y-6">
        <Suspense fallback={<StatsSkeleton />}>
          <StatsSection />
        </Suspense>

        <Suspense fallback={<TableSkeleton title="최근 가입" href="/admin/users" />}>
          <RecentUsersSection />
        </Suspense>

        <Suspense fallback={<TableSkeleton title="최근 결제" href="/admin/payments" />}>
          <RecentPaymentsSection />
        </Suspense>
      </div>
    </div>
  );
}

function growthText(current: number, previous: number): string | undefined {
  if (previous === 0 && current === 0) return undefined;
  if (previous === 0) return `+${current}`;
  const pct = Math.round(((current - previous) / previous) * 100);
  const sign = pct >= 0 ? '+' : '';
  return `전월 대비 ${sign}${pct}%`;
}

async function StatsSection() {
  const stats = await getAdminStats();

  const signupChange = stats.yesterdaySignups > 0
    ? `어제 ${stats.yesterdaySignups}명`
    : undefined;
  const revenueGrowth = growthText(stats.monthlyRevenue, stats.lastMonthRevenue);

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard title="총 유저" value={stats.totalUsers.toLocaleString()} icon={Users} />
      <StatCard title="오늘 가입" value={stats.todaySignups.toLocaleString()} icon={UserPlus} description={signupChange} />
      <StatCard title="총 매출" value={`₩${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} />
      <StatCard title="이번 달 매출" value={`₩${stats.monthlyRevenue.toLocaleString()}`} icon={TrendingUp} description={revenueGrowth} />
    </div>
  );
}

async function RecentUsersSection() {
  const recentUsers = await getRecentUsers(5);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[13px] font-semibold text-foreground">최근 가입</h2>
        <Link href="/admin/users" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">
          전체 보기
        </Link>
      </div>
      <div className="rounded-lg border border-border bg-card">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-2.5 text-left text-[12px] font-medium text-muted-foreground">이름</th>
              <th className="px-4 py-2.5 text-left text-[12px] font-medium text-muted-foreground">이메일</th>
              <th className="px-4 py-2.5 text-left text-[12px] font-medium text-muted-foreground">가입일</th>
            </tr>
          </thead>
          <tbody>
            {recentUsers.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-b-0 hover:bg-accent/50 transition-colors">
                <td className="px-4 py-2.5 font-medium">{u.name ?? '-'}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  {new Date(u.createdAt).toLocaleDateString('ko-KR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

async function RecentPaymentsSection() {
  const recentPayments = await getRecentPayments(5);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[13px] font-semibold text-foreground">최근 결제</h2>
        <Link href="/admin/payments" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">
          전체 보기
        </Link>
      </div>
      <div className="rounded-lg border border-border bg-card">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-2.5 text-left text-[12px] font-medium text-muted-foreground">주문ID</th>
              <th className="px-4 py-2.5 text-left text-[12px] font-medium text-muted-foreground">유저</th>
              <th className="px-4 py-2.5 text-right text-[12px] font-medium text-muted-foreground">금액</th>
              <th className="px-4 py-2.5 text-left text-[12px] font-medium text-muted-foreground">상태</th>
              <th className="px-4 py-2.5 text-left text-[12px] font-medium text-muted-foreground">결제일</th>
            </tr>
          </thead>
          <tbody>
            {recentPayments.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-b-0 hover:bg-accent/50 transition-colors">
                <td className="px-4 py-2.5 font-mono text-[12px]">{p.orderId}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{p.userEmail ?? '-'}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">₩{p.amount.toLocaleString()}</td>
                <td className="px-4 py-2.5"><PaymentStatusBadge status={p.status} /></td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  {p.paidAt ? new Date(p.paidAt).toLocaleDateString('ko-KR') : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-4">
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-6 w-24 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

function TableSkeleton({ title, href }: { title: string; href?: string }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[13px] font-semibold text-foreground">{title}</h2>
        {href && (
          <span className="text-[12px] text-muted-foreground">전체 보기</span>
        )}
      </div>
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-4 animate-pulse rounded bg-muted" />
        ))}
      </div>
    </section>
  );
}
