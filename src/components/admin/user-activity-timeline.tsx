const actionLabels: Record<string, string> = {
  'user.role.update': '역할 변경',
  'user.status.update': '상태 변경',
  'user.role_change': '역할 변경',
  'user.status_change': '상태 변경',
  'setting.create': '설정 생성',
  'setting.update': '설정 수정',
  'setting.delete': '설정 삭제',
  'legal.create': '문서 생성',
  'legal.update': '문서 수정',
  'legal.activate': '문서 활성화',
};

const actionColors: Record<string, string> = {
  create: 'bg-green-500',
  activate: 'bg-green-500',
  update: 'bg-blue-500',
  delete: 'bg-red-500',
  ban: 'bg-red-500',
};

function getActionColor(action: string): string {
  for (const [key, color] of Object.entries(actionColors)) {
    if (action.includes(key)) return color;
  }
  return 'bg-muted-foreground';
}

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

interface AuditLogItem {
  id: string;
  action: string;
  target: string | null;
  targetId: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: Date;
  userName: string | null;
  userEmail: string | null;
}

export function UserActivityTimeline({ logs }: { logs: AuditLogItem[] }) {
  if (logs.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-[13px] text-muted-foreground">
        활동 내역이 없습니다.
      </div>
    );
  }

  return (
    <div className="relative space-y-0">
      {logs.map((log, index) => (
        <div key={log.id} className="relative flex gap-4 pb-6 last:pb-0">
          {/* Vertical line */}
          {index < logs.length - 1 && (
            <div className="absolute left-[7px] top-4 h-full w-px bg-border" />
          )}

          {/* Dot */}
          <div className={`relative mt-1.5 h-[15px] w-[15px] shrink-0 rounded-full border-2 border-background ${getActionColor(log.action)}`} />

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-[13px] font-medium">
                {actionLabels[log.action] ?? log.action}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {formatRelativeTime(log.createdAt)}
              </span>
            </div>

            {log.userName || log.userEmail ? (
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                실행: {log.userName ?? log.userEmail}
              </p>
            ) : null}

            {log.details && Object.keys(log.details).length > 0 && (
              <div className="mt-1 rounded-md bg-muted/50 px-3 py-1.5">
                {Object.entries(log.details).map(([key, value]) => (
                  <p key={key} className="text-[12px] text-muted-foreground">
                    <span className="font-medium text-foreground/70">{key}:</span>{' '}
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
