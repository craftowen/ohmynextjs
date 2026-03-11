'use client';

import { useState, useTransition } from 'react';
import { updateUserRole, updateUserStatus } from '@/lib/admin/actions';
import { toast } from 'sonner';
import { ConfirmDialog } from './confirm-dialog';

interface UserDetail {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: 'user' | 'admin';
  status: 'active' | 'banned' | 'deleted';
  provider: string | null;
  metadata: Record<string, unknown> | null;
  lastSignInAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const roleBadge = {
  admin: 'bg-primary/10 text-primary',
  user: 'bg-muted text-muted-foreground',
};

const statusBadge = {
  active: 'bg-green-500/10 text-green-600 dark:text-green-400',
  banned: 'bg-red-500/10 text-red-600 dark:text-red-400',
  deleted: 'bg-muted text-muted-foreground',
};

const providerLabels: Record<string, string> = {
  email: '이메일',
  google: 'Google',
  github: 'GitHub',
  kakao: '카카오',
};

export function UserDetailCard({
  user,
  currentAdminId,
}: {
  user: UserDetail;
  currentAdminId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [dialog, setDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => Promise<void>;
  }>({ open: false, title: '', description: '', action: async () => {} });

  const isSelf = user.id === currentAdminId;

  const handleRoleChange = (newRole: 'user' | 'admin') => {
    if (isSelf) {
      toast.error('자기 자신의 역할은 변경할 수 없습니다.');
      return;
    }
    setDialog({
      open: true,
      title: '역할 변경',
      description: `${user.email}의 역할을 ${newRole}로 변경하시겠습니까?`,
      action: async () => {
        startTransition(async () => {
          const result = await updateUserRole(user.id, newRole);
          if (result.success) toast.success('역할이 변경되었습니다.');
          else toast.error(result.error);
        });
      },
    });
  };

  const handleStatusChange = (newStatus: 'active' | 'banned') => {
    if (isSelf) {
      toast.error('자기 자신의 상태는 변경할 수 없습니다.');
      return;
    }
    setDialog({
      open: true,
      title: '상태 변경',
      description: `${user.email}의 상태를 ${newStatus}로 변경하시겠습니까?`,
      action: async () => {
        startTransition(async () => {
          const result = await updateUserStatus(user.id, newStatus);
          if (result.success) toast.success('상태가 변경되었습니다.');
          else toast.error(result.error);
        });
      },
    });
  };

  return (
    <>
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-muted text-lg font-semibold text-muted-foreground">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name ?? user.email}
                  className="h-14 w-14 rounded-full object-cover"
                />
              ) : (
                (user.name?.[0] ?? user.email[0]).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-[16px] font-semibold truncate">
                {user.name ?? '-'}
              </h2>
              <p className="text-[13px] text-muted-foreground truncate">{user.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${roleBadge[user.role]}`}>
                {user.role}
              </span>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusBadge[user.status]}`}>
                {user.status}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem label="로그인 방식" value={providerLabels[user.provider ?? ''] ?? user.provider ?? '-'} />
          <InfoItem label="가입일" value={new Date(user.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} />
          <InfoItem label="최종 로그인" value={user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'} />
          <InfoItem label="최종 수정" value={new Date(user.updatedAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} />
        </div>

        <div className="flex items-center gap-3 border-t border-border px-6 py-3">
          <span className="text-[12px] text-muted-foreground">역할:</span>
          <select
            value={user.role}
            onChange={(e) => handleRoleChange(e.target.value as 'user' | 'admin')}
            disabled={isSelf || isPending}
            className="rounded-md border border-border bg-background px-2 py-1 text-[12px] disabled:opacity-50"
          >
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>

          <span className="text-[12px] text-muted-foreground ml-4">상태:</span>
          <select
            value={user.status}
            onChange={(e) => handleStatusChange(e.target.value as 'active' | 'banned')}
            disabled={isSelf || isPending}
            className="rounded-md border border-border bg-background px-2 py-1 text-[12px] disabled:opacity-50"
          >
            <option value="active">active</option>
            <option value="banned">banned</option>
          </select>
        </div>
      </div>

      <ConfirmDialog
        open={dialog.open}
        title={dialog.title}
        description={dialog.description}
        onConfirm={async () => {
          setDialog((d) => ({ ...d, open: false }));
          await dialog.action();
        }}
        onCancel={() => setDialog((d) => ({ ...d, open: false }))}
      />
    </>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card px-6 py-3">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-[13px]">{value}</p>
    </div>
  );
}
