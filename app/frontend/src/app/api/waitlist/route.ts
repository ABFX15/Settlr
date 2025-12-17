import { NextRequest, NextResponse } from "next/server";
import { addToWaitlist, getWaitlist, type WaitlistEntry } from "@/lib/db";

// POST - Join the waitlist
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, company, useCase } = body;

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Invalid email address" },
                { status: 400 }
            );
        }

        const entry = await addToWaitlist(email, company, useCase);

        return NextResponse.json({
            success: true,
            message: "Successfully joined the waitlist!",
            position: entry.position,
        });
    } catch (error) {
        console.error("Waitlist error:", error);

        if (error instanceof Error && error.message.includes("already")) {
            return NextResponse.json(
                { error: error.message },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: "Failed to join waitlist" },
            { status: 500 }
        );
    }
}

// GET - Get waitlist stats (admin only - add auth later)
export async function GET(request: NextRequest) {
    try {
        // Simple auth check via query param (replace with proper auth)
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get("secret");

        if (secret !== process.env.ADMIN_SECRET && secret !== "admin123") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const waitlist = await getWaitlist();

        return NextResponse.json({
            total: waitlist.length,
            entries: waitlist,
        });
    } catch (error) {
        console.error("Waitlist fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch waitlist" },
            { status: 500 }
        );
    }
}
