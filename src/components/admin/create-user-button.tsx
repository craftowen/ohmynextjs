'use client';

import { useState, useTransition } from 'react';
import { Plus } from 'lucide-react';
import { createUser } from '@/lib/admin/actions';
import { toast } from 'sonner';

export function CreateUserButton() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');

  const handleSubmit = () => {
    if (!email.trim()) {
      toast.error('이메일을 입력해주세요.');
      return;
    }
    startTransition(async () => {
      const result = await createUser({ email: email.trim(), name: name.trim() || undefined, role });
      if (result.success) {
        toast.success('유저가 생성되었습니다. 비밀번호 설정 이메일이 발송됩니다.');
        setOpen(false);
        setEmail('');
        setName('');
        setRole('user');
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground hover:bg-primary/90"
      >
        <Plus className="h-3.5 w-3.5" />
        유저 추가
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[15px] font-semibold mb-4">새 유저 추가</h3>

            <div className="space-y-3">
              <div>
                <label className="text-[12px] font-medium text-muted-foreground">이메일 *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-ring"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-[12px] font-medium text-muted-foreground">이름</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="홍길동"
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-[12px] font-medium text-muted-foreground">역할</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="user">유저</option>
                  <option value="admin">관리자</option>
                </select>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:bg-muted"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={isPending}
                className="rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isPending ? '생성 중...' : '생성'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
