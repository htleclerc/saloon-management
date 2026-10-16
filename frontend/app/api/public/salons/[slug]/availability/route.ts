import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import { getPublicSalon, getPublicAvailability } from '@/lib/public-booking/server';
import { PublicAvailabilityQuerySchema } from '@/lib/validators/publicBooking.schemas';

/**
 * GET /api/public/salons/[slug]/availability?date=YYYY-MM-DD&duration=330&workerId=4
 *
 * Bookable start times for a day, given the total duration of the selected
 * services and extras and an optional stylist. No authentication.
 */
export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await context.params;
        const parsed = PublicAvailabilityQuerySchema.safeParse({
            date: request.nextUrl.searchParams.get('date'),
            duration: request.nextUrl.searchParams.get('duration'),
            workerId: request.nextUrl.searchParams.get('workerId') || undefined,
        });
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid query' }, { status: 400 });
        }

        const admin = createSupabaseAdmin();
        const payload = await getPublicSalon(admin, slug);
        if (!payload) {
            return NextResponse.json({ error: 'Salon not found' }, { status: 404 });
        }

        const slots = await getPublicAvailability(admin, payload, parsed.data);
        return NextResponse.json({ date: parsed.data.date, slots });
    } catch (error) {
        console.error('Public availability error:', error);
        return NextResponse.json({ error: 'Failed to load availability' }, { status: 500 });
    }
}
