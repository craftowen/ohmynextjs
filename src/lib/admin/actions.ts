'use server';

import { db } from '@/lib/db/client';
import { users, appSettings, auditLogs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from './auth';
import { supabaseAdmin } from '@/lib/auth/admin';

export type ActionResult = { success: true } | { success: false; error: string };

// User actions
export async function updateUserRole(userId: string, role: 'user' | 'admin'): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();

    if (admin.userId === userId) {
      return { success: false, error: '자기 자신의 역할은 변경할 수 없습니다.' };
    }

    const [target] = await db.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1);
    if (!target) return { success: false, error: '유저를 찾을 수 없습니다.' };

    const oldRole = target.role;
    await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, userId));

    await db.insert(auditLogs).values({
      userId: admin.userId,
      action: 'user.role.update',
      target: 'users',
      targetId: userId,
      details: { from: oldRole, to: role },
    });

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    return { success: false, error: '역할 변경에 실패했습니다.' };
  }
}

export async function updateUserStatus(userId: string, status: 'active' | 'banned'): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();

    if (admin.userId === userId) {
      return { success: false, error: '자기 자신의 상태는 변경할 수 없습니다.' };
    }

    const [target] = await db.select({ status: users.status }).from(users).where(eq(users.id, userId)).limit(1);
    if (!target) return { success: false, error: '유저를 찾을 수 없습니다.' };

    const oldStatus = target.status;
    await db.update(users).set({ status, updatedAt: new Date() }).where(eq(users.id, userId));

    await db.insert(auditLogs).values({
      userId: admin.userId,
      action: 'user.status.update',
      target: 'users',
      targetId: userId,
      details: { from: oldStatus, to: status },
    });

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    return { success: false, error: '상태 변경에 실패했습니다.' };
  }
}

export async function softDeleteUser(userId: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    if (admin.userId === userId) {
      return { success: false, error: '자기 자신은 삭제할 수 없습니다.' };
    }

    const [target] = await db.select({ status: users.status }).from(users).where(eq(users.id, userId)).limit(1);
    if (!target) return { success: false, error: '유저를 찾을 수 없습니다.' };
    if (target.status === 'deleted') return { success: false, error: '이미 삭제된 유저입니다.' };

    await db.update(users).set({ status: 'deleted', updatedAt: new Date() }).where(eq(users.id, userId));

    await db.insert(auditLogs).values({
      userId: admin.userId,
      action: 'user.delete',
      target: 'users',
      targetId: userId,
      details: { previousStatus: target.status },
    });

    revalidatePath('/admin/users');
    return { success: true };
  } catch {
    return { success: false, error: '유저 삭제에 실패했습니다.' };
  }
}

export async function restoreUser(userId: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();

    const [target] = await db.select({ status: users.status }).from(users).where(eq(users.id, userId)).limit(1);
    if (!target) return { success: false, error: '유저를 찾을 수 없습니다.' };
    if (target.status !== 'deleted') return { success: false, error: '삭제된 유저가 아닙니다.' };

    await db.update(users).set({ status: 'active', updatedAt: new Date() }).where(eq(users.id, userId));

    await db.insert(auditLogs).values({
      userId: admin.userId,
      action: 'user.restore',
      target: 'users',
      targetId: userId,
      details: {},
    });

    revalidatePath('/admin/users');
    return { success: true };
  } catch {
    return { success: false, error: '유저 복구에 실패했습니다.' };
  }
}

export async function impersonateUser(userId: string): Promise<{ success: true; token: string } | { success: false; error: string }> {
  try {
    const admin = await requireAdmin();
    if (admin.userId === userId) {
      return { success: false, error: '자기 자신은 가장할 수 없습니다.' };
    }

    const [target] = await db.select({ email: users.email, status: users.status }).from(users).where(eq(users.id, userId)).limit(1);
    if (!target) return { success: false, error: '유저를 찾을 수 없습니다.' };
    if (target.status === 'deleted') return { success: false, error: '삭제된 유저는 가장할 수 없습니다.' };

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: target.email,
    });

    if (error || !data.properties?.hashed_token) {
      return { success: false, error: `가장 링크 생성 실패: ${error?.message ?? '알 수 없는 오류'}` };
    }

    await db.insert(auditLogs).values({
      userId: admin.userId,
      action: 'user.impersonate',
      target: 'users',
      targetId: userId,
      details: { email: target.email },
    });

    return { success: true, token: data.properties.action_link };
  } catch {
    return { success: false, error: '유저 가장에 실패했습니다.' };
  }
}

