import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getEmailService } from "@/lib/email/service";
import { EmailSendRequestSchema, type EmailSendRequest } from "@/types/email";

/**
 * POST /api/email/send
 *
 * Sends a transactional email via Brevo.
 * Requires authentication.
 */
export async function POST(request: NextRequest) {
    try {
        // Auth check
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Parse & validate
        const body = await request.json();
        const parsed = EmailSendRequestSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid request", details: parsed.error.flatten() },
                { status: 400 },
            );
        }

        // Send
        const emailService = getEmailService();
        const result = await emailService.send(parsed.data as EmailSendRequest);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || "Failed to send email" },
                { status: 500 },
            );
        }

        return NextResponse.json({
            success: true,
            messageId: result.messageId,
        });
    } catch (error) {
        console.error("[/api/email/send] Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
