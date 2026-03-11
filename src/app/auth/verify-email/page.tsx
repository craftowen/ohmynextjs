import Link from 'next/link';
import { Mail } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '이메일 인증',
};

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-md px-4 sm:px-0">
        <div className="rounded-lg border border-border bg-card p-6 sm:p-8 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">이메일을 확인해주세요</h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            입력하신 이메일로 인증 링크를 보냈습니다.
            <br />
            이메일을 확인하고 링크를 클릭하면 가입이 완료됩니다.
          </p>
          <div className="mt-6 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
            이메일이 보이지 않으면 스팸 폴더를 확인해주세요.
          </div>
          <div className="mt-6">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              로그인으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
