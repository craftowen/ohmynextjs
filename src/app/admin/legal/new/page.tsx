import { requireAdmin } from '@/lib/admin/auth';
import { LegalDocForm } from './legal-doc-form';
import { db } from '@/lib/db/client';
import { legalDocuments } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default async function NewLegalDocPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; from?: string }>;
}) {
  const [, params] = await Promise.all([requireAdmin(), searchParams]);
  const type = params.type === 'privacy' ? 'privacy' : 'terms';

  let initialContent = '';
  let initialTitle = '';

  if (params.from) {
    const [source] = await db
      .select()
      .from(legalDocuments)
      .where(eq(legalDocuments.id, params.from))
      .limit(1);
    if (source) {
      initialContent = source.content;
      initialTitle = source.title;
    }
  }

  return (
    <div className="flex flex-col">
      {/* Page header */}
      <div className="flex h-[52px] shrink-0 items-center gap-3 border-b border-border px-6">
        <Link
          href={`/admin/legal?type=${type}`}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent transition-colors"
        >
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        </Link>
        <h1 className="text-[14px] font-semibold">
          {type === 'terms' ? '이용약관' : '개인정보처리방침'} 새 버전 작성
        </h1>
      </div>

      <div className="p-6">
        <LegalDocForm type={type} initialTitle={initialTitle} initialContent={initialContent} />
      </div>
    </div>
  );
}
