import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * DELETE /api/webhooks/[id] - Delete a webhook
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (isSupabaseConfigured()) {
            const { error } = await supabase
                .from("webhooks")
                .delete()
                .eq("id", id);

            if (error) {
                logger.error("Supabase error:", error);
                return NextResponse.json(
                    { error: "Failed to delete webhook" },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        logger.error("Error deleting webhook:", error);
        return NextResponse.json(
            { error: "Failed to delete webhook" },
            { status: 500 }
        );
    }
}
