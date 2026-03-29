import type { ExpenseCategory } from '@/types';

/**
 * Get default expense categories based on salon type
 */
/**
 * Get default expense categories based on salon type
 */
export function getExpenseCategoryTemplates(salonType: string): Partial<ExpenseCategory>[] {
    const commonCategories: Partial<ExpenseCategory>[] = [
        { id: 1, name: 'Loyer', color: '#3b82f6', icon: 'building' },
        { id: 2, name: 'Électricité', color: '#eab308', icon: 'zap' },
        { id: 3, name: 'Eau', color: '#06b6d4', icon: 'droplet' },
        { id: 4, name: 'Internet & Téléphone', color: '#8b5cf6', icon: 'wifi' },
        { id: 5, name: 'Assurances', color: '#10b981', icon: 'shield' },
        { id: 6, name: 'Marketing & Publicité', color: '#f59e0b', icon: 'megaphone' },
        { id: 7, name: 'Fournitures de bureau', color: '#6b7280', icon: 'clipboard' },
        { id: 8, name: 'Entretien & Réparations', color: '#ef4444', icon: 'wrench' },
    ];

    // Specific categories by salon type
    const specificCategories: Record<string, Partial<ExpenseCategory>[]> = {
        braids: [
            { id: 9, name: 'Extensions & Mèches', color: '#ec4899', icon: 'package' },
            { id: 10, name: 'Produits capillaires', color: '#a855f7', icon: 'spray-can' },
            { id: 11, name: 'Accessoires (perles, fils)', color: '#f97316', icon: 'gem' },
        ],
        hair: [
            { id: 9, name: 'Produits capillaires', color: '#ec4899', icon: 'spray-can' },
            { id: 10, name: 'Colorations & Décolorations', color: '#a855f7', icon: 'palette' },
            { id: 11, name: 'Shampoings & Soins', color: '#06b6d4', icon: 'droplet' },
            { id: 12, name: 'Outils (ciseaux, sèche-cheveux)', color: '#f97316', icon: 'scissors' },
        ],
        nails: [
            { id: 9, name: 'Vernis & Gels', color: '#ec4899', icon: 'palette' },
            { id: 10, name: 'Faux ongles', color: '#f97316', icon: 'sparkles' },
            { id: 11, name: 'Outils manucure', color: '#8b5cf6', icon: 'tool' },
            { id: 12, name: 'Décorations (strass, stickers)', color: '#f59e0b', icon: 'gem' },
        ],
        barber: [
            { id: 9, name: 'Produits de rasage', color: '#0ea5e9', icon: 'spray-can' },
            { id: 10, name: 'Tondeuses & Accessoires', color: '#f97316', icon: 'scissors' },
            { id: 11, name: 'Soins barbe', color: '#8b5cf6', icon: 'droplet' },
            { id: 12, name: 'Serviettes & Linge', color: '#06b6d4', icon: 'shirt' },
        ],
        beauty: [
            { id: 9, name: 'Produits de soin visage', color: '#ec4899', icon: 'sparkles' },
            { id: 10, name: 'Maquillage', color: '#a855f7', icon: 'palette' },
            { id: 11, name: 'Épilation', color: '#f97316', icon: 'zap' },
            { id: 12, name: 'Parfums & Cosmétiques', color: '#06b6d4', icon: 'spray-can' },
        ],
        spa: [
            { id: 9, name: 'Huiles & Crèmes de massage', color: '#06b6d4', icon: 'droplet' },
            { id: 10, name: 'Produits spa', color: '#8b5cf6', icon: 'sparkles' },
            { id: 11, name: 'Linge (serviettes, peignoirs)', color: '#10b981', icon: 'shirt' },
            { id: 12, name: 'Équipement spa', color: '#f59e0b', icon: 'package' },
        ],
    };

    const specific = specificCategories[salonType] || [];
    return [...commonCategories, ...specific];
}

/**
 * Generate CSV template for expense categories
 */
export function getExpenseCategoriesCSVTemplate(categories: Partial<ExpenseCategory>[]): string {
    const headers = 'name,color,icon';
    const rows = categories.map(cat =>
        `${cat.name},${cat.color},${cat.icon || 'tag'}`
    );

    return [headers, ...rows].join('\n');
}

/**
 * Download CSV template with pre-filled data
 */
export function downloadExpenseCategoriesCSV(categories: Partial<ExpenseCategory>[], filename: string = 'categories_depenses.csv') {
    const csv = getExpenseCategoriesCSVTemplate(categories);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
