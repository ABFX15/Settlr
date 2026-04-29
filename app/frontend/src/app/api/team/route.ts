/**
 * Team / multi-signer management — minimal scaffold.
 *
 * Lists invited team members for a merchant and lets the owner invite a
 * new member by email. Designed so cannabis distributors with separate
 * controllers / accountants / owners can each have their own login while
 * settlement signatures are still gated by the Squads multisig configured
 * during onboarding.
 *
 * STATUS: storage is in-memory. Wire to Supabase `merchant_team_members`
 * table before going to production. Roles mapped to Squads permissions
 * (admin = signer, accountant = view-only) live in the same table.
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

type Role = "admin" | "accountant" | "viewer";

interface TeamMember {
    id: string;
    merchantWallet: string; // owning merchant
    email: string;
    role: Role;
    status: "invited" | "active" | "revoked";
    inviteToken?: string;
    invitedAt: string;
    activatedAt?: string;
}

// In-memory until wired to Supabase.
const TEAM_BY_MERCHANT: Map<string, TeamMember[]> = new Map();

function listTeam(wallet: string): TeamMember[] {
    return TEAM_BY_MERCHANT.get(wallet) ?? [];
}

function addMember(wallet: string, m: TeamMember): void {
    const existing = TEAM_BY_MERCHANT.get(wallet) ?? [];
    existing.push(m);
    TEAM_BY_MERCHANT.set(wallet, existing);
}

function isValidRole(r: unknown): r is Role {
    return r === "admin" || r === "accountant" || r === "viewer";
}

function isValidEmail(s: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function GET(req: NextRequest) {
    const wallet = req.nextUrl.searchParams.get("wallet");
    if (!wallet || wallet.length < 32) {
        return NextResponse.json(
            { error: "wallet query param required" },
            { status: 400 },
        );
    }
    return NextResponse.json({ members: listTeam(wallet) });
}

export async function POST(req: NextRequest) {
    let body: { wallet?: string; email?: string; role?: string };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { wallet, email, role } = body;
    if (!wallet || typeof wallet !== "string" || wallet.length < 32) {
        return NextResponse.json(
            { error: "wallet required" },
            { status: 400 },
        );
    }
    if (!email || typeof email !== "string" || !isValidEmail(email)) {
        return NextResponse.json(
            { error: "Valid email required" },
            { status: 400 },
        );
    }
    if (!isValidRole(role)) {
        return NextResponse.json(
            { error: "role must be admin | accountant | viewer" },
            { status: 400 },
        );
    }

    const existing = listTeam(wallet);
    if (existing.some((m) => m.email.toLowerCase() === email.toLowerCase())) {
        return NextResponse.json(
            { error: "Already invited" },
            { status: 409 },
        );
    }

    const member: TeamMember = {
        id: `tm_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`,
        merchantWallet: wallet,
        email: email.trim().toLowerCase(),
        role,
        status: "invited",
        inviteToken: crypto.randomBytes(24).toString("base64url"),
        invitedAt: new Date().toISOString(),
    };
    addMember(wallet, member);

    // TODO: when wiring to production, call lib/email to send the invite
    // link with `inviteToken` so the recipient can claim the seat via Privy.

    return NextResponse.json({ member }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
    const wallet = req.nextUrl.searchParams.get("wallet");
    const memberId = req.nextUrl.searchParams.get("id");
    if (!wallet || !memberId) {
        return NextResponse.json(
            { error: "wallet + id required" },
            { status: 400 },
        );
    }
    const team = TEAM_BY_MERCHANT.get(wallet) ?? [];
    const target = team.find((m) => m.id === memberId);
    if (!target) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    target.status = "revoked";
    return NextResponse.json({ member: target });
}
