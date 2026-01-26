import { Salon, SalonWorker, Client, Service, ServiceCategory, ExpenseCategory, Expense, Income, Booking, SalonSettings, Review, PromoCode, Product } from '@/types';

/**
 * SALONS
 */
export const INITIAL_SALONS: Salon[] = [
    {
        id: 1,
        name: "Demo Salon",
        slug: "demo-salon",
        specialty: "Braids & Care", // Added for compatibility with UI
        address: "123 Rue de la Coiffe, Paris",
        city: "Paris",
        country: "France",
        rating: 4.8,
        reviews: 124,
        image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400",
        timezone: "Europe/Paris",
        currency: "EUR",
        subscriptionPlan: "pro",
        subscriptionStatus: "active",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'SYSTEM',
        updatedBy: 'SYSTEM'
    } as any, // Cast as any because specialty/rating/image are not in core Salon type but used in UI
    {
        id: 2,
        name: "Downtown Branch",
        slug: "downtown-branch",
        specialty: "Nail Art & Beauty",
        address: "45 Avenue du Style, Lyon",
        city: "Lyon",
        country: "France",
        rating: 4.6,
        reviews: 89,
        image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400",
        timezone: "Europe/Paris",
        currency: "EUR",
        subscriptionPlan: "pro",
        subscriptionStatus: "active",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'SYSTEM',
        updatedBy: 'SYSTEM'
    } as any,
    {
        id: 3,
        name: "Luxury Spa",
        slug: "luxury-spa",
        specialty: "Massage & Wellness",
        address: "8 Boulevard du Calme, Nice",
        city: "Nice",
        country: "France",
        rating: 4.9,
        reviews: 210,
        image: "https://images.unsplash.com/photo-1544161515-4ae6ce6ca8b8?w=400",
        timezone: "Europe/Paris",
        currency: "EUR",
        subscriptionPlan: "pro",
        subscriptionStatus: "active",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'SYSTEM',
        updatedBy: 'SYSTEM'
    } as any,
    {
        id: 4,
        name: "Afro Chic",
        slug: "afro-chic",
        specialty: "African Braids",
        address: "10 Rue de l'Afrique, Bordeaux",
        city: "Bordeaux",
        country: "France",
        rating: 4.7,
        reviews: 56,
        image: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400",
        timezone: "Europe/Paris",
        currency: "EUR",
        subscriptionPlan: "pro",
        subscriptionStatus: "active",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'SYSTEM',
        updatedBy: 'SYSTEM'
    } as any,
];

/**
 * WORKERS
 */
