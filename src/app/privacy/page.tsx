import type { Metadata } from 'next';
import nextDynamic from 'next/dynamic';

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: 'OhMyNextJS 개인정보처리방침',
};

const MarkdownRenderer = nextDynamic(
  () => import('@/components/admin/markdown-renderer').then((mod) => mod.MarkdownRenderer),
  { loading: () => <div className="animate-pulse h-96 bg-muted rounded-lg" /> }
);

const fallbackContent = `# 개인정보처리방침

## 1. 수집하는 개인정보
서비스 이용을 위해 이메일 주소, 이름, 프로필 이미지를 수집합니다. 소셜 로그인 시 해당 플랫폼에서 제공하는 기본 프로필 정보를 수집할 수 있습니다.

## 2. 개인정보의 이용 목적
수집된 개인정보는 서비스 제공, 본인 인증, 서비스 개선 목적으로만 이용합니다.

## 3. 개인정보의 보유 및 이용 기간
회원 탈퇴 시 즉시 삭제하며, 관계 법령에 의해 보관이 필요한 경우 해당 기간 동안 보관합니다.
`;

async function getDoc() {
  try {
    const { getActiveLegalDoc } = await import('@/lib/admin/legal-actions');
    return await getActiveLegalDoc('privacy');
  } catch {
    return null;
  }
}

export const revalidate = 3600; // 1시간마다 재생성

export default async function PrivacyPage() {
  const doc = await getDoc();

  return (
    <div className="container mx-auto max-w-screen-md px-4 py-16 sm:py-24">
      <h1 className="text-2xl sm:text-3xl font-bold">개인정보처리방침</h1>
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
