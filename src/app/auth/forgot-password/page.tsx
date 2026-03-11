'use client';

import { useState } from 'react';
import Link from 'next/link';
import { resetPasswordRequest } from '@/lib/auth/actions';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('이메일을 입력해주세요');
      return;
    }

    setLoading(true);
    try {
      const result = await resetPasswordRequest(email);
      if (result?.error) {
        setError(result.error.message);
      } else {
        setSent(true);
      }
    } catch {
      setError('오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
        <div className="mx-auto w-full max-w-md px-4 sm:px-0">
          <div className="rounded-lg border border-border bg-card p-6 sm:p-8 shadow-sm text-center">
            <h2 className="text-2xl font-bold tracking-tight">이메일을 확인해주세요</h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">{email}</strong>으로
              <br />
              비밀번호 재설정 링크를 보냈습니다.
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

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-md px-4 sm:px-0">
        <div className="rounded-lg border border-border bg-card p-6 sm:p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold tracking-tight">비밀번호 찾기</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              가입한 이메일을 입력하면 재설정 링크를 보내드립니다.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none">이메일</label>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {error && (
              <div role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? '전송 중...' : '재설정 링크 보내기'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link
              href="/auth/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              로그인으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
