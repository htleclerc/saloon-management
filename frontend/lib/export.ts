/**
 * Export utilities for exporting data to CSV and PDF formats
 * Works entirely client-side without backend
 */

export interface ExportColumn<TData = unknown> {
    key: string;
    header: string;
    formatter?: (value: TData) => string;
}

/**
 * Export data to CSV format and trigger download
 */
export function exportToCSV<T extends Record<string, any>>(
    data: T[],
    columns: ExportColumn[],
    filename: string = 'export'
): void {
    if (data.length === 0) {
        alert('No data to export');
        return;
    }

    // Create header row
    const headers = columns.map(col => `"${col.header}"`).join(',');

    // Create data rows
    const rows = data.map(item => {
        return columns.map(col => {
            const value = item[col.key];
            const formattedValue = col.formatter ? col.formatter(value) : value;
            // Escape quotes and wrap in quotes
            const escaped = String(formattedValue ?? '').replace(/"/g, '""');
            return `"${escaped}"`;
        }).join(',');
    });

    // Combine header and rows
    const csvContent = [headers, ...rows].join('\n');

    // Add BOM for Excel compatibility with UTF-8
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

    // Create download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${formatDateForFilename()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Export data to PDF format and trigger download
 * Uses browser print functionality for simplicity (no external dependencies)
 */
export function exportToPDF<T extends Record<string, any>>(
    data: T[],
    columns: ExportColumn[],
    title: string = 'Export',
    filename: string = 'export'
): void {
    if (data.length === 0) {
        alert('No data to export');
        return;
    }

    // Create a new window with printable content
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Please allow popups for PDF export');
        return;
    }

    // Generate table HTML
    const tableRows = data.map(item => {
        const cells = columns.map(col => {
            const value = item[col.key];
            const formattedValue = col.formatter ? col.formatter(value) : value;
            return `<td style="border: 1px solid #ddd; padding: 8px 12px; text-align: left;">${formattedValue ?? ''}</td>`;
        }).join('');
        return `<tr>${cells}</tr>`;
    }).join('');

    const tableHeaders = columns.map(col =>
        `<th style="border: 1px solid #ddd; padding: 10px 12px; text-align: left; background-color: #7c3aed; color: white; font-weight: 600;">${col.header}</th>`
    ).join('');

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${title}</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    padding: 40px;
                    color: #333;
                }
                h1 {
                    color: #7c3aed;
                    margin-bottom: 8px;
                }
                .meta {
                    color: #666;
                    font-size: 14px;
                    margin-bottom: 24px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 16px;
                    font-size: 13px;
                }
                tr:nth-child(even) {
                    background-color: #f9fafb;
                }
                tr:hover {
                    background-color: #f3f4f6;
                }
                .footer {
                    margin-top: 32px;
                    padding-top: 16px;
                    border-top: 1px solid #e5e7eb;
                    font-size: 12px;
                    color: #9ca3af;
                    text-align: center;
                }
                @media print {
                    body { padding: 20px; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <h1>${title}</h1>
            <div class="meta">
                Generated on ${new Date().toLocaleString()} • ${data.length} records
            </div>
            <table>
                <thead>
                    <tr>${tableHeaders}</tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
            <div class="footer">
                Saloon Management System • Export Report
            </div>
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(() => window.close(), 500);
                }
            </script>
        </body>
        </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
}

/**
 * Format current date for filename
 */
function formatDateForFilename(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/**
 * Sort data by a column
 */
export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig {
    key: string;
    direction: SortDirection;
}

export function sortData<T extends Record<string, any>>(
    data: T[],
    sortConfig: SortConfig | null
): T[] {
    if (!sortConfig || !sortConfig.direction) {
        return data;
    }

    return [...data].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Handle null/undefined
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortConfig.direction === 'asc' ? -1 : 1;
        if (bValue == null) return sortConfig.direction === 'asc' ? 1 : -1;

        // Handle numbers
        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }

        // Handle dates
        if (aValue instanceof Date && bValue instanceof Date) {
            return sortConfig.direction === 'asc'
                ? aValue.getTime() - bValue.getTime()
                : bValue.getTime() - aValue.getTime();
        }

        // Handle strings (including date strings)
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();

        if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });
}

/**
 * Get next sort direction in cycle: null -> asc -> desc -> null
 */
export function getNextSortDirection(current: SortDirection): SortDirection {
    if (current === null) return 'asc';
    if (current === 'asc') return 'desc';
    return null;
}
