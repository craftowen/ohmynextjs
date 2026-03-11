import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock drizzle-orm
vi.mock('drizzle-orm', () => ({
  eq: vi.fn((a: unknown, b: unknown) => ({ eq: [a, b] })),
  ne: vi.fn((a: unknown, b: unknown) => ({ ne: [a, b] })),
  sql: Object.assign(vi.fn(), { raw: vi.fn() }),
  ilike: vi.fn(),
  or: vi.fn(),
  desc: vi.fn((col: unknown) => ({ desc: col })),
  count: vi.fn(() => 'count_fn'),
  sum: vi.fn((col: unknown) => ({ sum: col })),
}));

vi.mock('@/lib/db/schema', () => ({
  users: { id: 'id', email: 'email', name: 'name', role: 'role', status: 'status', provider: 'provider', createdAt: 'createdAt', lastSignInAt: 'lastSignInAt' },
  payments: { id: 'id', orderId: 'orderId', amount: 'amount', currency: 'currency', status: 'status', method: 'method', paidAt: 'paidAt', createdAt: 'createdAt', userId: 'userId' },
  appSettings: { id: 'id', key: 'key', value: 'value', description: 'description', isPublic: 'isPublic', createdAt: 'createdAt', updatedAt: 'updatedAt' },
}));

// The mock db returns different results for each call via selectResults
let selectCallIndex = 0;
let selectResults: unknown[][] = [];

const mockChain = () => {
  const result = selectResults[selectCallIndex] || [];
  selectCallIndex++;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chain: any = {};
  const methods = ['from', 'where', 'orderBy', 'limit', 'offset', 'leftJoin'];
  methods.forEach((m) => {
    chain[m] = vi.fn().mockReturnValue(chain);
  });
  chain.then = (resolve: (v: unknown) => void) => resolve(result);
  return chain;
};

vi.mock('@/lib/db/client', () => ({
  db: {
    select: vi.fn().mockImplementation(() => mockChain()),
  },
}));

describe('admin queries', () => {
  beforeEach(() => {
    selectCallIndex = 0;
    selectResults = [];
  });

  describe('getAdminStats', () => {
    it('returns aggregated stats', async () => {
      selectResults = [
        [{ count: 100 }],
        [{ total: '500000' }],
        [{ total: '120000' }],
        [{ count: 5 }],
      ];

      const { getAdminStats } = await import('./queries');
      const stats = await getAdminStats();

      expect(stats).toEqual({
        totalUsers: 100,
        todaySignups: 5,
        totalRevenue: 500000,
        monthlyRevenue: 120000,
      });
    });
  });

  describe('getRecentUsers', () => {
    it('returns recent users list', async () => {
      const mockUsers = [
        { id: '1', email: 'a@b.com', name: 'A', createdAt: new Date() },
      ];
      selectResults = [mockUsers];

      const { getRecentUsers } = await import('./queries');
      const result = await getRecentUsers(5);
      expect(result).toEqual(mockUsers);
    });
  });

  describe('getSettings', () => {
    it('returns settings list', async () => {
      const mockSettings = [
        { id: '1', key: 'site_name', value: 'Test', description: null, isPublic: true, createdAt: new Date(), updatedAt: new Date() },
      ];
      selectResults = [mockSettings];

      const { getSettings } = await import('./queries');
      const result = await getSettings();
      expect(result).toEqual(mockSettings);
    });
  });
});
