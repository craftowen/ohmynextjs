'use client';

import { useState } from 'react';
import { AuthForm } from '@/components/auth-form';
import { signIn, signInWithOAuth, signInAsDemo } from '@/lib/auth/actions';
import type { OAuthProvider } from '@/types/auth';

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export default function LoginPage() {
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);

  const handleSubmit = async (data: { email: string; password: string }) => {
    const result = await signIn(data);
    if (result?.error) {
      throw new Error(result.error.message);
    }
  };

  const handleOAuth = async (provider: OAuthProvider) => {
    await signInWithOAuth(provider);
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    setDemoError(null);
    const result = await signInAsDemo();
    if (result?.error) {
      setDemoError(result.error.message);
    }
    setDemoLoading(false);
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-4">
        <AuthForm mode="login" onSubmit={handleSubmit} onOAuthClick={handleOAuth} />

        {isDemoMode && (
          <div className="mx-auto w-full max-w-md px-4 sm:px-0">
            <div className="rounded-lg border border-dashed border-amber-500/50 bg-amber-500/5 p-4">
              <p className="mb-3 text-center text-sm text-amber-600 dark:text-amber-400">
                데모 사이트입니다. 관리자 페이지를 체험해보세요.
              </p>
              {demoError && (
                <p className="mb-2 text-center text-sm text-destructive">{demoError}</p>
              )}
              <button
                onClick={handleDemoLogin}
                disabled={demoLoading}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-500/20 transition-colors disabled:pointer-events-none disabled:opacity-50 dark:text-amber-300"
              >
                {demoLoading ? '로그인 중...' : '데모 관리자로 로그인'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
