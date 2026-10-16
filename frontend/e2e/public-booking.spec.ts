import { test, expect, type Page } from '@playwright/test';

/**
 * Public booking page (/book/[slug]) end-to-end flow.
 * The public API routes are mocked so the test runs without Supabase or Stripe.
 */

const salonPayload = {
    salon: { id: 1, name: 'Adorable Braids', slug: 'adorable-braids', address: '123 Main St', city: 'Houston', phone: '+1 555 0100', currency: 'USD', timezone: 'America/Chicago' },
    settings: {
        allowOnlineBooking: true, bookingSlotDuration: 30, bookingAdvanceDays: 30,
        depositType: 'percent', depositValue: 25,
        bookingTerms: ['My hair will be washed and blow dried.', 'I understand I am responsible for booking the correct location.'],
        openingHours: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map(day => ({ day, isOpen: true, openTime: '09:00', closeTime: '18:00' })).concat([{ day: 'sunday', isOpen: false, openTime: '00:00', closeTime: '00:00' }]),
    },
    categories: [{ id: 1, name: 'Knotless braids', displayOrder: 1 }],
    services: [
        { id: 10, categoryId: 1, name: 'Knotless - Medium', description: 'Hair must be freshly washed.', price: 240, duration: 330, addonIds: [100, 101] },
        { id: 11, categoryId: 1, name: 'Knotless - Large', price: 180, duration: 270, addonIds: [100] },
    ],
    addons: [
        { id: 100, name: 'Lower back', extraPrice: 30, extraDuration: 60 },
        { id: 101, name: 'Wash + blow dry', extraPrice: 25, extraDuration: 30 },
    ],
    workers: [{ id: 4, name: 'Kevine', specialties: ['Knotless'] }, { id: 5, name: 'Falone', specialties: [] }],
};

async function mockPublicApi(page: Page, onBooking: (body: Record<string, unknown>) => void) {
    await page.route('**/api/public/salons/adorable-braids', route => route.fulfill({ json: salonPayload }));
    await page.route('**/api/public/salons/adorable-braids/availability**', route => {
        const url = new URL(route.request().url());
        const slots = ['09:00', '09:30', '10:00', '10:30', '11:00', '13:00', '13:30'].map(time => ({ time, available: time !== '10:00', freeWorkerIds: [4, 5] }));
        route.fulfill({ json: { date: url.searchParams.get('date'), slots } });
    });
    await page.route('**/api/public/salons/adorable-braids/bookings', async route => {
        const body = route.request().postDataJSON() as Record<string, unknown>;
        onBooking(body);
        await route.fulfill({
            status: 201,
            json: { bookingId: 77, clientId: 9, status: 'Pending', totalPrice: 270, depositAmount: 67.5, workerId: 4, time: body.time, endTime: '15:30', paymentMode: 'demo' },
        });
    });
}

test.describe('Public booking page', () => {
    test('a client books a service with an extra, a stylist, a slot and pays a deposit (demo)', async ({ page }) => {
        let posted: Record<string, unknown> | null = null;
        await mockPublicApi(page, body => { posted = body; });

        await page.goto('/book/adorable-braids');
        await expect(page.getByTestId('public-booking-page')).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Adorable Braids' })).toBeVisible();

        // 1. Service
        await page.getByRole('button', { name: /Knotless - Medium/ }).click();
        await expect(page.getByTestId('next-button')).toBeEnabled();
        await page.getByTestId('next-button').click();

        // 2. Extras: +$30, +1h
        await expect(page.getByTestId('step-extras')).toBeVisible();
        await page.getByRole('button', { name: /Lower back/ }).click();
        await page.getByTestId('next-button').click();

        // 3. Stylist
        await expect(page.getByTestId('step-stylist')).toBeVisible();
        await page.getByRole('button', { name: /Kevine/ }).click();
        await page.getByTestId('next-button').click();

        // 4. Date & time: an unavailable slot is disabled
        await expect(page.getByTestId('step-schedule')).toBeVisible();
        await expect(page.getByRole('button', { name: '10:00', exact: true })).toBeDisabled();
        await page.getByRole('button', { name: '09:30', exact: true }).click();
        await page.getByTestId('next-button').click();

        // 5. Details, summary, terms
        await expect(page.getByTestId('step-details')).toBeVisible();
        await expect(page.getByTestId('total-price')).toHaveText(/270/);
        await page.getByTestId('first-name').fill('Marie');
        await page.getByTestId('last-name').fill('Dubois');
        await page.getByTestId('phone').fill('+1 555 123 4567');
        await page.getByTestId('email').fill('marie@example.com');
        await expect(page.getByTestId('next-button')).toBeDisabled(); // terms not accepted yet
        for (const box of await page.getByTestId('terms').getByRole('checkbox').all()) await box.check();
        await expect(page.getByTestId('next-button')).toBeEnabled();
        await expect(page.getByTestId('next-button')).toHaveText(/67\.50/);
        await page.getByTestId('next-button').click();

        // 6. Confirmation
        await expect(page.getByTestId('step-done')).toBeVisible();
        await expect(page.getByTestId('step-done')).toContainText('#77');
        expect(posted).not.toBeNull();
        expect(posted!.serviceIds).toEqual([10]);
        expect(posted!.addonIds).toEqual([100]);
        expect(posted!.workerId).toBe(4);
        expect(posted!.time).toBe('09:30');
        expect(posted!.termsAccepted).toBe(true);
    });

    test('shows a friendly message for an unknown salon', async ({ page }) => {
        await page.route('**/api/public/salons/unknown-salon', route => route.fulfill({ status: 404, json: { error: 'Salon not found' } }));
        await page.goto('/book/unknown-salon');
        await expect(page.getByRole('heading')).toContainText(/does not exist|n'existe pas|no existe/);
    });
});
