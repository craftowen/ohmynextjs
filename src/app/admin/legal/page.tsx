import { Suspense } from 'react';
import { requireAdmin } from '@/lib/admin/auth';
import { getLegalDocs } from '@/lib/admin/legal-actions';
import { LegalPageClient } from './legal-page-client';

export default async function AdminLegalPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const [, params] = await Promise.all([requireAdmin(), searchParams]);
  const type = params.type === 'privacy' ? 'privacy' : 'terms';

  return (
    <Suspense fallback={<LegalSkeleton />}>
      <LegalContent type={type} />
    </Suspense>
  );
}

async function LegalContent({ type }: { type: 'terms' | 'privacy' }) {
  const docs = await getLegalDocs(type);
  return <LegalPageClient docs={docs} currentType={type} />;
}

function LegalSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="flex h-[52px] shrink-0 items-center justify-between border-b border-border px-6">
        <div className="h-4 w-24 rounded bg-muted animate-pulse" />
        <div className="flex gap-2">
          <div className="h-8 w-20 rounded-md bg-muted animate-pulse" />
          <div className="h-8 w-20 rounded-md bg-muted animate-pulse" />
        </div>
      </div>
      <div className="p-6 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4">
            <div className="h-4 w-32 rounded bg-muted animate-pulse" />
            <div className="mt-2 h-3 w-48 rounded bg-muted/60 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
