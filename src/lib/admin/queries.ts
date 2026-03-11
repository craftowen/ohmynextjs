'use server';

import { cache } from 'react';
import { db } from '@/lib/db/client';
import { users, payments, appSettings, auditLogs } from '@/lib/db/schema';
import { eq, ne, sql, ilike, or, and, desc, asc, count, sum } from 'drizzle-orm';

// Types
export interface AdminStats {
  totalUsers: number;
  todaySignups: number;
  totalRevenue: number;
  monthlyRevenue: number;
  lastMonthRevenue: number;
  yesterdaySignups: number;
}

export interface UsersResponse {
  users: Array<{
    id: string;
    email: string;
    name: string | null;
    role: 'user' | 'admin';
    status: 'active' | 'banned' | 'deleted';
    provider: string | null;
    createdAt: Date;
    lastSignInAt: Date | null;
  }>;
  total: number;
  page: number;
  totalPages: number;
}

export interface PaymentWithUser {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded' | 'partial_refunded';
  method: 'card' | 'virtual_account' | 'transfer' | 'mobile' | null;
  paidAt: Date | null;
  createdAt: Date;
  user: { email: string; name: string | null } | null;
}

export interface PaymentsResponse {
  payments: PaymentWithUser[];
  total: number;
  page: number;
  totalPages: number;
}

// Dashboard
export const getAdminStats = cache(async (): Promise<AdminStats> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    const [[userStats], [revenueStats], [monthlyStats], [lastMonthStats], [todayStats], [yesterdayStats]] = await Promise.all([
      db.select({ count: count() }).from(users).where(ne(users.status, 'deleted')),
      db.select({ total: sum(payments.amount) }).from(payments).where(eq(payments.status, 'paid')),
      db.select({ total: sum(payments.amount) }).from(payments)
        .where(and(eq(payments.status, 'paid'), sql`${payments.paidAt} >= ${monthStart}`)),
      db.select({ total: sum(payments.amount) }).from(payments)
        .where(and(eq(payments.status, 'paid'), sql`${payments.paidAt} >= ${lastMonthStart}`, sql`${payments.paidAt} < ${monthStart}`)),
      db.select({ count: count() }).from(users)
        .where(and(sql`${users.createdAt} >= ${today}`, ne(users.status, 'deleted'))),
      db.select({ count: count() }).from(users)
        .where(and(sql`${users.createdAt} >= ${yesterday}`, sql`${users.createdAt} < ${today}`, ne(users.status, 'deleted'))),
    ]);

    return {
      totalUsers: userStats?.count ?? 0,
      todaySignups: todayStats?.count ?? 0,
      totalRevenue: Number(revenueStats?.total ?? 0),
      monthlyRevenue: Number(monthlyStats?.total ?? 0),
      lastMonthRevenue: Number(lastMonthStats?.total ?? 0),
      yesterdaySignups: yesterdayStats?.count ?? 0,
    };
  } catch {
    return { totalUsers: 0, todaySignups: 0, totalRevenue: 0, monthlyRevenue: 0, lastMonthRevenue: 0, yesterdaySignups: 0 };
  }
});

export const getRecentUsers = cache(async (limit = 5) => {
  try {
    return await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(ne(users.status, 'deleted'))
      .orderBy(desc(users.createdAt))
      .limit(limit);
  } catch {
    return [];
  }
});

export const getRecentPayments = cache(async (limit = 5) => {
  try {
    return await db
      .select({
        id: payments.id,
        orderId: payments.orderId,
        amount: payments.amount,
        currency: payments.currency,
        status: payments.status,
        paidAt: payments.paidAt,
        createdAt: payments.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(payments)
      .leftJoin(users, eq(payments.userId, users.id))
      .orderBy(desc(payments.createdAt))
      .limit(limit);
  } catch {
    return [];
  }
});

// Users
const userSortColumns = {
  name: users.name,
  email: users.email,
  createdAt: users.createdAt,
  lastSignInAt: users.lastSignInAt,
} as const;

export type UserSortBy = keyof typeof userSortColumns;

export async function getUsers(params: {
  query?: string;
  role?: string;
  status?: string;
  provider?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: string;
}): Promise<UsersResponse> {
  const { query, role, status, provider, dateFrom, dateTo, page = 1, perPage = 20, sortBy, sortOrder } = params;
  const offset = (page - 1) * perPage;

  const conditions = [];
  if (status === 'deleted') {
    conditions.push(eq(users.status, 'deleted'));
  } else if (status) {
    conditions.push(eq(users.status, status as 'active' | 'banned'));
  } else {
    conditions.push(ne(users.status, 'deleted'));
  }
  if (query) conditions.push(or(ilike(users.name, `%${query}%`), ilike(users.email, `%${query}%`))!);
  if (role) conditions.push(eq(users.role, role as 'user' | 'admin'));
  if (provider) conditions.push(eq(users.provider, provider));
  if (dateFrom) conditions.push(sql`${users.createdAt} >= ${new Date(dateFrom)}`);
  if (dateTo) conditions.push(sql`${users.createdAt} < ${new Date(new Date(dateTo).getTime() + 86400000)}`);
  const whereClause = and(...conditions);

  const sortColumn = sortBy && sortBy in userSortColumns
    ? userSortColumns[sortBy as UserSortBy]
    : users.createdAt;
  const orderFn = sortOrder === 'asc' ? asc : desc;

  const [data, [{ total }]] = await Promise.all([
    db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      status: users.status,
      provider: users.provider,
      createdAt: users.createdAt,
      lastSignInAt: users.lastSignInAt,
    })
      .from(users)
      .where(whereClause)
      .orderBy(orderFn(sortColumn))
      .limit(perPage)
      .offset(offset),
    db.select({ total: count() }).from(users).where(whereClause),
  ]);

  return {
    users: data as UsersResponse['users'],
    total,
    page,
    totalPages: Math.ceil(total / perPage),
  };
}

