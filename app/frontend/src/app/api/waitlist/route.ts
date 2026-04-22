import { NextRequest, NextResponse } from "next/server";
import { addToWaitlist, getWaitlist, type WaitlistEntry } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// POST - Join the waitlist
export async function POST(request: NextRequest) {
    try {
        const rateLimited = await checkRateLimit(`waitlist:${getClientIp(request)}`);
        if (rateLimited) return rateLimited;

        const body = await request.json();
        const { email, name, company, useCase, walletAddress } = body;

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

        // Validate wallet address format if provided
        if (walletAddress) {
            const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
            if (!solanaAddressRegex.test(walletAddress)) {
                return NextResponse.json(
                    { error: "Invalid wallet address" },
                    { status: 400 }
                );
            }
        }

        const entry = await addToWaitlist(email, company, useCase, name, walletAddress);

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
        const auth = request.headers.get("authorization") || "";
        const bearer = auth.startsWith("Bearer ") ? auth.replace("Bearer ", "") : "";
        const adminKey = request.headers.get("x-admin-key") || "";
        const expected = process.env.ADMIN_SECRET || "";

        if (!expected || (bearer !== expected && adminKey !== expected)) {
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
