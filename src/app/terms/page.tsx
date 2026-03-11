import type { Metadata } from 'next';
import nextDynamic from 'next/dynamic';

export const metadata: Metadata = {
  title: '이용약관',
  description: 'OhMyNextJS 서비스 이용약관',
};

const MarkdownRenderer = nextDynamic(
  () => import('@/components/admin/markdown-renderer').then((mod) => mod.MarkdownRenderer),
  { loading: () => <div className="animate-pulse h-96 bg-muted rounded-lg" /> }
);

const fallbackContent = `# 이용약관

## 제1조 (목적)
본 약관은 OhMyNextJS(이하 "서비스")의 이용에 관하여 서비스 제공자와 이용자 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.

## 제2조 (정의)
"서비스"란 OhMyNextJS가 제공하는 SaaS 보일러플레이트 및 관련 기능을 말합니다.

## 제3조 (약관의 효력)
본 약관은 서비스를 이용하고자 하는 모든 이용자에게 적용됩니다.
`;

async function getDoc() {
  try {
    const { getActiveLegalDoc } = await import('@/lib/admin/legal-actions');
    return await getActiveLegalDoc('terms');
  } catch {
    return null;
  }
}

export const revalidate = 3600; // 1시간마다 재생성

export default async function TermsPage() {
  const doc = await getDoc();

  return (
    <div className="container mx-auto max-w-screen-md px-4 py-16 sm:py-24">
      <h1 className="text-2xl sm:text-3xl font-bold">이용약관</h1>
      {doc && (
        <p className="mt-2 text-sm text-muted-foreground">
          버전 {doc.version} | 시행일: {doc.effectiveDate ? new Date(doc.effectiveDate).toLocaleDateString('ko-KR') : '-'}
        </p>
      )}
      <div className="mt-8">
        <MarkdownRenderer
          content={doc?.content ?? fallbackContent}
          className="prose prose-neutral dark:prose-invert max-w-none"
        />
      </div>
    </div>
  );
}
