import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import { getPublicSalon } from '@/lib/public-booking/server';

/**
 * GET /api/public/salons/[slug]
 *
 * Public catalog of a salon for its booking page: salon card, booking rules,
 * active services with their extras, and active stylists. No authentication.
 */
export async function GET(_request: NextRequest, context: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await context.params;
        if (!slug || !/^[a-z0-9-]{1,100}$/i.test(slug)) {
            return NextResponse.json({ error: 'Invalid salon' }, { status: 400 });
        }

        const admin = createSupabaseAdmin();
        const payload = await getPublicSalon(admin, slug);
        if (!payload) {
            return NextResponse.json({ error: 'Salon not found' }, { status: 404 });
        }

        return NextResponse.json(payload, {
            headers: { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=120' },
        });
    } catch (error) {
        console.error('Public salon error:', error);
        return NextResponse.json({ error: 'Failed to load salon' }, { status: 500 });
    }
}
