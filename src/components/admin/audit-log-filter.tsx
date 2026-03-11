'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export function AuditLogFilter({ actions, currentAction }: { actions: string[]; currentAction: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('action', value);
    } else {
      params.delete('action');
    }
    params.delete('page');
    router.push(`?${params.toString()}`);
  }

  return (
    <select
      value={currentAction}
      onChange={(e) => handleChange(e.target.value)}
      className="h-8 rounded-md border border-border bg-background px-2 text-[13px] text-foreground outline-none focus:ring-1 focus:ring-ring"
    >
      <option value="">전체 액션</option>
      {actions.map((action) => (
        <option key={action} value={action}>
          {action}
        </option>
      ))}
    </select>
  );
}
