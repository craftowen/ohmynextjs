'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <h2 className="text-2xl font-bold tracking-tight">
          문제가 발생했습니다
        </h2>
        <p className="mt-3 text-muted-foreground">
          요청을 처리하는 중 오류가 발생했습니다. 다시 시도해 주세요.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            다시 시도
          </button>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-md border border-border px-6 text-sm font-medium hover:bg-muted transition-colors"
          >
            홈으로
          </Link>
        </div>
      </div>
    </div>
  );
}
