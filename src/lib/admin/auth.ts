import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/auth/server';
import { db } from '@/lib/db/client';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const requireAdmin = cache(async (): Promise<{ userId: string; email: string }> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = !error ? data?.claims?.sub : null;

  if (!userId) {
    redirect('/auth/login');
  }

  const [dbUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!dbUser || dbUser.role !== 'admin') {
    redirect('/dashboard');
  }

  return { userId, email: data!.claims.email! };
});
