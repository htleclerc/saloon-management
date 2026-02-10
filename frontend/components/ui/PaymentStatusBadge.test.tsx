import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PaymentStatusBadge from './PaymentStatusBadge';

// Mock translation
vi.mock('@/i18n', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                'team.paymentStatuses.pending': 'En attente',
                'team.paymentStatuses.approved': 'Validé',
                'team.paymentStatuses.rejected': 'Rejeté',
                'team.paymentStatuses.disputed': 'Contesté'
            };
            return translations[key] || key;
        },
        language: 'fr'
    })
}));

describe('PaymentStatusBadge', () => {
    it('should render "En attente" for pending status', () => {
        render(<PaymentStatusBadge status="pending" />);
        expect(screen.getByText('En attente')).toBeInTheDocument();
    });

    it('should render "Validé" for approved status', () => {
        render(<PaymentStatusBadge status="approved" />);
        expect(screen.getByText('Validé')).toBeInTheDocument();
    });

    it('should render "Rejeté" for rejected status', () => {
        render(<PaymentStatusBadge status="rejected" />);
        expect(screen.getByText('Rejeté')).toBeInTheDocument();
    });

    it('should apply correct color classes for different statuses', () => {
        const { rerender } = render(<PaymentStatusBadge status="approved" />);
        expect(screen.getByText('Validé')).toHaveClass('bg-green-50');

        rerender(<PaymentStatusBadge status="rejected" />);
        expect(screen.getByText('Rejeté')).toHaveClass('bg-red-50');

        rerender(<PaymentStatusBadge status="pending" />);
        expect(screen.getByText('En attente')).toHaveClass('bg-yellow-50');
    });
});
