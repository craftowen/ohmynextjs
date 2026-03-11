import { relations } from 'drizzle-orm';
import { users, plans, payments, auditLogs, legalDocuments } from './schema';

export const usersRelations = relations(users, ({ many }) => ({
  payments: many(payments),
  auditLogs: many(auditLogs),
}));

export const plansRelations = relations(plans, ({ many }) => ({
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, { fields: [payments.userId], references: [users.id] }),
  plan: one(plans, { fields: [payments.planId], references: [plans.id] }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, { fields: [auditLogs.userId], references: [users.id] }),
}));

export const legalDocumentsRelations = relations(legalDocuments, ({ one }) => ({
  creator: one(users, { fields: [legalDocuments.createdBy], references: [users.id] }),
}));
