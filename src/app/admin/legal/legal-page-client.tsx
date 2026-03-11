'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { activateLegalDoc } from '@/lib/admin/legal-actions';
import { clsx } from 'clsx';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';

interface LegalDoc {
  id: string;
  type: string;
  version: number;
  title: string;
  isActive: boolean;
  effectiveDate: Date | null;
  createdAt: Date;
}

export function LegalPageClient({ docs, currentType }: { docs: LegalDoc[]; currentType: string }) {
  const router = useRouter();
  const [activating, setActivating] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const doActivate = async (id: string) => {
    setActivating(id);
    try {
      const result = await activateLegalDoc(id);
      if (result.success) {
        toast.success('버전이 활성화되었습니다.');
      } else {
        toast.error(result.error ?? '활성화에 실패했습니다.');
      }
      router.refresh();
    } finally {
      setActivating(null);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Page header */}
      <div className="flex h-[52px] shrink-0 items-center justify-between border-b border-border px-6">
        <h1 className="text-[14px] font-semibold">약관 관리</h1>
        <Link
          href={`/admin/legal/new?type=${currentType}`}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          새 버전 작성
        </Link>
      </div>

      <div className="p-6">
        {/* Tabs - Linear style */}
        <div className="flex items-center gap-1 mb-4">
          <Link
            href="/admin/legal?type=terms"
            className={clsx(
              'rounded-md px-2.5 py-1 text-[13px] font-medium transition-colors',
              currentType === 'terms'
                ? 'bg-accent text-foreground'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
            )}
          >
            이용약관
          </Link>
          <Link
            href="/admin/legal?type=privacy"
            className={clsx(
              'rounded-md px-2.5 py-1 text-[13px] font-medium transition-colors',
              currentType === 'privacy'
                ? 'bg-accent text-foreground'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
            )}
          >
            개인정보처리방침
          </Link>
        </div>

        {/* Table */}
        {docs.length === 0 ? (
          <div className="rounded-lg border border-border bg-card py-12 text-center">
            <p className="text-[13px] text-muted-foreground">등록된 문서가 없습니다.</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-2.5 text-left text-[12px] font-medium text-muted-foreground">버전</th>
                  <th className="px-4 py-2.5 text-left text-[12px] font-medium text-muted-foreground">제목</th>
                  <th className="px-4 py-2.5 text-left text-[12px] font-medium text-muted-foreground">시행일</th>
                  <th className="px-4 py-2.5 text-left text-[12px] font-medium text-muted-foreground">상태</th>
                  <th className="px-4 py-2.5 text-left text-[12px] font-medium text-muted-foreground">작성일</th>
                  <th className="px-4 py-2.5 text-left text-[12px] font-medium text-muted-foreground">액션</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((doc) => (
                  <tr key={doc.id} className="border-b border-border last:border-b-0 hover:bg-accent/50 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-[12px]">v{doc.version}</td>
                    <td className="px-4 py-2.5 font-medium">{doc.title}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {doc.effectiveDate ? new Date(doc.effectiveDate).toLocaleDateString('ko-KR') : '-'}
                    </td>
                    <td className="px-4 py-2.5">
                      {doc.isActive ? (
                        <span className="inline-flex rounded-full bg-green-500/10 px-2 py-0.5 text-[11px] font-medium text-green-600 dark:text-green-400">
                          활성
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          비활성
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {new Date(doc.createdAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        {!doc.isActive && (
                          <button
                            onClick={() => setConfirmId(doc.id)}
                            disabled={activating === doc.id}
                            className="rounded-md px-2 py-0.5 text-[12px] font-medium text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
                          >
                            {activating === doc.id ? '처리중...' : '활성화'}
                          </button>
                        )}
                        <Link
                          href={`/admin/legal/new?type=${doc.type}&from=${doc.id}`}
                          className="rounded-md px-2 py-0.5 text-[12px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                        >
                          복제
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmId !== null}
        title="버전 활성화"
        description="이 버전을 활성화하시겠습니까? 기존 활성 버전은 비활성화됩니다."
        onConfirm={async () => {
          const id = confirmId;
          setConfirmId(null);
          if (id) await doActivate(id);
        }}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
