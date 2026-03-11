import { createClient } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { SignOutButton } from '@/components/sign-out-button';
import { db } from '@/lib/db/client';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = !error ? data?.claims?.sub : null;

  if (!userId) {
    redirect('/auth/login');
  }

  const [dbUser] = await db
    .select({ createdAt: users.createdAt })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return (
    <div className="container mx-auto max-w-screen-xl px-4 py-8 sm:py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">대시보드</h1>
          <p className="mt-1 text-muted-foreground">{data!.claims.email}</p>
        </div>
        <SignOutButton />
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard title="플랜" value="무료" description="현재 무료 플랜을 이용 중입니다" />
        <DashboardCard title="결제 이력" value="0건" description="결제 이력이 없습니다" />
        <DashboardCard title="가입일" value={dbUser ? new Date(dbUser.createdAt).toLocaleDateString('ko-KR') : '-'} description="가입해주셔서 감사합니다" />
      </div>
    </div>
  );
}

function DashboardCard({ title, value, description }: { title: string; value: string; description: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 sm:p-6">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <p className="mt-2 text-2xl sm:text-3xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
