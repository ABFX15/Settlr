import { redirect } from "next/navigation";

/**
 * The standalone Sphere off-ramp page is retired. Cash-out now runs through
 * the in-product honest flow (KYB + AML gated, partner-settled) at
 * /dashboard/offramp. Redirect any old links there.
 */
export default function OfframpRedirect() {
  redirect("/dashboard/offramp");
}
