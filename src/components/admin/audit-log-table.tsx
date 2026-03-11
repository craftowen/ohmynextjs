'use client';

import type { AuditLogEntry } from '@/lib/admin/queries';

function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 30) return `${days}일 전`;
  return new Date(date).toLocaleDateString('ko-KR');
}

const actionLabels: Record<string, string> = {
  'user.role_change': '역할 변경',
  'user.status_change': '상태 변경',
  'settings.create': '설정 생성',
  'settings.update': '설정 수정',
  'settings.delete': '설정 삭제',
  'legal.create': '문서 생성',
  'legal.update': '문서 수정',
  'legal.activate': '문서 활성화',
};

function ActionBadge({ action }: { action: string }) {
  const isDestructive = action.includes('delete') || action.includes('ban');
  const isCreate = action.includes('create') || action.includes('activate');

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
        isDestructive
          ? 'bg-red-500/10 text-red-600 dark:text-red-400'
          : isCreate
            ? 'bg-green-500/10 text-green-600 dark:text-green-400'
            : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
      }`}
    >
      {actionLabels[action] ?? action}
    </span>
  );
}

function DetailsCell({ details }: { details: Record<string, unknown> | null }) {
  if (!details || Object.keys(details).length === 0) return <span className="text-muted-foreground">-</span>;

  const entries = Object.entries(details).slice(0, 3);
  return (
    <div className="flex flex-col gap-0.5">
      {entries.map(([key, value]) => (
        <span key={key} className="text-[12px] text-muted-foreground">
          <span className="font-medium text-foreground/70">{key}:</span>{' '}
          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
        </span>
      ))}
    </div>
  );
}

export function AuditLogTable({ logs }: { logs: AuditLogEntry[] }) {
  if (logs.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        감사 로그가 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-border text-left text-[12px] font-medium text-muted-foreground">
            <th className="px-4 py-2.5">시간</th>
            <th className="px-4 py-2.5">실행자</th>
            <th className="px-4 py-2.5">액션</th>
            <th className="px-4 py-2.5">대상</th>
            <th className="px-4 py-2.5">상세</th>
            <th className="px-4 py-2.5">IP</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr
              key={log.id}
              className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors"
            >
              <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground">
                {formatRelativeTime(log.createdAt)}
              </td>
              <td className="px-4 py-2.5">
                {log.user ? (
                  <span className="font-medium">{log.user.name ?? log.user.email}</span>
                ) : (
                  <span className="text-muted-foreground">시스템</span>
                )}
              </td>
              <td className="px-4 py-2.5">
                <ActionBadge action={log.action} />
              </td>
              <td className="px-4 py-2.5 text-muted-foreground">
                {log.target ? (
                  <span>
                    {log.target}
                    {log.targetId && (
                      <span className="ml-1 text-[11px] text-muted-foreground/60">
                        ({log.targetId.slice(0, 8)}...)
                      </span>
                    )}
                  </span>
                ) : (
                  '-'
                )}
              </td>
              <td className="max-w-[240px] px-4 py-2.5">
                <DetailsCell details={log.details} />
              </td>
              <td className="whitespace-nowrap px-4 py-2.5 text-[12px] text-muted-foreground">
                {log.ipAddress ?? '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
