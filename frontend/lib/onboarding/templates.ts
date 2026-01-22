import type { Service, Product } from '@/types';

/**
 * Service templates organized by salon type
 */
export const serviceTemplates: Record<string, Service[]> = {
    braids: [
        { id: 1, name: 'Box Braids', price: 150, duration: '180' },
        { id: 2, name: 'Cornrows', price: 80, duration: '120' },
        { id: 3, name: 'Twists', price: 100, duration: '150' },
        { id: 4, name: 'Locs', price: 120, duration: '180' },
        { id: 5, name: 'Crochet Braids', price: 90, duration: '120' },
        { id: 6, name: 'Feed-in Braids', price: 110, duration: '150' },
        { id: 7, name: 'Goddess Locs', price: 140, duration: '180' },
        { id: 8, name: 'Passion Twists', price: 130, duration: '180' },
    ],
    hair: [
        { id: 1, name: 'Coupe', price: 50, duration: '60' },
        { id: 2, name: 'Coloration', price: 120, duration: '120' },
        { id: 3, name: 'Brushing', price: 40, duration: '45' },
        { id: 4, name: 'Lissage', price: 150, duration: '180' },
        { id: 5, name: 'Balayage', price: 180, duration: '180' },
        { id: 6, name: 'Mèches', price: 100, duration: '120' },
        { id: 7, name: 'Soin profond', price: 60, duration: '60' },
        { id: 8, name: 'Coiffure événementielle', price: 90, duration: '90' },
    ],
    nails: [
        { id: 1, name: 'Manucure', price: 35, duration: '45' },
        { id: 2, name: 'Pédicure', price: 45, duration: '60' },
        { id: 3, name: 'Gel UV', price: 50, duration: '60' },
        { id: 4, name: 'Nail Art', price: 60, duration: '75' },
        { id: 5, name: 'French', price: 40, duration: '50' },
        { id: 6, name: 'Pose capsules', price: 70, duration: '90' },
        { id: 7, name: 'Vernis semi-permanent', price: 45, duration: '60' },
        { id: 8, name: 'Soin des mains', price: 30, duration: '30' },
    ],
    barber: [
        { id: 1, name: 'Coupe classique', price: 30, duration: '30' },
        { id: 2, name: 'Dégradé', price: 35, duration: '45' },
        { id: 3, name: 'Barbe', price: 20, duration: '20' },
        { id: 4, name: 'Rasage traditionnel', price: 25, duration: '30' },
        { id: 5, name: 'Coupe + Barbe', price: 45, duration: '60' },
        { id: 6, name: 'Design capillaire', price: 40, duration: '45' },
        { id: 7, name: 'Soin barbe', price: 30, duration: '30' },
    ],
    beauty: [
        { id: 1, name: 'Maquillage', price: 60, duration: '60' },
        { id: 2, name: 'Épilation', price: 40, duration: '45' },
        { id: 3, name: 'Soin visage', price: 80, duration: '90' },
        { id: 4, name: 'Extension cils', price: 100, duration: '120' },
        { id: 5, name: 'Microblading', price: 300, duration: '180' },
        { id: 6, name: 'Teinture sourcils', price: 25, duration: '30' },
        { id: 7, name: 'Soin corps', price: 90, duration: '90' },
    ],
    spa: [
        { id: 1, name: 'Massage', price: 90, duration: '60' },
        { id: 2, name: 'Gommage', price: 70, duration: '45' },
        { id: 3, name: 'Enveloppement', price: 100, duration: '75' },
        { id: 4, name: 'Hammam', price: 50, duration: '60' },
        { id: 5, name: 'Soins du dos', price: 80, duration: '60' },
        { id: 6, name: 'Réflexologie', price: 75, duration: '60' },
        { id: 7, name: 'Aromathérapie', price: 85, duration: '75' },
    ],
};

/**
 * Product templates organized by salon type
 */
