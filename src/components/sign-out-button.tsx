'use client';

import { signOut } from '@/lib/auth/actions';
import { LogOut } from 'lucide-react';

export function SignOutButton({ className, showIcon = true }: { className?: string; showIcon?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => signOut()}
      className={className ?? 'inline-flex h-9 items-center justify-center rounded-md border border-input px-4 text-sm font-medium hover:bg-accent transition-colors'}
    >
      {showIcon && <LogOut className="h-4 w-4 mr-1.5" />}
      로그아웃
    </button>
  );
}