export const INITIAL_WORKERS: SalonWorker[] = [
    {
        id: 1,
        salonId: 1,
        userId: 1,
        name: 'Orphelia',
        email: 'orphelia@saloon.com',
        phone: '+33 6 00 00 00 01',
        sharingKey: 60,
        status: 'Active',
        avatarUrl: undefined,
        color: '#8B5CF6',
        bio: 'Expert in braiding',
        specialties: ['Braiding', 'Cornrows'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'SYSTEM',
        updatedBy: 'SYSTEM'
    },
    {
        id: 2,
        salonId: 1,
        userId: 2,
        name: 'Marie Dubois',
        email: 'marie@saloon.com',
        phone: '+33 6 00 00 00 02',
        sharingKey: 55,
        status: 'Active',
        avatarUrl: undefined,
        color: '#EC4899',
        bio: 'Stylist with 10 years experience',
        specialties: ['Styling', 'Color'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'SYSTEM',
        updatedBy: 'SYSTEM'
    },
    {
        id: 3,
        salonId: 1,
        name: 'Isabelle',
        email: 'isabelle@saloon.com',
        phone: '+33 6 00 00 00 03',
        sharingKey: 45,
        status: 'Active',
        color: '#9333EA',
        bio: 'Expert Hair Stylist',
        specialties: ['Haircut', 'Styling'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'SYSTEM',
        updatedBy: 'SYSTEM'
    },
    {
        id: 4,
        salonId: 1,
        name: 'Fatima S',
        email: 'fatima@saloon.com',
        phone: '+33 6 00 00 00 04',
        sharingKey: 50,
        status: 'Active',
        color: '#EC4899',
        bio: 'Creative Nail Artist',
        specialties: ['Manicure', 'Nail Art'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'SYSTEM',
        updatedBy: 'SYSTEM'
    },
    {
        id: 5,
        salonId: 1,
        name: 'Nadine B',
        email: 'nadine@saloon.com',
        phone: '+33 6 00 00 00 05',
        sharingKey: 40,
        status: 'Active',
        color: '#F59E0B',
        bio: 'Master Colorist',
        specialties: ['Coloring', 'Balayage'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'SYSTEM',
        updatedBy: 'SYSTEM'
    }
];

/**
 * CLIENTS
 */
export const INITIAL_CLIENTS: Client[] = [
    {
        id: 1,
        salonId: 1,
        name: 'Marie Dubois',
        email: 'marie.dubois@email.com',
        phone: '+33 6 12 34 56 78',
        address: 'Paris, France',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'SYSTEM',
        updatedBy: 'SYSTEM'
    },
    {
        id: 2,
        salonId: 1,
        name: 'Jean Martin',
        email: 'jean.martin@email.com',
        phone: '+33 6 98 76 54 32',
        address: 'Lyon, France',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'SYSTEM',
        updatedBy: 'SYSTEM'
    },
    {
        id: 3,
        salonId: 1,
        name: 'Sophie Laurent',
        email: 'sophie.laurent@email.com',
        phone: '+33 7 11 22 33 44',
        address: 'Marseille, France',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'SYSTEM',
        updatedBy: 'SYSTEM'
    },
    {
        id: 4,
        salonId: 1,
        name: 'Pierre Rousseau',
        email: 'pierre.r@email.com',
        phone: '+33 6 55 66 77 88',
        address: 'Toulouse, France',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'SYSTEM',
        updatedBy: 'SYSTEM'
    },
    {
        id: 5,
        salonId: 1,
        name: 'Amélie Bernard',
        email: 'amelie.b@email.com',
        phone: '+33 7 44 55 66 77',
        address: 'Nice, France',
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'SYSTEM',
        updatedBy: 'SYSTEM'
    },
    {
        id: 6,
        salonId: 1,
        name: 'Thomas Petit',
        email: 'thomas.petit@email.com',
        phone: '+33 6 33 44 55 66',
        address: 'Nantes, France',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'SYSTEM',
        updatedBy: 'SYSTEM'
    },
    {
        id: 7,
        salonId: 1,
        name: 'Isabelle Moreau',
        email: 'isabelle.m@email.com',
        phone: '+33 7 22 33 44 55',
        address: 'Bordeaux, France',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'SYSTEM',
        updatedBy: 'SYSTEM'
    },
    {
        id: 8,
        salonId: 1,
        name: 'Nicolas Simon',
        email: 'nicolas.simon@email.com',
        phone: '+33 6 77 88 99 00',
        address: 'Strasbourg, France',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'SYSTEM',
        updatedBy: 'SYSTEM'
    }
];

/**
 * CATEGORIES
 */
export const INITIAL_SERVICE_CATEGORIES: ServiceCategory[] = [
    {
        id: 1,
        salonId: 1,
        name: 'Braiding',
        description: 'Traditional and modern braiding services',
        displayOrder: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'SYSTEM',
        updatedBy: 'SYSTEM'
    }
];

export const INITIAL_EXPENSE_CATEGORIES: ExpenseCategory[] = [
    {
        id: 1,
        salonId: 1,
        name: 'Rent',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'SYSTEM',
        updatedBy: 'SYSTEM'
    },
    {
        id: 2,
        salonId: 1,
        name: 'Supplies',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'SYSTEM',
        updatedBy: 'SYSTEM'
    }
];

/**
 * SERVICES
 */
export const INITIAL_SERVICES: Service[] = [
    {
        id: 1,
        salonId: 1,
        categoryId: 1,
        name: 'Box Braids',
        description: 'Traditional box braids with various sizes',
        price: 120,
        duration: 240,
        icon: 'braids',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'SYSTEM',
        updatedBy: 'SYSTEM'
    },
    {
        id: 2,
        salonId: 1,
        categoryId: 1,
        name: 'Cornrows',
        description: 'Classic cornrow braiding style',
        price: 85,
        duration: 120,
        icon: 'cornrows',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'SYSTEM',
        updatedBy: 'SYSTEM'
    }
];

/**
 * SETTINGS
 */
export const INITIAL_SALON_SETTINGS: SalonSettings[] = [
    {
        id: 1,
        salonId: 1,
        allowOnlineBooking: true,
        bookingAdvanceDays: 30,
        bookingSlotDuration: 30,
        requireClientApproval: false,
        sendEmailConfirmations: true,
        sendSmsReminders: false,
        tipsEnabled: true,
        tipsDistributionRule: 'EQUAL_ALL',
        defaultWorkerSharePct: 40,
        openingHours: [
            { day: 'monday', isOpen: true, openTime: '09:00', closeTime: '19:00' },
            { day: 'tuesday', isOpen: true, openTime: '09:00', closeTime: '19:00' },
            { day: 'wednesday', isOpen: true, openTime: '09:00', closeTime: '19:00' },
            { day: 'thursday', isOpen: true, openTime: '09:00', closeTime: '19:00' },
            { day: 'friday', isOpen: true, openTime: '09:00', closeTime: '20:00' },
            { day: 'saturday', isOpen: true, openTime: '10:00', closeTime: '18:00' },
            { day: 'sunday', isOpen: false, openTime: '00:00', closeTime: '00:00' },
        ],
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

/**
 * BOOKINGS
 */
export const INITIAL_BOOKINGS: Booking[] = [
    {
        id: 1,
        salonId: 1,
        clientId: 1,
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        endTime: '14:00',
        duration: 240,
        status: 'Confirmed',
        notes: 'Client préfère les tresses box braids moyennes',
        incomeId: 1,
        isSensitive: false,
        clientName: 'Marie Dubois',
        serviceIds: [1],
        workerIds: [1],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'SYSTEM',
        updatedBy: 'SYSTEM'
    },
    {
        id: 2,
        salonId: 1,
        clientId: 2,
        date: new Date().toISOString().split('T')[0],
        time: '14:30',
        endTime: '16:30',
        duration: 120,
        status: 'Confirmed',
        notes: '',
        isSensitive: false,
        clientName: 'Jean Martin',
        serviceIds: [2],
        workerIds: [2],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'SYSTEM',
        updatedBy: 'SYSTEM'
    },
    {
        id: 3,
        salonId: 1,
        clientId: 3,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
        time: '11:00',
        endTime: '13:00',
        duration: 120,
        status: 'Finished',
        incomeId: 2,
        isSensitive: false,
        clientName: 'Sophie Laurent',
        serviceIds: [2],
        workerIds: [1],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        createdBy: 'SYSTEM',
        updatedBy: 'SYSTEM'
    },
    {
        id: 4,
        salonId: 1,
        clientId: 4,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '09:00',
        endTime: '13:00',
        duration: 240,
        status: 'Finished',
        incomeId: 4,
        isSensitive: false,
        clientName: 'Pierre Rousseau',
        serviceIds: [1],
        workerIds: [2],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        createdBy: 'SYSTEM',
        updatedBy: 'SYSTEM'
    }
];

/**
 * INCOMES
 */
export const INITIAL_INCOMES: Income[] = [
    {
        id: 1,
        salonId: 1,
        bookingId: 1,
        clientId: 1,
        amount: 120,
        discountAmount: 0,
        finalAmount: 120,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Card',
        status: 'Validated',
        hasInvoice: false,
        clientName: 'Marie Dubois',
        serviceIds: [1],
        workerIds: [1],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'SYSTEM',
        updatedBy: 'SYSTEM'
    },
    {
        id: 2,
        salonId: 1,
        bookingId: 3,
        clientId: 3,
        amount: 85,
        discountAmount: 0,
        finalAmount: 85,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paymentMethod: 'Cash',
        status: 'Validated',
        hasInvoice: false,
        clientName: 'Sophie Laurent',
        serviceIds: [2],
        workerIds: [1],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        createdBy: 'SYSTEM',
        updatedBy: 'SYSTEM'
    },
    {
        id: 3,
        salonId: 1,
        clientId: 2,
        amount: 150,
        discountAmount: 15,
        finalAmount: 135,
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paymentMethod: 'Card',
        status: 'Validated',
        hasInvoice: true,
        promoCodeId: 1,
        clientName: 'Jean Martin',
        serviceIds: [1, 2],
        workerIds: [1, 2],
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        createdBy: 'SYSTEM',
        updatedBy: 'SYSTEM'
    },
    {
        id: 4,
        salonId: 1,
        bookingId: 4,
        clientId: 4,
        amount: 150,
        discountAmount: 0,
        finalAmount: 150,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paymentMethod: 'Card',
        status: 'Validated',
        hasInvoice: true,
        clientName: 'Pierre Rousseau',
        serviceIds: [1],
        workerIds: [2],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        createdBy: 'SYSTEM',
        updatedBy: 'SYSTEM'
    },
    {
        id: 101,
        salonId: 1,
        clientId: 1,
        amount: 120,
        finalAmount: 120,
        date: "2026-01-13",
        paymentMethod: "Card",
        status: "Pending",
        hasInvoice: false,
        discountAmount: 0,
        clientName: "Marie Dubois",
        serviceIds: [1],
        workerIds: [1],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'Orphelia',
        updatedBy: 'Orphelia'
    },
    {
        id: 102,
        salonId: 1,
        clientId: 2,
        amount: 85,
        finalAmount: 85,
        date: "2026-01-12",
        paymentMethod: "Cash",
        status: "Pending",
        hasInvoice: false,
        discountAmount: 0,
        clientName: "Jean Martin",
        serviceIds: [2],
        workerIds: [2],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'Worker 2',
        updatedBy: 'Worker 2'
    },
    {
        id: 103,
        salonId: 1,
        clientId: 3,
        amount: 95,
        finalAmount: 95,
        date: "2026-01-12",
        paymentMethod: "Card",
        status: "Pending",
        hasInvoice: false,
        discountAmount: 0,
        clientName: "Sophie Laurent",
        serviceIds: [2],
        workerIds: [1],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'Orphelia',
        updatedBy: 'Orphelia'
    }
];

/**
 * EXPENSES (Extended)
 */
export const INITIAL_EXPENSES: Expense[] = [
    {
        id: 1,
        salonId: 1,
        categoryId: 1,
        amount: 1200,
        date: new Date().toISOString().split('T')[0],
        description: 'Loyer mensuel',
        paymentMethod: 'Transfer',
        status: 'Approved',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'SYSTEM',
        updatedBy: 'SYSTEM'
    },
    {
        id: 2,
        salonId: 1,
        categoryId: 2,
        amount: 250,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Fournitures de coiffure',
        paymentMethod: 'Card',
        status: 'Approved',
        isActive: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        createdBy: 'SYSTEM',
        updatedBy: 'SYSTEM'
    },
    {
        id: 3,
        salonId: 1,
        categoryId: 2,
        amount: 180,
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Produits capillaires',
        paymentMethod: 'Card',
        status: 'Approved',
        isActive: true,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        createdBy: 'SYSTEM',
        updatedBy: 'SYSTEM'
    },
    {
        id: 201,
        salonId: 1,
        categoryId: 2,
        amount: 350,
        date: "2026-01-13",
        description: "Hair extensions and products",
        status: "Pending",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "Orphelia",
        updatedBy: "Orphelia"
    },
    {
        id: 202,
        salonId: 1,
        categoryId: 2,
        amount: 75,
        date: "2026-01-12",
        description: "Weekly cleaning service",
        status: "Pending",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "Worker 2",
        updatedBy: "Worker 2"
    },
    {
        id: 203,
        salonId: 1,
        categoryId: 1,
        amount: 150,
        date: "2026-01-11",
        description: "Monthly internet bill",
        status: "Pending",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "Admin",
        updatedBy: "Admin"
    }
];

/**
 * REVIEWS
 */
export const INITIAL_REVIEWS: Review[] = [
    {
        id: 1,
        salonId: 1,
        bookingId: 3,
        clientId: 1,
        workerId: 1,
        rating: 5,
        comment: 'Excellent service! Orphelia est très professionnelle.',
        isApproved: true,
        isPublic: true,
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
    },
    {
        id: 2,
        salonId: 1,
        clientId: 2,
        workerId: 2,
        rating: 4,
        comment: 'Très bon travail, juste un peu d\'attente.',
        isApproved: true,
        isPublic: true,
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
    },
    {
        id: 3,
        salonId: 1,
        clientId: 1,
        workerId: 1,
        rating: 5,
        comment: 'Toujours satisfaite! Je recommande.',
        isApproved: true,
        isPublic: true,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }
];

/**
 * PROMO CODES
 */
export const INITIAL_PROMO_CODES: PromoCode[] = [
    {
        id: 1,
        salonId: 1,
        code: 'BIENVENUE10',
        description: 'Réduction de 10% pour les nouveaux clients',
        type: 'percentage',
        value: 10,
        isActive: true,
        usageCount: 1,
        maxUsage: 100,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        affectWorkerShare: false,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        createdBy: 'SYSTEM',
        updatedBy: 'SYSTEM'
    },
    {
        id: 2,
        salonId: 1,
        code: 'FIDELITE20',
        description: '20€ de réduction pour clients fidèles',
        type: 'fixed',
        value: 20,
        isActive: true,
        usageCount: 0,
        maxUsage: 50,
        affectWorkerShare: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'SYSTEM',
        updatedBy: 'SYSTEM'
    }
];

/**
 * PRODUCTS
 */
export const INITIAL_PRODUCTS: Product[] = [
    {
        id: 1,
        salonId: 1,
        name: 'Huile de coco bio',
        description: 'Huile naturelle pour cheveux afro',
        price: 15,
        stock: 25,
        category: 'Hair Care',
        sku: 'PROD-001',
        isLinkedToService: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'SYSTEM',
        updatedBy: 'SYSTEM'
    },
    {
        id: 2,
        salonId: 1,
        name: 'Shampoing hydratant',
        description: 'Shampoing pour cheveux secs',
        price: 12,
        stock: 30,
        category: 'Hair Care',
        sku: 'PROD-002',
        isLinkedToService: true,
        linkedServiceId: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'SYSTEM',
        updatedBy: 'SYSTEM'
    },
    {
        id: 3,
        salonId: 1,
        name: 'Gel de tressage',
        description: 'Gel professionnel pour tresses',
        price: 18,
        stock: 15,
        category: 'Styling',
        sku: 'PROD-003',
        isLinkedToService: true,
        linkedServiceId: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'SYSTEM',
        updatedBy: 'SYSTEM'
    }
];
