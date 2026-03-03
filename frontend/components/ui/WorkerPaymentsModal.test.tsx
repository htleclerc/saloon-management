import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import WorkerPaymentsModal from './WorkerPaymentsModal';
import { SalaryPayment } from '@/lib/services/PayrollService';

// Mock translation
vi.mock('@/i18n', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                'team.paymentDetails': 'Détails des paiements',
                'common.close': 'Fermer',
                'common.date': 'Date',
                'common.amount': 'Montant',
                'common.status': 'Statut',
                'common.noData': 'Aucune donnée'
            };
            return translations[key] || key;
        },
        language: 'fr'
    })
}));

// Mock useCurrency
vi.mock('@/hooks/useCurrency', () => ({
    useCurrency: () => ({
        format: (val: number) => `$${val.toFixed(2)}`
    })
}));

// Mock PaymentStatusBadge
vi.mock('./PaymentStatusBadge', () => ({
    __esModule: true,
    default: ({ status }: { status: string }) => <div data-testid={`badge-${status}`}>{status}</div>
}));

describe('WorkerPaymentsModal', () => {
    const mockPayments: SalaryPayment[] = [
        {
            id: 1,
            workerId: 10,
            salonId: 1,
            paymentMonth: '2026-02-01',
            baseSalary: 1000,
            commission: 200,
            tips: 50,
            totalAmount: 1250,
            paidAmount: 1250,
            paidDate: '2026-02-10',
            status: 'approved'
        },
        {
            id: 2,
            workerId: 10,
            salonId: 1,
            paymentMonth: '2026-02-01',
            baseSalary: 0,
            commission: 0,
            tips: 20,
            totalAmount: 20,
            paidAmount: 20,
            paidDate: '2026-02-11',
            status: 'pending'
        }
    ];

    it('should NOT render when isOpen is false', () => {
        const { container } = render(
            <WorkerPaymentsModal isOpen={false} onClose={() => { }} payments={[]} />
        );
        expect(container).toBeEmptyDOMElement();
    });

    it('should render payment rows when open', () => {
        render(
            <WorkerPaymentsModal isOpen={true} onClose={() => { }} payments={mockPayments} workerName="Jane Doe" />
        );

        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
        expect(screen.getByText('Détails des paiements')).toBeInTheDocument();
        expect(screen.getByText('$1250.00')).toBeInTheDocument();
        expect(screen.getByText('$20.00')).toBeInTheDocument();
        expect(screen.getByTestId('badge-approved')).toBeInTheDocument();
        expect(screen.getByTestId('badge-pending')).toBeInTheDocument();
    });

    it('should show "Aucune donnée" if payments is empty', () => {
        render(
            <WorkerPaymentsModal isOpen={true} onClose={() => { }} payments={[]} />
        );
        expect(screen.getByText('Aucune donnée')).toBeInTheDocument();
    });
});
