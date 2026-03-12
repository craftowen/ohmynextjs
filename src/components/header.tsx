import { Suspense } from 'react';
import Link from 'next/link';
import { GithubIcon } from 'lucide-react';
import { createClient } from '@/lib/auth/server';
import { getUserRole } from '@/lib/auth/role';
import { ThemeToggle } from './theme-toggle';
import { MobileNav } from './mobile-nav';
import { SignOutButton } from './sign-out-button';

export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
}

const defaultNavItems: NavItem[] = [];

async function getAuthState() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = !error ? data?.claims?.sub : null;

  if (!userId) return { user: null, isAdmin: false };

  const role = await getUserRole(userId);
  return {
    user: { email: data?.claims?.email },
    isAdmin: role === 'admin',
  };
}

export function Header({ navItems = defaultNavItems }: { navItems?: NavItem[] }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-screen-xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            OhMyNextJS
          </Link>

          {navItems.length > 0 && (
            <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Suspense fallback={<AuthFallback />}>
            <AuthNav navItems={navItems} />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

function AuthFallback() {
  return (
    <>
      <a
        href="https://github.com/craftowen/ohmynextjs"
        target="_blank"
        rel="noopener noreferrer"
        className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-md border border-input hover:bg-accent transition-colors"
        aria-label="GitHub"
      >
        <GithubIcon className="h-4 w-4" />
      </a>
      <ThemeToggle />
      <div className="hidden sm:inline-flex h-9 w-20 animate-pulse rounded-md bg-muted" />
    </>
  );
}

async function AuthNav({ navItems }: { navItems: NavItem[] }) {
  const { user, isAdmin } = await getAuthState();

  return (
    <>
      {isAdmin && (
        <Link
          href="/admin"
          className="hidden sm:inline-flex h-9 items-center justify-center rounded-md border border-input px-3 text-sm font-medium hover:bg-accent transition-colors"
        >
          관리자
        </Link>
      )}
      <a
        href="https://github.com/craftowen/ohmynextjs"
        target="_blank"
        rel="noopener noreferrer"
        className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-md border border-input hover:bg-accent transition-colors"
        aria-label="GitHub"
      >
        <GithubIcon className="h-4 w-4" />
      </a>
      <ThemeToggle />
      {user ? (
        <>
          <Link
            href="/dashboard"
            className="hidden sm:inline-flex h-9 items-center justify-center rounded-md border border-input px-3 text-sm font-medium hover:bg-accent transition-colors"
          >
            대시보드
          </Link>
          <SignOutButton
            showIcon={false}
            className="hidden sm:inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          />
        </>
      ) : (
        <Link
          href="/auth/login"
          className="hidden sm:inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          로그인
        </Link>
      )}
      <MobileNav navItems={navItems} user={user} isAdmin={isAdmin} />
    </>
  );
}
