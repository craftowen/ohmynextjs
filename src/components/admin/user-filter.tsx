'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface UserFilterProps {
  currentRole: string;
  currentStatus: string;
  currentProvider?: string;
  currentDateFrom?: string;
  currentDateTo?: string;
}

export function UserFilter({
  currentRole,
  currentStatus,
  currentProvider = '',
  currentDateFrom = '',
  currentDateTo = '',
}: UserFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={currentRole}
        onChange={(e) => handleChange('role', e.target.value)}
        className="h-8 rounded-md border border-border bg-background px-2 text-[13px] text-foreground outline-none focus:ring-1 focus:ring-ring"
      >
        <option value="">전체 역할</option>
        <option value="user">유저</option>
        <option value="admin">관리자</option>
      </select>
      <select
        value={currentStatus}
        onChange={(e) => handleChange('status', e.target.value)}
        className="h-8 rounded-md border border-border bg-background px-2 text-[13px] text-foreground outline-none focus:ring-1 focus:ring-ring"
      >
        <option value="">전체 상태</option>
        <option value="active">활성</option>
        <option value="banned">차단</option>
        <option value="deleted">삭제됨</option>
      </select>
      <select
        value={currentProvider}
        onChange={(e) => handleChange('provider', e.target.value)}
        className="h-8 rounded-md border border-border bg-background px-2 text-[13px] text-foreground outline-none focus:ring-1 focus:ring-ring"
      >
        <option value="">전체 방식</option>
        <option value="email">이메일</option>
        <option value="google">Google</option>
        <option value="github">GitHub</option>
        <option value="kakao">카카오</option>
      </select>
      <input
        type="date"
        value={currentDateFrom}
        onChange={(e) => handleChange('dateFrom', e.target.value)}
        placeholder="시작일"
        className="h-8 rounded-md border border-border bg-background px-2 text-[13px] text-foreground outline-none focus:ring-1 focus:ring-ring"
      />
      <input
        type="date"
        value={currentDateTo}
        onChange={(e) => handleChange('dateTo', e.target.value)}
        placeholder="종료일"
        className="h-8 rounded-md border border-border bg-background px-2 text-[13px] text-foreground outline-none focus:ring-1 focus:ring-ring"
      />
    </div>
  );
}
