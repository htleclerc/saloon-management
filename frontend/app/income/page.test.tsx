import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import IncomePage from './page';

// Mock all dependencies
vi.mock('jspdf', () => ({
    jsPDF: vi.fn(() => ({
        save: vi.fn(),
        text: vi.fn(),
        autoTable: vi.fn(),
        internal: { pageSize: { getWidth: () => 100 } }
    }))
}));

vi.mock('qrcode.react', () => ({
    QRCodeSVG: () => <div data-testid="qrcode" />
}));

vi.mock('@/components/layout/MainLayout', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <div data-testid="main-layout">{children}</div>
}));

vi.mock('next/navigation', () => ({
    useRouter: vi.fn(() => ({
        push: vi.fn(),
        replace: vi.fn(),
        refresh: vi.fn()
    })),
    useSearchParams: vi.fn(() => ({
        get: vi.fn()
    })),
    usePathname: vi.fn(() => '/income')
}));

vi.mock('@/context/AuthProvider', () => ({
    useAuth: vi.fn(() => ({
        user: { id: 1, name: 'Test User', role: 'admin' },
        isWorker: false,
        activeSalonId: '1'
    })),
    UserRole: {
        ADMIN: 'admin',
        MANAGER: 'manager',
        WORKER: 'worker',
        CLIENT: 'client'
    }
}));

vi.mock('@/context/BookingProvider', () => ({
    useBooking: vi.fn(() => ({}))
}));

vi.mock('@/context/ConfirmProvider', () => ({
    useConfirm: vi.fn(() => vi.fn(() => Promise.resolve(true)))
}));

vi.mock('@/context/ToastProvider', () => ({
    useToast: vi.fn(() => ({
        showToast: vi.fn()
    }))
}));

vi.mock('@/i18n', () => ({
    useTranslation: vi.fn(() => ({
        t: (key: string) => key
    }))
}));

vi.mock('@/hooks/useKpiCardStyle', () => ({
    useKpiCardStyle: vi.fn(() => ({
        getCardStyle: vi.fn()
    }))
}));

vi.mock('@/lib/permissions', () => ({
    canPerformIncomeAction: vi.fn(() => true),
    useActionPermissions: vi.fn(() => ({
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canViewFinancialDashboard: true
    }))
}));

const { mockIncomes, mockWorkers, mockServices } = vi.hoisted(() => {
    const incomes = [
        {
            id: 1,
            date: '2026-02-01',
            clientName: 'Alice Dubois',
            serviceName: 'Tresse Box Braids',
            amount: 120,
            status: 'Draft',
            paymentMethod: 'Cash',
            workerIds: [1],
            workerName: 'Marie Martin',
            workerShares: [{ workerId: 1, amount: 80, percentage: 66.67 }]
        },
        {
            id: 2,
            date: '2026-02-02',
            clientName: 'Bob Smith',
            serviceName: 'Coupe Homme',
            amount: 200,
            status: 'Validated',
            paymentMethod: 'Card',
            workerIds: [1, 2],
            workerName: 'Marie Martin, Sophie Durand',
            workerShares: [
                { workerId: 1, amount: 100, percentage: 50 },
                { workerId: 2, amount: 100, percentage: 50 }
            ]
        },
        {
            id: 3,
            date: '2026-02-03',
            clientName: 'Charlie Brown',
            serviceName: 'Soin Hydratant',
            amount: 150,
            status: 'Pending',
            paymentMethod: 'Cash',
            workerIds: [2],
            workerName: 'Sophie Durand',
            workerShares: [{ workerId: 2, amount: 120, percentage: 80 }]
        },
        {
            id: 4,
            date: '2026-02-04',
            clientName: 'Diana Prince',
            serviceName: 'Tresse Box Braids',
            amount: 180,
            status: 'Cancelled',
            paymentMethod: 'Card',
            workerIds: [1],
            workerName: 'Marie Martin',
            workerShares: [{ workerId: 1, amount: 120, percentage: 66.67 }]
        },
        {
            id: 5,
            date: '2026-02-05',
            clientName: 'Eve Anderson',
            serviceName: 'Coupe Femme',
            amount: 220,
            status: 'Archived',
            paymentMethod: 'Card',
            workerIds: [1, 2],
            workerName: 'Marie Martin, Sophie Durand',
            workerShares: [
                { workerId: 1, amount: 110, percentage: 50 },
                { workerId: 2, amount: 110, percentage: 50 }
            ]
        }
    ];

    const workers = [
        { id: 1, name: 'Marie Martin' },
        { id: 2, name: 'Sophie Durand' }
    ];

    const services = [
        { id: 1, name: 'Tresse Box Braids' },
        { id: 2, name: 'Coupe Homme' },
        { id: 3, name: 'Soin Hydratant' },
        { id: 4, name: 'Coupe Femme' }
    ];

    return { mockIncomes: incomes, mockWorkers: workers, mockServices: services };
});

vi.mock('@/lib/services', () => ({
    incomeService: {
        getAll: vi.fn(() => Promise.resolve(mockIncomes)),
        get: vi.fn((id: number) => Promise.resolve(mockIncomes.find(i => i.id === id))),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        getHistory: vi.fn(() => Promise.resolve([]))
    },
    serviceService: {
        getAll: vi.fn(() => Promise.resolve(mockServices))
    },
    workerService: {
        getAll: vi.fn(() => Promise.resolve(mockWorkers)),
        getUserCode: vi.fn() // Add this as page.tsx likely calls it
    },
    statsService: {
        getMonthlyIncomeTrend: vi.fn(() => Promise.resolve([])),
        getIncomeByStatus: vi.fn(() => Promise.resolve([]))
    }
}));

