import { cache } from 'react';
import { db } from '@/lib/db/client';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/** Request-scoped cached DB query for user role. Deduplicates across Header + requireAdmin in same request. */
export const getUserRole = cache(async (userId: string) => {
  const [dbUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return dbUser?.role ?? 'user';
});
