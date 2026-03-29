import { describe, it, expect, vi, beforeEach } from 'vitest';
import { invoiceService } from './InvoiceService';

// Mock jsPDF - needs to be a proper constructor
const mockText = vi.fn();
const mockLine = vi.fn();
const mockSetFontSize = vi.fn();
const mockSetTextColor = vi.fn();
const mockSetFont = vi.fn();
const mockSetDrawColor = vi.fn();
const mockOutput = vi.fn(() => new Blob(['pdf content'], { type: 'application/pdf' }));

vi.mock('jspdf', () => {
    const MockJsPDF = vi.fn(function (this: Record<string, unknown>) {
        this.text = mockText;
        this.line = mockLine;
        this.setFontSize = mockSetFontSize;
        this.setTextColor = mockSetTextColor;
        this.setFont = mockSetFont;
        this.setDrawColor = mockSetDrawColor;
        this.output = mockOutput;
    });
    return { jsPDF: MockJsPDF };
});

vi.mock('date-fns', () => ({
    format: vi.fn((date: Date, fmt: string) => '15/03/2026')
}));

describe('InvoiceService', () => {
    let mockCreateObjectURL: ReturnType<typeof vi.fn>;
    let mockRevokeObjectURL: ReturnType<typeof vi.fn>;
    let mockAppendChild: ReturnType<typeof vi.fn>;
    let mockRemoveChild: ReturnType<typeof vi.fn>;
    let mockClick: ReturnType<typeof vi.fn>;
    let mockLink: { href: string; download: string; click: ReturnType<typeof vi.fn> };

    beforeEach(() => {
        vi.clearAllMocks();

        mockCreateObjectURL = vi.fn(() => 'blob:http://localhost/fake-url');
        mockRevokeObjectURL = vi.fn();
        mockAppendChild = vi.fn();
        mockRemoveChild = vi.fn();
        mockClick = vi.fn();
        mockLink = { href: '', download: '', click: mockClick };

        global.URL.createObjectURL = mockCreateObjectURL;
        global.URL.revokeObjectURL = mockRevokeObjectURL;
        vi.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLElement);
        vi.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild);
        vi.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild);
    });

    it('should generate a PDF invoice with correct content', () => {
        const income = {
            id: 42,
            date: '2026-03-15',
            clientName: 'Alice Dubois',
            finalAmount: 150,
            amount: 120,
        };

        invoiceService.generatePdf(income);

        // Verify jsPDF methods were called
        expect(mockText).toHaveBeenCalledWith('INVOICE', 105, 20, { align: 'center' });
        expect(mockText).toHaveBeenCalledWith('Invoice #: INV-42', 20, 40);
        expect(mockText).toHaveBeenCalledWith('Alice Dubois', 20, 72);
        // Should use finalAmount (150) over amount (120)
        expect(mockText).toHaveBeenCalledWith('€150.00', 170, 105, { align: 'right' });
    });

    it('should use amount when finalAmount is not available', () => {
        const income = {
            id: 10,
            date: '2026-03-10',
            clientName: 'Bob Smith',
            finalAmount: undefined as unknown as number,
            amount: 200,
        };

        invoiceService.generatePdf(income);

        expect(mockText).toHaveBeenCalledWith('€200.00', 170, 105, { align: 'right' });
    });

    it('should trigger a file download with correct filename', () => {
        const income = {
            id: 42,
            date: '2026-03-15',
            clientName: 'Alice',
            finalAmount: 100,
            amount: 100,
        };

        invoiceService.generatePdf(income);

        expect(mockCreateObjectURL).toHaveBeenCalled();
        expect(mockLink.download).toBe('Invoice_INV-42.pdf');
        expect(mockClick).toHaveBeenCalled();
        expect(mockRevokeObjectURL).toHaveBeenCalled();
    });

    it('should handle missing clientName gracefully', () => {
        const income = {
            id: 5,
            date: '2026-03-15',
            clientName: '',
            finalAmount: 50,
            amount: 50,
        };

        invoiceService.generatePdf(income);

        // Should fall back to 'Unknown Client' when clientName is falsy
        expect(mockText).toHaveBeenCalledWith('Unknown Client', 20, 72);
    });

    it('should handle missing date gracefully', () => {
        const income = {
            id: 5,
            date: '',
            clientName: 'Test',
            finalAmount: 50,
            amount: 50,
        };

        invoiceService.generatePdf(income);

        expect(mockText).toHaveBeenCalledWith('Date: N/A', 20, 47);
    });
});
