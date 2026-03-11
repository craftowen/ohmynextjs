'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createLegalDoc } from '@/lib/admin/legal-actions';
import dynamic from 'next/dynamic';

const MarkdownRenderer = dynamic(
  () => import('@/components/admin/markdown-renderer').then((m) => ({ default: m.MarkdownRenderer })),
  { loading: () => <div className="animate-pulse h-[400px] rounded-md bg-muted" /> },
);
import { toast } from 'sonner';
import { clsx } from 'clsx';

interface Props {
  type: 'terms' | 'privacy';
  initialTitle: string;
  initialContent: string;
}

export function LegalDocForm({ type, initialTitle, initialContent }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [effectiveDate, setEffectiveDate] = useState('');
  const [preview, setPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('제목과 내용을 입력해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await createLegalDoc({
        type,
        title: title.trim(),
        content: content.trim(),
        effectiveDate: effectiveDate ? new Date(effectiveDate) : null,
      });
      if (result.success) {
        toast.success('문서가 저장되었습니다.');
        router.push(`/admin/legal?type=${type}`);
      } else {
        toast.error(result.error ?? '저장에 실패했습니다.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-4">
      <div>
        <label className="block text-[12px] font-medium text-muted-foreground mb-1">제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={`${type === 'terms' ? '이용약관' : '개인정보처리방침'} v2`}
          className="h-9 w-full rounded-md border border-border bg-background px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
          required
        />
      </div>

      <div>
        <label className="block text-[12px] font-medium text-muted-foreground mb-1">시행일</label>
        <input
          type="date"
          value={effectiveDate}
          onChange={(e) => setEffectiveDate(e.target.value)}
          className="h-9 rounded-md border border-border bg-background px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[12px] font-medium text-muted-foreground">내용 (마크다운)</label>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPreview(false)}
              className={clsx(
                'rounded-md px-2 py-0.5 text-[12px] font-medium transition-colors',
                !preview ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              편집
            </button>
            <button
              type="button"
              onClick={() => setPreview(true)}
              className={clsx(
                'rounded-md px-2 py-0.5 text-[12px] font-medium transition-colors',
                preview ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              미리보기
            </button>
          </div>
        </div>
        {preview ? (
          <div className="rounded-md border border-border bg-card p-4 min-h-[400px]">
            <MarkdownRenderer content={content} />
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="마크다운으로 약관 내용을 작성하세요..."
            required
          />
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {submitting ? '저장 중...' : '저장'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-border px-3 py-1.5 text-[13px] font-medium hover:bg-accent transition-colors"
        >
          취소
        </button>
      </div>
    </form>
  );
}
