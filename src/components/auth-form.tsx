'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SocialButtons } from './social-buttons';
import { MIN_PASSWORD_LENGTH } from '@/lib/utils';

interface AuthFormProps {
  mode: 'login' | 'signup';
  showSocial?: boolean;
  onSubmit?: (data: { email: string; password: string; name?: string }) => Promise<void>;
  onOAuthClick?: (provider: 'google' | 'kakao' | 'naver' | 'github') => Promise<void>;
}

export function AuthForm({ mode, showSocial = true, onSubmit, onOAuthClick }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isLogin = mode === 'login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) { setError('이메일을 입력해주세요'); return; }
    if (!password) { setError('비밀번호를 입력해주세요'); return; }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상이어야 합니다`);
      return;
    }

    setLoading(true);
    try {
      await onSubmit?.({ email, password, ...(!isLogin ? { name } : {}) });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="auth-form" className="mx-auto w-full max-w-md px-4 sm:px-0">
      <div className="rounded-lg border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight">
            {isLogin ? '로그인' : '회원가입'}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {isLogin ? '계정에 로그인하세요' : '새 계정을 만들어보세요'}
          </p>
        </div>

        {showSocial && (
          <>
            <SocialButtons onProviderClick={onOAuthClick} />
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">또는</span>
              </div>
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium leading-none">이름</label>
              <input
                id="name"
                type="text"
                placeholder="홍길동"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          )}

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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium leading-none">비밀번호</label>
              {isLogin && (
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  비밀번호를 잊으셨나요?
                </Link>
              )}
            </div>
            <input
              id="password"
              type="password"
              placeholder={`${MIN_PASSWORD_LENGTH}자 이상`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {loading ? '처리 중...' : isLogin ? '로그인' : '회원가입'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          {isLogin ? (
            <>
              계정이 없으신가요?{' '}
              <Link href="/auth/signup" className="font-medium text-primary underline-offset-4 hover:underline">
                회원가입
              </Link>
            </>
          ) : (
            <span className="text-muted-foreground">
              이미 계정이 있으신가요?{' '}
              <Link href="/auth/login" className="font-medium text-primary underline-offset-4 hover:underline">
                로그인
              </Link>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