export async function forceSignOut(userId: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    if (admin.userId === userId) {
      return { success: false, error: '자기 자신을 강제 로그아웃할 수 없습니다.' };
    }

    const [target] = await db.select({ email: users.email }).from(users).where(eq(users.id, userId)).limit(1);
    if (!target) return { success: false, error: '유저를 찾을 수 없습니다.' };

    const { error } = await supabaseAdmin.auth.admin.signOut(userId);
    if (error) return { success: false, error: `강제 로그아웃 실패: ${error.message}` };

    await db.insert(auditLogs).values({
      userId: admin.userId,
      action: 'user.force_signout',
      target: 'users',
      targetId: userId,
      details: { email: target.email },
    });

    return { success: true };
  } catch {
    return { success: false, error: '강제 로그아웃에 실패했습니다.' };
  }
}

export async function createUser(data: {
  email: string;
  name?: string;
  role?: 'user' | 'admin';
}): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();

    const { data: authData, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      email_confirm: true,
      user_metadata: { name: data.name },
    });

    if (error) return { success: false, error: `유저 생성 실패: ${error.message}` };

    const newUserId = authData.user.id;

    await db.insert(users).values({
      id: newUserId,
      email: data.email,
      name: data.name ?? null,
      role: data.role ?? 'user',
      provider: 'email',
    });

    await db.insert(auditLogs).values({
      userId: admin.userId,
      action: 'user.create',
      target: 'users',
      targetId: newUserId,
      details: { email: data.email, role: data.role ?? 'user' },
    });

    // Send password reset so user can set their password
    await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: data.email,
    });

    revalidatePath('/admin/users');
    return { success: true };
  } catch {
    return { success: false, error: '유저 생성에 실패했습니다.' };
  }
}

export async function sendPasswordResetLink(userId: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();

    const [target] = await db.select({ email: users.email }).from(users).where(eq(users.id, userId)).limit(1);
    if (!target) return { success: false, error: '유저를 찾을 수 없습니다.' };

    const { error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: target.email,
    });

    if (error) return { success: false, error: `비밀번호 초기화 링크 생성 실패: ${error.message}` };

    await db.insert(auditLogs).values({
      userId: admin.userId,
      action: 'user.password_reset',
      target: 'users',
      targetId: userId,
      details: { email: target.email },
    });

    return { success: true };
  } catch {
    return { success: false, error: '비밀번호 초기화에 실패했습니다.' };
  }
}

export async function bulkUpdateUsers(
  userIds: string[],
  update: { role?: 'user' | 'admin'; status?: 'active' | 'banned' },
): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();

    const safeIds = userIds.filter((id) => id !== admin.userId);
    if (safeIds.length === 0) {
      return { success: false, error: '변경할 유저가 없습니다.' };
    }

    const action = update.role ? 'user.role.update' : 'user.status.update';
    const field = update.role ? 'role' : 'status';
    const value = update.role ?? update.status;

    for (const userId of safeIds) {
      await db
        .update(users)
        .set({ ...update, updatedAt: new Date() })
        .where(eq(users.id, userId));

      await db.insert(auditLogs).values({
        userId: admin.userId,
        action,
        target: 'users',
        targetId: userId,
        details: { bulk: true, [field]: value },
      });
    }

    revalidatePath('/admin/users');
    return { success: true };
  } catch {
    return { success: false, error: '일괄 작업에 실패했습니다.' };
  }
}

