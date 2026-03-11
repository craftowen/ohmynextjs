import { Suspense } from 'react';
import { getSettings } from '@/lib/admin/queries';
import { SettingsList } from '@/components/admin/settings-list';

export default function AdminSettingsPage() {
  return (
    <div className="flex flex-col">
      <div className="flex h-[52px] shrink-0 items-center border-b border-border px-6">
        <h1 className="text-[14px] font-semibold">앱 설정</h1>
      </div>

      <div className="p-6">
        <Suspense fallback={<SettingsSkeleton />}>
          <SettingsContent />
        </Suspense>
      </div>
    </div>
  );
}

async function SettingsContent() {
  const settings = await getSettings();
  return <SettingsList settings={settings} />;
}

function SettingsSkeleton() {
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="h-4 w-20 rounded bg-muted animate-pulse" />
        <div className="h-8 w-16 rounded-md bg-muted animate-pulse" />
      </div>
      <div className="rounded-lg border border-border bg-card divide-y divide-border">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="px-4 py-3">
            <div className="h-4 w-32 rounded bg-muted animate-pulse" />
            <div className="mt-1.5 h-3 w-48 rounded bg-muted/60 animate-pulse" />
            <div className="mt-2 h-10 w-full rounded-md bg-muted/40 animate-pulse" />
          </div>
        ))}
      </div>
    </>
  );
}
