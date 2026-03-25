import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const filename = formData.get("filename") as string;
        const content = formData.get("content") as string;

        if (!filename || !content) {
            return new NextResponse("Missing filename or content payload for export.", { status: 400 });
        }

        // Serve the downloaded file back to the browser forcing it to be an attachment
        return new NextResponse(content, {
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error("Error generating API download:", error);
        return new NextResponse("Internal Server Error generating document.", { status: 500 });
    }
}
