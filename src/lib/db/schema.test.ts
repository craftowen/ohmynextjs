import { describe, it, expect } from 'vitest';
import { users, plans, payments, appSettings, auditLogs, legalDocuments } from './schema';

describe('schema', () => {
  it('exports users table', () => {
    expect(users).toBeDefined();
  });

  it('exports plans table', () => {
    expect(plans).toBeDefined();
  });

  it('exports payments table', () => {
    expect(payments).toBeDefined();
  });

  it('exports appSettings table', () => {
    expect(appSettings).toBeDefined();
  });

  it('exports auditLogs table', () => {
    expect(auditLogs).toBeDefined();
  });

  it('exports legalDocuments table', () => {
    expect(legalDocuments).toBeDefined();
  });
});
