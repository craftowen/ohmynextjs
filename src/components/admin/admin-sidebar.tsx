'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  Menu,
  X,
  FileText,
  ScrollText,
  ChevronRight,
} from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { label: '대시보드', href: '/admin', icon: LayoutDashboard },
  { label: '유저 관리', href: '/admin/users', icon: Users },
  { label: '결제 내역', href: '/admin/payments', icon: CreditCard },
  { label: '약관 관리', href: '/admin/legal', icon: FileText },
  { label: '감사 로그', href: '/admin/audit-logs', icon: ScrollText },
  { label: '앱 설정', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  const sidebar = (
    <div className="flex h-full flex-col">
      {/* Workspace header */}
      <div className="flex h-[52px] items-center gap-2 px-4">
        <div className="flex h-5 w-5 items-center justify-center rounded bg-primary text-[10px] font-bold text-primary-foreground">
          A
        </div>
        <span className="text-[13px] font-semibold text-foreground">Admin</span>
        <ChevronRight className="ml-auto h-3 w-3 text-muted-foreground" />
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 px-2 pt-2" role="navigation" aria-label="관리자 메뉴">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={clsx(
              'group flex items-center gap-2.5 rounded-md px-2 py-[6px] text-[13px] font-medium transition-colors',
              isActive(item.href)
                ? 'bg-accent text-foreground'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
            )}
            aria-current={isActive(item.href) ? 'page' : undefined}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="mt-auto border-t border-border px-2 py-2">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-md px-2 py-[6px] text-[13px] font-medium text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          사이트로 돌아가기
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-3 left-3 z-50 inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card md:hidden"
        aria-label="관리자 메뉴 토글"
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 w-[240px] border-r border-border bg-card transition-transform md:relative md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebar}
      </aside>
    </>
  );
}