export async function updateUserProfile(
  userId: string,
  data: { name?: string },
): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();

    const [target] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!target) return { success: false, error: '유저를 찾을 수 없습니다.' };

    const changes: Record<string, { from: unknown; to: unknown }> = {};
    const updates: Record<string, unknown> = { updatedAt: new Date() };

    if (data.name !== undefined && data.name !== target.name) {
      changes.name = { from: target.name, to: data.name };
      updates.name = data.name || null;
    }

    if (Object.keys(changes).length === 0) {
      return { success: true };
    }

    await db.update(users).set(updates).where(eq(users.id, userId));

    await db.insert(auditLogs).values({
      userId: admin.userId,
      action: 'user.profile.update',
      target: 'users',
      targetId: userId,
      details: changes,
    });

    revalidatePath(`/admin/users/${userId}`);
    revalidatePath('/admin/users');
    return { success: true };
  } catch {
    return { success: false, error: '프로필 수정에 실패했습니다.' };
  }
}

// Settings actions
export async function createSetting(data: {
  key: string;
  value: unknown;
  description?: string;
  isPublic?: boolean;
}): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();

    const [inserted] = await db.insert(appSettings).values({
      key: data.key,
      value: data.value,
      description: data.description ?? null,
      isPublic: data.isPublic ?? false,
    }).returning({ id: appSettings.id });

    await db.insert(auditLogs).values({
      userId: admin.userId,
      action: 'setting.create',
      target: 'app_settings',
      targetId: inserted.id,
      details: { key: data.key, value: data.value },
    });

    revalidatePath('/admin/settings');
    return { success: true };
  } catch (error) {
    return { success: false, error: '설정 추가에 실패했습니다.' };
  }
}

export async function updateSetting(id: string, data: {
  value?: unknown;
  description?: string;
  isPublic?: boolean;
}): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();

    const [existing] = await db.select().from(appSettings).where(eq(appSettings.id, id)).limit(1);
    if (!existing) return { success: false, error: '설정을 찾을 수 없습니다.' };

    await db.update(appSettings).set({
      ...(data.value !== undefined && { value: data.value }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
      updatedAt: new Date(),
    }).where(eq(appSettings.id, id));

    await db.insert(auditLogs).values({
      userId: admin.userId,
      action: 'setting.update',
      target: 'app_settings',
      targetId: id,
      details: { key: existing.key, changes: data },
    });

    revalidatePath('/admin/settings');
    return { success: true };
  } catch (error) {
    return { success: false, error: '설정 수정에 실패했습니다.' };
  }
}

export async function deleteSetting(id: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();

    const [existing] = await db.select({ key: appSettings.key }).from(appSettings).where(eq(appSettings.id, id)).limit(1);
    if (!existing) return { success: false, error: '설정을 찾을 수 없습니다.' };

    await db.delete(appSettings).where(eq(appSettings.id, id));

    await db.insert(auditLogs).values({
      userId: admin.userId,
      action: 'setting.delete',
      target: 'app_settings',
      targetId: id,
      details: { key: existing.key },
    });

    revalidatePath('/admin/settings');
    return { success: true };
  } catch (error) {
    return { success: false, error: '설정 삭제에 실패했습니다.' };
  }
}

// CSV Export
export async function exportUsersCsv(): Promise<string> {
  await requireAdmin();
  const { getAllUsersForExport } = await import('./queries');
  const data = await getAllUsersForExport();

  const header = 'ID,이메일,이름,역할,상태,로그인방식,가입일';
  const rows = data.map((u) =>
    [u.id, u.email, u.name ?? '', u.role, u.status, u.provider ?? '', new Date(u.createdAt).toISOString()].join(',')
  );
  return [header, ...rows].join('\n');
}

export async function exportPaymentsCsv(): Promise<string> {
  await requireAdmin();
  const { getAllPaymentsForExport } = await import('./queries');
  const data = await getAllPaymentsForExport();

  const header = '주문ID,이메일,금액,통화,상태,결제수단,결제일,생성일';
  const rows = data.map((p) =>
    [p.orderId, p.userEmail ?? '', p.amount, p.currency, p.status, p.method ?? '', p.paidAt ? new Date(p.paidAt).toISOString() : '', new Date(p.createdAt).toISOString()].join(',')
  );
  return [header, ...rows].join('\n');
}

