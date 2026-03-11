import { Suspense } from 'react';
import { getAuditLogs, getAuditLogActions } from '@/lib/admin/queries';
import { AuditLogTable } from '@/components/admin/audit-log-table';
import { AuditLogFilter } from '@/components/admin/audit-log-filter';
import { Pagination } from '@/components/admin/pagination';

interface Props {
  searchParams: Promise<{ action?: string; page?: string }>;
}

export default async function AdminAuditLogsPage({ searchParams }: Props) {
  const params = await searchParams;
  const action = params.action ?? '';
  const page = Number(params.page) || 1;

  return (
    <div className="flex flex-col">
      <div className="flex h-[52px] shrink-0 items-center justify-between border-b border-border px-6">
        <h1 className="text-[14px] font-semibold">감사 로그</h1>
        <Suspense fallback={<div className="h-8 w-32 rounded-md bg-muted animate-pulse" />}>
          <AuditFilterLoader currentAction={action} />
        </Suspense>
      </div>

      <div className="p-6">
        <Suspense fallback={<AuditLogSkeleton />}>
          <AuditLogsContent action={action} page={page} />
        </Suspense>
      </div>
    </div>
  );
}

async function AuditFilterLoader({ currentAction }: { currentAction: string }) {
  const actions = await getAuditLogActions();
  return <AuditLogFilter actions={actions} currentAction={currentAction} />;
}

async function AuditLogsContent({ action, page }: { action: string; page: number }) {
  const { logs, total, totalPages } = await getAuditLogs({
    action: action || undefined,
    page,
  });

  return (
    <>
      <div className="rounded-lg border border-border bg-card">
        <AuditLogTable logs={logs} />
      </div>
      <Pagination currentPage={page} totalPages={totalPages} total={total} />
    </>
  );
}

function AuditLogSkeleton() {
  return (
    <>
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-2.5">
          <div className="grid grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-3.5 rounded bg-muted animate-pulse" />
            ))}
          </div>
        </div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="border-b border-border last:border-b-0 px-4 py-2.5">
            <div className="grid grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, j) => (
                <div key={j} className="h-4 rounded bg-muted/60 animate-pulse" style={{ animationDelay: `${(i * 6 + j) * 20}ms` }} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-center">
        <div className="h-8 w-48 rounded bg-muted animate-pulse" />
      </div>
    </>
  );
}
