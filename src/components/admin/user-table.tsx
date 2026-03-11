'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { updateUserRole, updateUserStatus } from '@/lib/admin/actions';
import { toast } from 'sonner';
import { ConfirmDialog } from './confirm-dialog';
import { routes } from '@/lib/routes';

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  role: 'user' | 'admin';
  status: 'active' | 'banned' | 'deleted';
  provider: string | null;
  createdAt: Date;
  lastSignInAt: Date | null;
}

interface UserTableProps {
  users: UserRow[];
  currentAdminId: string;
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

export function UserTable({ users, currentAdminId }: UserTableProps) {
  const [isPending, startTransition] = useTransition();
  const [dialog, setDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => Promise<void>;
  }>({ open: false, title: '', description: '', action: async () => {} });

  const handleRoleChange = (user: UserRow, newRole: 'user' | 'admin') => {
    if (user.id === currentAdminId) {
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
          if (result.success) {
            toast.success('역할이 변경되었습니다.');
          } else {
            toast.error(result.error);
          }
        });
      },
    });
  };

  const handleStatusChange = (user: UserRow, newStatus: 'active' | 'banned') => {
    if (user.id === currentAdminId) {
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
          if (result.success) {
            toast.success('상태가 변경되었습니다.');
          } else {
            toast.error(result.error);
          }
        });
      },
    });
  };

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-[13px]" role="table">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-2.5 text-left text-[12px] font-medium text-muted-foreground">이름</th>
              <th className="px-4 py-2.5 text-left text-[12px] font-medium text-muted-foreground">이메일</th>
              <th className="px-4 py-2.5 text-left text-[12px] font-medium text-muted-foreground">역할</th>
              <th className="px-4 py-2.5 text-left text-[12px] font-medium text-muted-foreground">상태</th>
              <th className="px-4 py-2.5 text-left text-[12px] font-medium text-muted-foreground">가입일</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-border last:border-b-0 hover:bg-accent/50 transition-colors">
                <td className="px-4 py-2.5 font-medium">
                  <Link
                    href={routes.admin.userDetail(user.id)}
                    className="hover:text-primary hover:underline underline-offset-2 transition-colors"
                  >
                    {user.name ?? '-'}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{user.email}</td>
                <td className="px-4 py-2.5">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user, e.target.value as 'user' | 'admin')}
                    disabled={user.id === currentAdminId || isPending}
                    className={`rounded-md border border-border bg-background px-2 py-0.5 text-[12px] font-medium disabled:opacity-50 ${roleBadge[user.role]}`}
                    aria-label={`${user.email} 역할`}
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="px-4 py-2.5">
                  <select
                    value={user.status}
                    onChange={(e) => handleStatusChange(user, e.target.value as 'active' | 'banned')}
                    disabled={user.id === currentAdminId || isPending}
                    className={`rounded-md border border-border bg-background px-2 py-0.5 text-[12px] font-medium disabled:opacity-50 ${statusBadge[user.status]}`}
                    aria-label={`${user.email} 상태`}
                  >
                    <option value="active">active</option>
                    <option value="banned">banned</option>
                  </select>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col divide-y divide-border md:hidden">
        {users.map((user) => (
          <div key={user.id} className="px-4 py-3">
            <div className="flex items-center justify-between">
              <Link
                href={routes.admin.userDetail(user.id)}
                className="text-[13px] font-medium hover:text-primary hover:underline underline-offset-2 transition-colors"
              >
                {user.name ?? '-'}
              </Link>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusBadge[user.status]}`}>
                {user.status}
              </span>
            </div>
            <p className="text-[12px] text-muted-foreground mt-0.5">{user.email}</p>
            <div className="mt-2 flex items-center gap-2">
              <select
                value={user.role}
                onChange={(e) => handleRoleChange(user, e.target.value as 'user' | 'admin')}
                disabled={user.id === currentAdminId || isPending}
                className="rounded-md border border-border bg-background px-2 py-1 text-[12px] disabled:opacity-50"
                aria-label={`${user.email} 역할`}
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
              <select
                value={user.status}
                onChange={(e) => handleStatusChange(user, e.target.value as 'active' | 'banned')}
                disabled={user.id === currentAdminId || isPending}
                className="rounded-md border border-border bg-background px-2 py-1 text-[12px] disabled:opacity-50"
                aria-label={`${user.email} 상태`}
              >
                <option value="active">active</option>
                <option value="banned">banned</option>
              </select>
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              {new Date(user.createdAt).toLocaleDateString('ko-KR')}
            </p>
          </div>
        ))}
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