// Payments
export async function getPayments(params: {
  status?: string;
  query?: string;
  page?: number;
  perPage?: number;
}): Promise<PaymentsResponse> {
  const { status, query, page = 1, perPage = 20 } = params;
  const offset = (page - 1) * perPage;

  type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded' | 'partial_refunded';
  const conditions = [];
  if (status) conditions.push(eq(payments.status, status as PaymentStatus));
  if (query) conditions.push(or(ilike(payments.orderId, `%${query}%`), ilike(users.email, `%${query}%`)));
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [data, [{ total }]] = await Promise.all([
    db.select({
      id: payments.id,
      orderId: payments.orderId,
      amount: payments.amount,
      currency: payments.currency,
      status: payments.status,
      method: payments.method,
      paidAt: payments.paidAt,
      createdAt: payments.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
      .from(payments)
      .leftJoin(users, eq(payments.userId, users.id))
      .where(whereClause)
      .orderBy(desc(payments.createdAt))
      .limit(perPage)
      .offset(offset),
    db.select({ total: count() }).from(payments).leftJoin(users, eq(payments.userId, users.id)).where(whereClause),
  ]);

  return {
    payments: data.map((p) => ({
      id: p.id,
      orderId: p.orderId,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      method: p.method,
      paidAt: p.paidAt,
      createdAt: p.createdAt,
      user: p.userEmail ? { email: p.userEmail, name: p.userName } : null,
    })),
    total,
    page,
    totalPages: Math.ceil(total / perPage),
  };
}

// Audit Logs
export interface AuditLogEntry {
  id: string;
  action: string;
  target: string | null;
  targetId: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: Date;
  user: { email: string; name: string | null } | null;
}

export interface AuditLogsResponse {
  logs: AuditLogEntry[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getAuditLogs(params: {
  action?: string;
  page?: number;
  perPage?: number;
}): Promise<AuditLogsResponse> {
  const { action, page = 1, perPage = 30 } = params;
  const offset = (page - 1) * perPage;

  const whereClause = action ? eq(auditLogs.action, action) : undefined;

  const [data, [{ total }]] = await Promise.all([
    db.select({
      id: auditLogs.id,
      action: auditLogs.action,
      target: auditLogs.target,
      targetId: auditLogs.targetId,
      details: auditLogs.details,
      ipAddress: auditLogs.ipAddress,
      createdAt: auditLogs.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .where(whereClause)
      .orderBy(desc(auditLogs.createdAt))
      .limit(perPage)
      .offset(offset),
    db.select({ total: count() }).from(auditLogs).where(whereClause),
  ]);

  return {
    logs: data.map((l) => ({
      id: l.id,
      action: l.action,
      target: l.target,
      targetId: l.targetId,
      details: l.details,
      ipAddress: l.ipAddress,
      createdAt: l.createdAt,
      user: l.userEmail ? { email: l.userEmail, name: l.userName } : null,
    })),
    total,
    page,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function getAuditLogActions(): Promise<string[]> {
  const result = await db
    .selectDistinct({ action: auditLogs.action })
    .from(auditLogs)
    .orderBy(auditLogs.action);
  return result.map((r) => r.action);
}

// User Detail
export async function getUserById(userId: string) {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      avatarUrl: users.avatarUrl,
      role: users.role,
      status: users.status,
      provider: users.provider,
      metadata: users.metadata,
      lastSignInAt: users.lastSignInAt,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return user ?? null;
}

export async function getUserAuditLogs(userId: string, limit = 20) {
  return db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      target: auditLogs.target,
      targetId: auditLogs.targetId,
      details: auditLogs.details,
      ipAddress: auditLogs.ipAddress,
      createdAt: auditLogs.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.userId, users.id))
    .where(
      or(
        eq(auditLogs.userId, userId),
        eq(auditLogs.targetId, userId),
      ),
    )
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}

export async function getUserPayments(userId: string, limit = 20) {
  return db
    .select({
      id: payments.id,
      orderId: payments.orderId,
      amount: payments.amount,
      currency: payments.currency,
      status: payments.status,
      method: payments.method,
      paidAt: payments.paidAt,
      createdAt: payments.createdAt,
    })
    .from(payments)
    .where(eq(payments.userId, userId))
    .orderBy(desc(payments.createdAt))
    .limit(limit);
}

// CSV Export
export async function getAllUsersForExport() {
  return db.select({
    id: users.id,
    email: users.email,
    name: users.name,
    role: users.role,
    status: users.status,
    provider: users.provider,
    createdAt: users.createdAt,
  })
    .from(users)
    .where(ne(users.status, 'deleted'))
    .orderBy(desc(users.createdAt));
}

export async function getAllPaymentsForExport() {
  return db.select({
    id: payments.id,
    orderId: payments.orderId,
    amount: payments.amount,
    currency: payments.currency,
    status: payments.status,
    method: payments.method,
    paidAt: payments.paidAt,
    createdAt: payments.createdAt,
    userEmail: users.email,
  })
    .from(payments)
    .leftJoin(users, eq(payments.userId, users.id))
    .orderBy(desc(payments.createdAt));
}

// Settings
export async function getSettings() {
  return db
    .select()
    .from(appSettings)
    .orderBy(desc(appSettings.createdAt));
}
