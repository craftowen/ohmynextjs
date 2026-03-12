import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/auth/server';
import { getUserRole } from '@/lib/auth/role';

export const requireAdmin = cache(async (): Promise<{ userId: string; email: string }> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = !error ? data?.claims?.sub : null;

  if (!userId) {
    redirect('/auth/login');
  }

  const role = await getUserRole(userId);

  if (role !== 'admin') {
    redirect('/dashboard');
  }

  return { userId, email: data!.claims.email! };
});
