import Papa from 'papaparse';
import type { CSVImportResult, CSVImportError, Service, Product, Client } from '@/types';

/**
 * Parse a CSV file and return structured data with validation
 */
export async function parseCSVFile<T>(
    file: File,
    validator: (row: Record<string, string>, rowIndex: number) => { isValid: boolean; data?: T; error?: string }
): Promise<CSVImportResult<T>> {
    return new Promise((resolve) => {
        const results: T[] = [];
        const errors: CSVImportError[] = [];

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (parseResult) => {
                parseResult.data.forEach((row, index) => {
                    const validation = validator(row as Record<string, string>, index + 2); // +2 because of header row and 1-indexing

                    if (validation.isValid && validation.data) {
                        results.push(validation.data);
                    } else if (validation.error) {
                        errors.push({
                            row: index + 2,
                            field: 'general',
                            error: validation.error,
                            value: row,
                        });
                    }
                });

                resolve({
                    data: results,
                    errors,
                    validCount: results.length,
                    errorCount: errors.length,
                });
            },
            error: (error) => {
                resolve({
                    data: [],
                    errors: [{
                        row: 0,
                        field: 'file',
                        error: error.message,
                        value: null,
                    }],
                    validCount: 0,
                    errorCount: 1,
                });
            },
        });
    });
}

/**
 * Validate and parse services CSV
 */
export function validateServiceRow(row: Record<string, string>, rowIndex: number): {
    isValid: boolean;
    data?: Service;
    error?: string;
} {
    const { name, price, duration } = row;

    if (!name || name.trim() === '') {
        return { isValid: false, error: 'Service name is required' };
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
        return { isValid: false, error: `Invalid price: ${price}` };
    }

    if (!duration || duration.trim() === '') {
        return { isValid: false, error: 'Duration is required' };
    }

    return {
        isValid: true,
        data: {
            id: Date.now() + rowIndex, // Temporary ID
            name: name.trim(),
            price: parsedPrice,
            duration: duration.trim(),
        },
    };
}

/**
 * Validate and parse products CSV
 */
export function validateProductRow(row: Record<string, string>, rowIndex: number): {
    isValid: boolean;
    data?: Product;
    error?: string;
} {
    const { name, price, stock, category, description } = row;

    if (!name || name.trim() === '') {
        return { isValid: false, error: 'Product name is required' };
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
        return { isValid: false, error: `Invalid price: ${price}` };
    }

    const parsedStock = parseInt(stock, 10);
    if (isNaN(parsedStock) || parsedStock < 0) {
        return { isValid: false, error: `Invalid stock: ${stock}` };
    }

    return {
        isValid: true,
        data: {
            id: Date.now() + rowIndex,
            name: name.trim(),
            price: parsedPrice,
            stock: parsedStock,
            category: category?.trim() || undefined,
            description: description?.trim() || undefined,
        },
    };
}

/**
 * Validate and parse clients CSV
 */
export function validateClientRow(row: Record<string, string>, rowIndex: number): {
    isValid: boolean;
    data?: Client;
    error?: string;
} {
    const { name, email, phone } = row;

    if (!name || name.trim() === '') {
        return { isValid: false, error: 'Client name is required' };
    }

    if (!email || email.trim() === '') {
        return { isValid: false, error: 'Email is required' };
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
        return { isValid: false, error: `Invalid email format: ${email}` };
    }

    if (!phone || phone.trim() === '') {
        return { isValid: false, error: 'Phone is required' };
    }

    return {
        isValid: true,
        data: {
            id: Date.now() + rowIndex,
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
        },
    };
}

/**
 * Generate a CSV template file
 */
export function generateCSVTemplate(headers: string[], sampleData?: string[][]): string {
    let csv = headers.join(',') + '\n';

    if (sampleData) {
        sampleData.forEach(row => {
            csv += row.join(',') + '\n';
        });
    }

    return csv;
}

/**
 * Download a CSV file
 */
export function downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
