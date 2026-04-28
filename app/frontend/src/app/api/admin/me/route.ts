/**
 * GET /api/admin/me
 *
 * Returns whether the currently signed-in wallet is on the platform admin list.
 * Used by the admin UI to gate the dashboard without making the user
 * speculatively call protected endpoints.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionWallet } from "@/lib/wallet-session";
import { isAdminWallet } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
    const wallet = getSessionWallet(request);
    if (!wallet) {
        return NextResponse.json({ authenticated: false, isAdmin: false });
    }
    return NextResponse.json({
        authenticated: true,
        wallet,
        isAdmin: isAdminWallet(wallet),
    });
}
