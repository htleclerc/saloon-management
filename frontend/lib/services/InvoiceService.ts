import { jsPDF } from "jspdf";
import { format } from "date-fns";

interface InvoiceSalonInfo {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
}

export const invoiceService = {
    /**
     * Generate a PDF invoice for an income record.
     * Uses salon info when available instead of hardcoded company name.
     */
    generatePdf: (income: { id?: number; date?: string; clientName?: string; finalAmount?: number; amount?: number; serviceNames?: string[]; discountAmount?: number }, salonInfo?: InvoiceSalonInfo) => {
        const doc = new jsPDF();

        const companyName = salonInfo?.name || 'Saloon Management';
        const companyAddress = salonInfo?.address || '';
        const companyPhone = salonInfo?.phone || '';
        const companyEmail = salonInfo?.email || '';

        // Header
        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text("INVOICE", 105, 20, { align: "center" });

        // Company Info (from salon)
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(companyName, 20, 20);
        let companyY = 25;
        if (companyAddress) {
            doc.text(companyAddress, 20, companyY);
            companyY += 5;
        }
        if (companyPhone) {
            doc.text(`Tel: ${companyPhone}`, 20, companyY);
            companyY += 5;
        }
        if (companyEmail) {
            doc.text(companyEmail, 20, companyY);
        }

        // Invoice Details
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Invoice #: INV-${income.id}`, 20, 40);
        doc.text(`Date: ${income.date ? format(new Date(income.date), 'dd/MM/yyyy') : 'N/A'}`, 20, 47);

        // Client Info
        doc.text("BILLED TO:", 20, 65);
        doc.setFont("helvetica", "bold");
        doc.text(income.clientName || 'Unknown Client', 20, 72);
        doc.setFont("helvetica", "normal");

        // Divider
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 85, 190, 85);

        // Table Header
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text("DESCRIPTION", 20, 95);
        doc.text("TOTAL", 170, 95, { align: "right" });

        // Items - list service names if available
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        const serviceNames = income.serviceNames;
        const finalAmount = Number(income.finalAmount || income.amount || 0);
        let itemY = 105;

        if (serviceNames && serviceNames.length > 0) {
            for (const serviceName of serviceNames) {
                doc.text(serviceName, 20, itemY);
                itemY += 7;
            }
            // Total line
            doc.text(`€${finalAmount.toFixed(2)}`, 170, 105, { align: "right" });
        } else {
            doc.text("Salon Services", 20, 105);
            doc.text(`€${finalAmount.toFixed(2)}`, 170, 105, { align: "right" });
            itemY = 112;
        }

        // Discount if applicable
        const discountAmount = Number(income.discountAmount ?? 0);
        if (discountAmount > 0) {
            doc.setTextColor(100, 100, 100);
            doc.text(`Discount: -€${discountAmount.toFixed(2)}`, 170, itemY, { align: "right" });
            itemY += 7;
        }

        // Divider
        doc.line(20, itemY + 3, 190, itemY + 3);

        // Total
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text(`TOTAL DUE: €${finalAmount.toFixed(2)}`, 170, itemY + 18, { align: "right" });

        // Footer
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(150, 150, 150);
        doc.text("Thank you for your business!", 105, 280, { align: "center" });

        // Generate Blob and save manually to ensure filename is respected
        const pdfBlob = doc.output('blob');
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Invoice_INV-${income.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
};