export const productTemplates: Record<string, Product[]> = {
    braids: [
        { id: 1, name: 'Braiding Hair - Natural Black', price: 8, stock: 50, category: 'Hair Extensions' },
        { id: 2, name: 'Braiding Hair - Dark Brown', price: 8, stock: 40, category: 'Hair Extensions' },
        { id: 3, name: 'Edge Control Gel', price: 12, stock: 30, category: 'Styling' },
        { id: 4, name: 'Mousse à tresser', price: 10, stock: 25, category: 'Styling' },
        { id: 5, name: 'Satin Bonnet', price: 6, stock: 100, category: 'Accessories' },
    ],
    hair: [
        { id: 1, name: 'Shampoo Professional', price: 15, stock: 50, category: 'Hair Care' },
        { id: 2, name: 'Après-shampoing', price: 15, stock: 50, category: 'Hair Care' },
        { id: 3, name: 'Masque réparateur', price: 25, stock: 30, category: 'Hair Care' },
        { id: 4, name: 'Sérum brillance', price: 20, stock: 40, category: 'Styling' },
        { id: 5, name: 'Laque fixation forte', price: 12, stock: 60, category: 'Styling' },
    ],
    nails: [
        { id: 1, name: 'Vernis - Rouge Passion', price: 8, stock: 100, category: 'Polish' },
        { id: 2, name: 'Vernis - Nude Chic', price: 8, stock: 100, category: 'Polish' },
        { id: 3, name: 'Base coat', price: 10, stock: 50, category: 'Base/Top' },
        { id: 4, name: 'Top coat brillant', price: 10, stock: 50, category: 'Base/Top' },
        { id: 5, name: 'Kit Nail Art', price: 25, stock: 20, category: 'Decoration' },
    ],
    barber: [
        { id: 1, name: 'Tondeuse professionnelle', price: 150, stock: 5, category: 'Tools' },
        { id: 2, name: 'Rasoir de sûreté', price: 30, stock: 10, category: 'Tools' },
        { id: 3, name: 'Crème à raser', price: 12, stock: 40, category: 'Shaving' },
        { id: 4, name: 'Après-rasage', price: 15, stock: 35, category: 'Shaving' },
        { id: 5, name: 'Huile à barbe', price: 18, stock: 30, category: 'Beard Care' },
    ],
    beauty: [
        { id: 1, name: 'Fond de teint', price: 35, stock: 40, category: 'Makeup' },
        { id: 2, name: 'Palette fards à paupières', price: 45, stock: 25, category: 'Makeup' },
        { id: 3, name: 'Crème hydratante visage', price: 40, stock: 30, category: 'Skincare' },
        { id: 4, name: 'Sérum anti-âge', price: 60, stock: 20, category: 'Skincare' },
        { id: 5, name: 'Cire dépilatoire', price: 20, stock: 35, category: 'Waxing' },
    ],
    spa: [
        { id: 1, name: 'Huile de massage - Lavande', price: 25, stock: 30, category: 'Massage' },
        { id: 2, name: 'Huile de massage - Eucalyptus', price: 25, stock: 30, category: 'Massage' },
        { id: 3, name: 'Gommage corps - Sel de mer', price: 30, stock: 25, category: 'Body Care' },
        { id: 4, name: 'Masque argile', price: 20, stock: 40, category: 'Facial' },
        { id: 5, name: 'Bougie aromathérapie', price: 15, stock: 50, category: 'Ambiance' },
    ],
};

/**
 * Get service templates for a specific salon type
 */
export function getServiceTemplates(salonType: string): Service[] {
    return serviceTemplates[salonType] || [];
}

/**
 * Get product templates for a specific salon type
 */
export function getProductTemplates(salonType: string): Product[] {
    return productTemplates[salonType] || [];
}

/**
 * Generate CSV template content for services
 */
export function getServicesCSVTemplate(): string {
    return `name,price,duration,category
Haircut,50,60,Hair
Color Treatment,120,120,Hair
Manicure,35,45,Nails
Massage,80,60,Spa`;
}

/**
 * Generate CSV template content for products
 */
export function getProductsCSVTemplate(): string {
    return `name,price,stock,category,description
Shampoo Professional,15,50,Hair Care,Premium salon shampoo
Nail Polish - Red,8,100,Nails,Classic red polish
Massage Oil,25,30,Spa,Lavender scented
Hair Gel,12,40,Styling,Strong hold gel`;
}

/**
 * Generate CSV template content for clients
 */
export function getClientsCSVTemplate(): string {
    return `name,email,phone,notes
John Doe,john@example.com,555-0100,Regular client since 2023
Jane Smith,jane@example.com,555-0101,Prefers morning appointments
Bob Johnson,bob@example.com,555-0102,VIP client`;
}

/**
 * Generate CSV template content for workers
 */
export function getWorkersCSVTemplate(): string {
    return `name,email,role,sharingKey,canAddIncome,canAddExpenses
Alice Johnson,alice@salon.com,worker,40,true,false
Bob Williams,bob@salon.com,manager,0,true,true
Carol Davis,carol@salon.com,worker,35,true,false`;
}
