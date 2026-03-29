import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isEmailConfigured, getBrevoConfig } from "@/lib/email/config";

/**
 * GET /api/email/status
 *
 * Returns whether the Brevo email provider is configured.
 * Requires authentication.
 */
export async function GET() {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const configured = isEmailConfigured();
        const config = getBrevoConfig();

        return NextResponse.json({
            configured,
            senderEmail: configured ? config.senderEmail : null,
            senderName: configured ? config.senderName : null,
        });
    } catch (error) {
        console.error("[/api/email/status] Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
