import { pgTable, pgEnum, uuid, text, integer, boolean, timestamp, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core';

// Enums
export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);
export const userStatusEnum = pgEnum('user_status', ['active', 'banned', 'deleted']);
export const paymentStatusEnum = pgEnum('payment_status', [
  'pending', 'paid', 'failed', 'cancelled', 'refunded', 'partial_refunded',
]);
export const paymentMethodEnum = pgEnum('payment_method', [
  'card', 'virtual_account', 'transfer', 'mobile',
]);

// Users
export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  role: userRoleEnum('role').default('user').notNull(),
  status: userStatusEnum('status').default('active').notNull(),
  provider: text('provider'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  lastSignInAt: timestamp('last_sign_in_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('users_email_idx').on(table.email),
  index('users_role_idx').on(table.role),
  index('users_status_idx').on(table.status),
  index('users_created_at_idx').on(table.createdAt),
]);

// Plans
export const plans = pgTable('plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  price: integer('price').notNull(),
  currency: text('currency').default('KRW').notNull(),
  interval: text('interval').notNull(),
  intervalCount: integer('interval_count').default(1).notNull(),
  features: jsonb('features').$type<string[]>(),
  isActive: boolean('is_active').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('plans_slug_idx').on(table.slug),
  index('plans_active_idx').on(table.isActive),
]);

// Payments
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  planId: uuid('plan_id').references(() => plans.id),
  orderId: text('order_id').notNull().unique(),
  paymentKey: text('payment_key').unique(),
  amount: integer('amount').notNull(),
  currency: text('currency').default('KRW').notNull(),
  status: paymentStatusEnum('status').default('pending').notNull(),
  method: paymentMethodEnum('method'),
  receiptUrl: text('receipt_url'),
  failReason: text('fail_reason'),
  cancelReason: text('cancel_reason'),
  cancelAmount: integer('cancel_amount'),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('payments_user_id_idx').on(table.userId),
  uniqueIndex('payments_order_id_idx').on(table.orderId),
  index('payments_status_idx').on(table.status),
  index('payments_created_at_idx').on(table.createdAt),
]);

// App Settings
export const appSettings = pgTable('app_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(),
  value: jsonb('value').notNull(),
  description: text('description'),
  isPublic: boolean('is_public').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('app_settings_key_idx').on(table.key),
]);

// Legal Documents
export const legalDocuments = pgTable('legal_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: text('type').notNull(), // 'terms' | 'privacy'
  version: integer('version').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  isActive: boolean('is_active').default(false).notNull(),
  effectiveDate: timestamp('effective_date', { withTimezone: true }),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('legal_documents_type_idx').on(table.type),
  index('legal_documents_active_idx').on(table.type, table.isActive),
  uniqueIndex('legal_documents_type_version_idx').on(table.type, table.version),
]);

// Audit Logs
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: text('action').notNull(),
  target: text('target'),
  targetId: text('target_id'),
  details: jsonb('details').$type<Record<string, unknown>>(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('audit_logs_user_id_idx').on(table.userId),
  index('audit_logs_action_idx').on(table.action),
  index('audit_logs_created_at_idx').on(table.createdAt),
]);
