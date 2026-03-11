import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn().mockReturnValue('/admin'),
  useSearchParams: vi.fn().mockReturnValue(new URLSearchParams()),
  useRouter: vi.fn().mockReturnValue({ push: vi.fn() }),
}));

// Mock next/link
vi.mock('next/link', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

// Mock server actions
vi.mock('@/lib/admin/actions', () => ({
  updateUserRole: vi.fn().mockResolvedValue({ success: true }),
  updateUserStatus: vi.fn().mockResolvedValue({ success: true }),
  createSetting: vi.fn().mockResolvedValue({ success: true }),
  updateSetting: vi.fn().mockResolvedValue({ success: true }),
  deleteSetting: vi.fn().mockResolvedValue({ success: true }),
}));

describe('StatCard', () => {
  it('renders title and value', async () => {
    const { StatCard } = await import('./stat-card');
    const Icon = () => <svg data-testid="icon" />;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render(<StatCard title="총 유저" value="1,234" icon={Icon as any} />);
    expect(screen.getByText('총 유저')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });
});

describe('PaymentStatusBadge', () => {
  it('renders correct label for paid status', async () => {
    const { PaymentStatusBadge } = await import('./payment-status-badge');
    render(<PaymentStatusBadge status="paid" />);
    expect(screen.getByText('완료')).toBeInTheDocument();
  });

  it('renders correct label for pending status', async () => {
    const { PaymentStatusBadge } = await import('./payment-status-badge');
    render(<PaymentStatusBadge status="pending" />);
    expect(screen.getByText('대기')).toBeInTheDocument();
  });

  it('renders correct label for failed status', async () => {
    const { PaymentStatusBadge } = await import('./payment-status-badge');
    render(<PaymentStatusBadge status="failed" />);
    expect(screen.getByText('실패')).toBeInTheDocument();
  });
});

describe('ConfirmDialog', () => {
  it('renders when open', async () => {
    const { ConfirmDialog } = await import('./confirm-dialog');
    render(
      <ConfirmDialog
        open={true}
        title="삭제 확인"
        description="정말 삭제하시겠습니까?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText('삭제 확인')).toBeInTheDocument();
    expect(screen.getByText('정말 삭제하시겠습니까?')).toBeInTheDocument();
  });

  it('does not render when closed', async () => {
    const { ConfirmDialog } = await import('./confirm-dialog');
    render(
      <ConfirmDialog
        open={false}
        title="삭제 확인"
        description="정말 삭제하시겠습니까?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.queryByText('삭제 확인')).not.toBeInTheDocument();
  });

  it('calls onConfirm when confirmed', async () => {
    const { ConfirmDialog } = await import('./confirm-dialog');
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        open={true}
        title="변경 확인"
        description="진행하시겠습니까?"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
        confirmLabel="진행"
      />
    );
    fireEvent.click(screen.getByText('진행'));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('calls onCancel when cancelled', async () => {
    const { ConfirmDialog } = await import('./confirm-dialog');
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        open={true}
        title="확인"
        description="진행하시겠습니까?"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    );
    fireEvent.click(screen.getByText('취소'));
    expect(onCancel).toHaveBeenCalled();
  });
});

describe('Pagination', () => {
  it('renders page info and links', async () => {
    const { Pagination } = await import('./pagination');
    render(<Pagination currentPage={1} totalPages={5} total={100} />);
    expect(screen.getByText('총 100건')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('does not render when only 1 page', async () => {
    const { Pagination } = await import('./pagination');
    const { container } = render(<Pagination currentPage={1} totalPages={1} total={10} />);
    expect(container.innerHTML).toBe('');
  });
});

describe('SearchInput', () => {
  it('renders with placeholder', async () => {
    const { SearchInput } = await import('./search-input');
    render(<SearchInput placeholder="검색..." />);
    expect(screen.getByPlaceholderText('검색...')).toBeInTheDocument();
  });
});

describe('AdminSidebar', () => {
  it('renders navigation links', async () => {
    const { AdminSidebar } = await import('./admin-sidebar');
    render(<AdminSidebar />);
    expect(screen.getByText('대시보드')).toBeInTheDocument();
    expect(screen.getByText('유저 관리')).toBeInTheDocument();
    expect(screen.getByText('결제 내역')).toBeInTheDocument();
    expect(screen.getByText('앱 설정')).toBeInTheDocument();
  });
});

describe('UserTable', () => {
  const mockUsers = [
    {
      id: 'u1',
      email: 'test@test.com',
      name: 'Test User',
      role: 'user' as const,
      status: 'active' as const,
      provider: 'google',
      createdAt: new Date('2026-01-01'),
      lastSignInAt: null,
    },
  ];

  it('renders user data', async () => {
    const { UserTable } = await import('./user-table');
    render(
      <UserTable users={mockUsers} currentAdminId="admin-1" />
    );
    expect(screen.getAllByText('test@test.com').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Test User').length).toBeGreaterThan(0);
  });
});

describe('PaymentTable', () => {
  it('renders payment data and filter tabs', async () => {
    const { PaymentTable } = await import('./payment-table');
    const mockPayments = [
      {
        id: 'p1',
        orderId: 'ORD-001',
        amount: 10000,
        currency: 'KRW',
        status: 'paid' as const,
        method: 'card' as const,
        paidAt: new Date('2026-01-01'),
        createdAt: new Date('2026-01-01'),
        user: { email: 'test@test.com', name: 'Test' },
      },
    ];
    render(<PaymentTable payments={mockPayments} currentStatus="" />);
    expect(screen.getByText('전체')).toBeInTheDocument();
    expect(screen.getAllByText('ORD-001').length).toBeGreaterThan(0);
  });
});

describe('SettingsList', () => {
  it('renders settings', async () => {
    const { SettingsList } = await import('./settings-list');
    const mockSettings = [
      {
        id: 's1',
        key: 'site_name',
        value: 'TestSite',
        description: 'Site name',
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    render(
      <SettingsList settings={mockSettings} />
    );
    expect(screen.getByText('site_name')).toBeInTheDocument();
    expect(screen.getByText('공개')).toBeInTheDocument();
  });

  it('shows empty message when no settings', async () => {
    const { SettingsList } = await import('./settings-list');
    render(
      <SettingsList settings={[]} />
    );
    expect(screen.getByText('설정이 없습니다.')).toBeInTheDocument();
  });
});
