'use client';

import { useTransition } from 'react';
import { Download } from 'lucide-react';

interface CsvExportButtonProps {
  action: () => Promise<string>;
  filename: string;
}

export function CsvExportButton({ action, filename }: CsvExportButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleExport() {
    startTransition(async () => {
      const csv = await action();
      const bom = '\uFEFF';
      const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isPending}
      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-[13px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50"
    >
      <Download className="h-3.5 w-3.5" />
      {isPending ? '내보내는 중...' : 'CSV'}
    </button>
  );
}