describe('IncomePage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Income List Filtering', () => {
        it('should display all incomes initially', async () => {
            render(<IncomePage />);

            await waitFor(() => {
                expect(screen.getByText('Alice Dubois')).toBeInTheDocument();
                expect(screen.getByText('Bob Smith')).toBeInTheDocument();
                expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
            });
        });

        it('should filter by status: Draft', async () => {
            render(<IncomePage />);

            await waitFor(() => {
                const statusSelect = screen.getByLabelText(/common.status/i);
                fireEvent.change(statusSelect, { target: { value: 'Draft' } });
            });

            await waitFor(() => {
                expect(screen.getByText('Alice Dubois')).toBeInTheDocument();
                expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument();
            });
        });

        it('should filter by status: Validated', async () => {
            render(<IncomePage />);

            await waitFor(() => {
                const statusSelect = screen.getByLabelText(/common.status/i);
                fireEvent.change(statusSelect, { target: { value: 'Validated' } });
            });

            await waitFor(() => {
                expect(screen.queryByText('Alice Dubois')).not.toBeInTheDocument();
                expect(screen.getByText('Bob Smith')).toBeInTheDocument();
            });
        });

        it('should filter by worker', async () => {
            render(<IncomePage />);

            await waitFor(() => {
                const workerSelect = screen.getByLabelText(/common.worker/i);
                fireEvent.change(workerSelect, { target: { value: '1' } });
            });

            await waitFor(() => {
                // Should show incomes where worker 1 is involved
                expect(screen.getByText('Alice Dubois')).toBeInTheDocument();
                expect(screen.getByText('Bob Smith')).toBeInTheDocument();
                expect(screen.queryByText('Charlie Brown')).not.toBeInTheDocument();
            });
        });

        it('should search by client name', async () => {
            render(<IncomePage />);

            await waitFor(() => {
                const searchInput = screen.getByPlaceholderText(/search/i);
                fireEvent.change(searchInput, { target: { value: 'Alice' } });
            });

            await waitFor(() => {
                expect(screen.getByText('Alice Dubois')).toBeInTheDocument();
                expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument();
            });
        });
    });

    describe('Status-Based Actions', () => {
        it('should show Delete button for Draft income', async () => {
            render(<IncomePage />);

            await waitFor(() => {
                const draftRow = screen.getByText('Alice Dubois').closest('tr');
                expect(draftRow).toBeInTheDocument();
                const deleteButton = draftRow?.querySelector('[title*="delete"]');
                expect(deleteButton).toBeInTheDocument();
            });
        });

        it('should show Archive button for Validated income', async () => {
            render(<IncomePage />);

            await waitFor(() => {
                const validatedRow = screen.getByText('Bob Smith').closest('tr');
                const archiveButton = validatedRow?.querySelector('[title*="archive"]');
                expect(archiveButton).toBeInTheDocument();
            });
        });

        it('should NOT show Delete/Archive for Cancelled income', async () => {
            render(<IncomePage />);

            await waitFor(() => {
                const cancelledRow = screen.getByText('Diana Prince').closest('tr');
                const deleteButton = cancelledRow?.querySelector('[title*="delete"]');
                const archiveButton = cancelledRow?.querySelector('[title*="archive"]');
                expect(deleteButton).not.toBeInTheDocument();
                expect(archiveButton).not.toBeInTheDocument();
            });
        });

        it('should NOT show Delete/Archive for Archived income', async () => {
            render(<IncomePage />);

            await waitFor(() => {
                const archivedRow = screen.getByText('Eve Anderson').closest('tr');
                const deleteButton = archivedRow?.querySelector('[title*="delete"]');
                const archiveButton = archivedRow?.querySelector('[title*="archive"]');
                expect(deleteButton).not.toBeInTheDocument();
                expect(archiveButton).not.toBeInTheDocument();
            });
        });
    });

    describe('Print and Export', () => {
        it('should have Print button', async () => {
            render(<IncomePage />);

            await waitFor(() => {
                const printButton = screen.getByTitle(/common.print/i);
                expect(printButton).toBeInTheDocument();
            });
        });

        it('should have Export button', async () => {
            render(<IncomePage />);

            await waitFor(() => {
                const exportButton = screen.getByTitle(/common.export/i);
                expect(exportButton).toBeInTheDocument();
            });
        });

        it('should call handlePrintList when Print button is clicked', async () => {
            const windowOpenSpy = vi.spyOn(window, 'open').mockReturnValue(null);

            render(<IncomePage />);

            await waitFor(() => {
                const printButton = screen.getByTitle(/common.print/i);
                fireEvent.click(printButton);
            });

            expect(windowOpenSpy).toHaveBeenCalled();
            windowOpenSpy.mockRestore();
        });


        it('should generate CSV when Export button is clicked', async () => {
            const createElementSpy = vi.spyOn(document, 'createElement');

            render(<IncomePage />);

            await waitFor(() => {
                const exportButton = screen.getByTitle(/common.export/i);
                fireEvent.click(exportButton);
            });

            expect(createElementSpy).toHaveBeenCalledWith('a');
            createElementSpy.mockRestore();
        });
    });

    describe('Comment Button', () => {
        it('should have Comment button for each income', async () => {
            render(<IncomePage />);

            await waitFor(() => {
                const commentButtons = screen.getAllByTitle(/comment/i);
                expect(commentButtons.length).toBeGreaterThan(0);
            });
        });

        it('should toggle comment section when Comment button is clicked', async () => {
            render(<IncomePage />);

            await waitFor(() => {
                const commentButton = screen.getAllByTitle(/comment/i)[0];
                fireEvent.click(commentButton);
            });

            // Comment section should appear
            await waitFor(() => {
                expect(screen.getByText(/comment/i)).toBeInTheDocument();
            });
        });
    });
});
