import { jsPDF } from "jspdf";
import { format } from "date-fns";

export const invoiceService = {
    generatePdf: (income: any) => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text("INVOICE", 105, 20, { align: "center" });

        // Brand/Company Info (Placeholder)
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text("Saloon Management", 20, 20);

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

        // Items
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text("Salon Services", 20, 105);
        doc.text(`€${Number(income.finalAmount || income.amount).toFixed(2)}`, 170, 105, { align: "right" });

        // Divider
        doc.line(20, 115, 190, 115);

        // Total
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(`TOTAL DUE: €${Number(income.finalAmount || income.amount).toFixed(2)}`, 170, 130, { align: "right" });

        // Footer
        doc.setFontSize(8);
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
