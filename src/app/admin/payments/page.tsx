import { Suspense } from 'react';
import { getPayments } from '@/lib/admin/queries';
import { PaymentTable } from '@/components/admin/payment-table';
import { Pagination } from '@/components/admin/pagination';
import { SearchInput } from '@/components/admin/search-input';
import { CsvExportButton } from '@/components/admin/csv-export-button';
import { exportPaymentsCsv } from '@/lib/admin/actions';

interface Props {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}

export default async function AdminPaymentsPage({ searchParams }: Props) {
  const params = await searchParams;
  const status = params.status ?? '';
  const query = params.q ?? '';
  const page = Number(params.page) || 1;

  return (
    <div className="flex flex-col">
      <div className="flex h-[52px] shrink-0 items-center justify-between border-b border-border px-6">
        <h1 className="text-[14px] font-semibold">결제 내역</h1>
        <div className="flex items-center gap-3">
          <div className="w-64">
            <SearchInput placeholder="주문ID 또는 이메일로 검색..." defaultValue={query} />
          </div>
          <CsvExportButton action={exportPaymentsCsv} filename="payments.csv" />
        </div>
      </div>

      <div className="p-6">
        <Suspense fallback={<PaymentTableSkeleton />}>
          <PaymentsContent status={status} query={query} page={page} />
        </Suspense>
      </div>
    </div>
  );
}

async function PaymentsContent({
  status, query, page,
}: {
  status: string; query: string; page: number;
}) {
  const { payments, total, totalPages } = await getPayments({
    status: status || undefined,
    query: query || undefined,
    page,
  });

  return (
    <>
      <PaymentTable payments={payments} currentStatus={status} />
      <Pagination currentPage={page} totalPages={totalPages} total={total} />
    </>
  );
}

function PaymentTableSkeleton() {
  return (
    <>
      <div className="mb-4 flex items-center gap-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-7 w-14 rounded-md bg-muted animate-pulse" style={{ animationDelay: `${i * 50}ms` }} />
        ))}
      </div>
      <div className="rounded-lg border border-border bg-card">
        <div className="hidden md:block">
          <div className="border-b border-border px-4 py-2.5">
            <div className="grid grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-3.5 rounded bg-muted animate-pulse" />
              ))}
            </div>
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border-b border-border last:border-b-0 px-4 py-2.5">
              <div className="grid grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, j) => (
                  <div key={j} className="h-4 rounded bg-muted/60 animate-pulse" style={{ animationDelay: `${(i * 6 + j) * 25}ms` }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
