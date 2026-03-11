import { Suspense } from 'react';
import { getUsers } from '@/lib/admin/queries';
import { requireAdmin } from '@/lib/admin/auth';
import { UserTable } from '@/components/admin/user-table';
import { Pagination } from '@/components/admin/pagination';
import { SearchInput } from '@/components/admin/search-input';
import { UserFilter } from '@/components/admin/user-filter';
import { CsvExportButton } from '@/components/admin/csv-export-button';
import { exportUsersCsv } from '@/lib/admin/actions';

interface Props {
  searchParams: Promise<{ q?: string; role?: string; status?: string; provider?: string; dateFrom?: string; dateTo?: string; page?: string; sortBy?: string; sortOrder?: string }>;
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = params.q ?? '';
  const role = params.role ?? '';
  const status = params.status ?? '';
  const page = Number(params.page) || 1;
  const provider = params.provider ?? '';
  const dateFrom = params.dateFrom ?? '';
  const dateTo = params.dateTo ?? '';
  const sortBy = params.sortBy ?? '';
  const sortOrder = params.sortOrder ?? '';

  return (
    <div className="flex flex-col">
      <div className="flex min-h-[52px] shrink-0 items-center justify-between gap-3 border-b border-border px-6 py-2">
        <h1 className="text-[14px] font-semibold shrink-0">유저 관리</h1>
        <div className="flex flex-wrap items-center gap-3">
          <UserFilter currentRole={role} currentStatus={status} currentProvider={provider} currentDateFrom={dateFrom} currentDateTo={dateTo} />
          <div className="w-64">
            <SearchInput placeholder="이메일 또는 이름으로 검색..." defaultValue={query} />
          </div>
          <CsvExportButton action={exportUsersCsv} filename="users.csv" />
        </div>
      </div>

      <div className="p-6">
        <Suspense fallback={<UserTableSkeleton />}>
          <UsersContent query={query} role={role} status={status} provider={provider} dateFrom={dateFrom} dateTo={dateTo} page={page} sortBy={sortBy} sortOrder={sortOrder} />
        </Suspense>
      </div>
    </div>
  );
}

async function UsersContent({
  query, role, status, provider, dateFrom, dateTo, page, sortBy, sortOrder,
}: {
  query: string; role: string; status: string; provider: string; dateFrom: string; dateTo: string; page: number; sortBy: string; sortOrder: string;
}) {
  const [{ users, total, totalPages }, admin] = await Promise.all([
    getUsers({ query, role: role || undefined, status: status || undefined, provider: provider || undefined, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined, page, sortBy: sortBy || undefined, sortOrder: sortOrder || undefined }),
    requireAdmin(),
  ]);

  return (
    <>
      <div className="rounded-lg border border-border bg-card">
        <UserTable users={users} currentAdminId={admin.userId} sortBy={sortBy} sortOrder={sortOrder} />
      </div>
      <Pagination currentPage={page} totalPages={totalPages} total={total} />
    </>
  );
}

function UserTableSkeleton() {
  return (
    <>
      <div className="rounded-lg border border-border bg-card">
        <div className="hidden md:block">
          <div className="border-b border-border px-4 py-2.5">
            <div className="grid grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-3.5 rounded bg-muted animate-pulse" />
              ))}
            </div>
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border-b border-border last:border-b-0 px-4 py-2.5">
              <div className="grid grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="h-4 rounded bg-muted/60 animate-pulse" style={{ animationDelay: `${(i * 5 + j) * 30}ms` }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex justify-center">
        <div className="h-8 w-48 rounded bg-muted animate-pulse" />
      </div>
    </>
  );
}
