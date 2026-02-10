import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PaymentHistoryModal from './PaymentHistoryModal';
import { PaymentStatusHistory } from '@/lib/services/PayrollService';

// Mock translation
vi.mock('@/i18n', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                'team.paymentHistory': 'Historique des paiements',
                'team.paymentActions.created': 'Création',
                'team.paymentStatuses.approved': 'Validé',
                'common.close': 'Fermer',
                'common.noData': 'Aucune donnée'
            };
            return translations[key] || key;
        },
        language: 'fr'
    })
}));

// Mock PaymentStatusBadge to simplify test
vi.mock('./PaymentStatusBadge', () => ({
    __esModule: true,
    default: ({ status }: { status: string }) => <div data-testid={`badge-${status}`}>{status}</div>
}));

describe('PaymentHistoryModal', () => {
    const mockHistory: PaymentStatusHistory[] = [
        {
            id: 1,
            paymentId: 101,
            newStatus: 'pending',
            previousStatus: undefined,
            changedAt: '2026-02-10T10:00:00Z',
            changedByName: 'Admin User',
            metadata: { action: 'created' }
        },
        {
            id: 2,
            paymentId: 101,
            newStatus: 'approved',
            previousStatus: 'pending',
            changedAt: '2026-02-10T11:00:00Z',
            changedByName: 'Manager User'
        }
    ];

    it('should NOT render when isOpen is false', () => {
        const { container } = render(
            <PaymentHistoryModal isOpen={false} onClose={() => { }} history={[]} paymentId={101} />
        );
        expect(container).toBeEmptyDOMElement();
    });

    it('should render history entries when open', () => {
        render(
            <PaymentHistoryModal isOpen={true} onClose={() => { }} history={mockHistory} paymentId={101} workerName="John Doe" />
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Création')).toBeInTheDocument();
        expect(screen.getByText('Validé')).toBeInTheDocument();
        expect(screen.getByText('Admin User')).toBeInTheDocument();
        expect(screen.getByText('Manager User')).toBeInTheDocument();
    });

    it('should show "Aucune donnée" if history is empty', () => {
        render(
            <PaymentHistoryModal isOpen={true} onClose={() => { }} history={[]} paymentId={101} />
        );
        expect(screen.getByText('Aucune donnée')).toBeInTheDocument();
    });
});
