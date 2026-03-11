'use client';

import { useState, useTransition, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { updateUserRole, updateUserStatus, bulkUpdateUsers } from '@/lib/admin/actions';
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
  sortBy?: string;
  sortOrder?: string;
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

export function UserTable({ users, currentAdminId, sortBy = '', sortOrder = '' }: UserTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dialog, setDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => Promise<void>;
  }>({ open: false, title: '', description: '', action: async () => {} });

  const handleSort = useCallback((column: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (sortBy === column) {
      if (sortOrder === 'asc') {
        params.set('sortOrder', 'desc');
      } else if (sortOrder === 'desc') {
        params.delete('sortBy');
        params.delete('sortOrder');
      } else {
        params.set('sortOrder', 'asc');
      }
    } else {
      params.set('sortBy', column);
      params.set('sortOrder', 'asc');
    }
    params.delete('page');
    router.push(`?${params.toString()}`);
  }, [sortBy, sortOrder, searchParams, router]);

  const selectableUsers = users.filter((u) => u.id !== currentAdminId);
  const allSelected = selectableUsers.length > 0 && selectableUsers.every((u) => selectedIds.has(u.id));

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selectableUsers.map((u) => u.id)));
    }
  };

  const handleBulkAction = (update: { role?: 'user' | 'admin'; status?: 'active' | 'banned' }) => {
    const ids = Array.from(selectedIds);
    const label = update.role ? `역할을 ${update.role}로` : `상태를 ${update.status}로`;
    setDialog({
      open: true,
      title: '일괄 변경',
      description: `선택된 ${ids.length}명의 ${label} 변경하시겠습니까?`,
      action: async () => {
        startTransition(async () => {
          const result = await bulkUpdateUsers(ids, update);
          if (result.success) {
            toast.success(`${ids.length}명 일괄 변경 완료`);
            setSelectedIds(new Set());
          } else {
            toast.error(result.error);
          }
        });
      },
    });
  };

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
      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 border-b border-border bg-accent/30 px-4 py-2">
          <span className="text-[12px] font-medium">{selectedIds.size}명 선택</span>
          <button onClick={() => handleBulkAction({ role: 'admin' })} disabled={isPending} className="rounded-md bg-primary/10 px-2.5 py-1 text-[12px] font-medium text-primary hover:bg-primary/20 disabled:opacity-50">관리자로</button>
          <button onClick={() => handleBulkAction({ role: 'user' })} disabled={isPending} className="rounded-md bg-muted px-2.5 py-1 text-[12px] font-medium hover:bg-muted/80 disabled:opacity-50">유저로</button>
          <button onClick={() => handleBulkAction({ status: 'banned' })} disabled={isPending} className="rounded-md bg-red-500/10 px-2.5 py-1 text-[12px] font-medium text-red-600 hover:bg-red-500/20 disabled:opacity-50">차단</button>
          <button onClick={() => handleBulkAction({ status: 'active' })} disabled={isPending} className="rounded-md bg-green-500/10 px-2.5 py-1 text-[12px] font-medium text-green-600 hover:bg-green-500/20 disabled:opacity-50">활성화</button>
          <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-[12px] text-muted-foreground hover:text-foreground">취소</button>
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-[13px]" role="table">
          <thead>
            <tr className="border-b border-border">
              <th className="w-10 px-4 py-2.5">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-3.5 w-3.5 rounded border-border" />
              </th>
              <SortHeader label="이름" column="name" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
              <SortHeader label="이메일" column="email" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
              <th className="px-4 py-2.5 text-left text-[12px] font-medium text-muted-foreground">역할</th>
              <th className="px-4 py-2.5 text-left text-[12px] font-medium text-muted-foreground">상태</th>
              <SortHeader label="가입일" column="createdAt" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
              <SortHeader label="최종 로그인" column="lastSignInAt" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className={`border-b border-border last:border-b-0 hover:bg-accent/50 transition-colors ${selectedIds.has(user.id) ? 'bg-accent/30' : ''}`}>
                <td className="w-10 px-4 py-2.5">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(user.id)}
                    onChange={() => toggleSelect(user.id)}
                    disabled={user.id === currentAdminId}
                    className="h-3.5 w-3.5 rounded border-border disabled:opacity-30"
                  />
                </td>
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
                <td className="px-4 py-2.5 text-muted-foreground">
                  {user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString('ko-KR') : '-'}
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

function SortHeader({
  label,
  column,
  currentSort,
  currentOrder,
  onSort,
}: {
  label: string;
  column: string;
  currentSort: string;
  currentOrder: string;
  onSort: (column: string) => void;
}) {
  const isActive = currentSort === column;

  return (
    <th className="px-4 py-2.5 text-left text-[12px] font-medium text-muted-foreground">
      <button
        onClick={() => onSort(column)}
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
      >
        {label}
        {isActive ? (
          currentOrder === 'asc' ? (
            <ArrowUp className="h-3 w-3 text-foreground" />
          ) : (
            <ArrowDown className="h-3 w-3 text-foreground" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-40" />
        )}
      </button>
    </th>
  );
}
