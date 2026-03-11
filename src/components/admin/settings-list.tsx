'use client';

import { useState, useTransition } from 'react';
import { createSetting, updateSetting, deleteSetting } from '@/lib/admin/actions';
import { toast } from 'sonner';
import { ConfirmDialog } from './confirm-dialog';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

interface Setting {
  id: string;
  key: string;
  value: unknown;
  description: string | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface SettingsListProps {
  settings: Setting[];
}

export function SettingsList({ settings }: SettingsListProps) {
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; key: string }>({
    open: false, id: '', key: '',
  });

  // Form state
  const [formKey, setFormKey] = useState('');
  const [formValue, setFormValue] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPublic, setFormPublic] = useState(false);

  const resetForm = () => {
    setFormKey('');
    setFormValue('');
    setFormDesc('');
    setFormPublic(false);
    setShowForm(false);
    setEditId(null);
  };

  const startEdit = (setting: Setting) => {
    setEditId(setting.id);
    setFormKey(setting.key);
    setFormValue(JSON.stringify(setting.value, null, 2));
    setFormDesc(setting.description ?? '');
    setFormPublic(setting.isPublic);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let parsedValue: unknown;
    try {
      parsedValue = JSON.parse(formValue);
    } catch {
      toast.error('유효한 JSON 값을 입력해주세요.');
      return;
    }

    startTransition(async () => {
      const result = editId
        ? await updateSetting(editId, { value: parsedValue, description: formDesc, isPublic: formPublic })
        : await createSetting({ key: formKey, value: parsedValue, description: formDesc, isPublic: formPublic });

      if (result.success) {
        toast.success(editId ? '설정이 수정되었습니다.' : '설정이 추가되었습니다.');
        resetForm();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteSetting(id);
      if (result.success) {
        toast.success('설정이 삭제되었습니다.');
      } else {
        toast.error(result.error);
      }
      setDeleteDialog({ open: false, id: '', key: '' });
    });
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[13px] text-muted-foreground">
          {settings.length}개의 설정
        </p>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          추가
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-4 rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-[13px] font-semibold">{editId ? '설정 수정' : '새 설정'}</h3>
            <button onClick={resetForm} className="rounded-md p-1 hover:bg-accent transition-colors">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-4 space-y-3">
            <div>
              <label className="block text-[12px] font-medium text-muted-foreground mb-1">Key</label>
              <input
                type="text"
                value={formKey}
                onChange={(e) => setFormKey(e.target.value)}
                disabled={!!editId}
                required
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-muted-foreground mb-1">Value (JSON)</label>
              <textarea
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
                required
                rows={3}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-muted-foreground mb-1">설명</label>
              <input
                type="text"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={formPublic}
                onChange={(e) => setFormPublic(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-border"
              />
              <label htmlFor="isPublic" className="text-[13px]">공개 설정</label>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {editId ? '수정' : '추가'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-md border border-border px-3 py-1.5 text-[13px] font-medium hover:bg-accent transition-colors"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Settings list */}
      <div className="rounded-lg border border-border bg-card divide-y divide-border">
        {settings.length === 0 && (
          <p className="py-12 text-center text-[13px] text-muted-foreground">설정이 없습니다.</p>
        )}
        {settings.map((setting) => (
          <div key={setting.id} className="px-4 py-3 hover:bg-accent/50 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[13px] font-medium">{setting.key}</span>
                  {setting.isPublic && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                      공개
                    </span>
                  )}
                </div>
                {setting.description && (
                  <p className="mt-0.5 text-[12px] text-muted-foreground">{setting.description}</p>
                )}
                <pre className="mt-1.5 rounded-md bg-muted/50 px-2.5 py-1.5 text-[12px] font-mono overflow-x-auto">
                  {JSON.stringify(setting.value, null, 2)}
                </pre>
              </div>
              <div className="flex gap-0.5 shrink-0">
                <button
                  onClick={() => startEdit(setting)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent transition-colors"
                  aria-label={`${setting.key} 수정`}
                >
                  <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
                <button
                  onClick={() => setDeleteDialog({ open: true, id: setting.id, key: setting.key })}
                  className="group inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-red-500/10 transition-colors"
                  aria-label={`${setting.key} 삭제`}
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground group-hover:text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        title="설정 삭제"
        description={`'${deleteDialog.key}' 설정을 삭제하시겠습니까?`}
        confirmLabel="삭제"
        variant="destructive"
        onConfirm={() => handleDelete(deleteDialog.id)}
        onCancel={() => setDeleteDialog({ open: false, id: '', key: '' })}
      />
    </div>
  );
}
