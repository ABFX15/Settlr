import { redirect } from "next/navigation";

// Redirect pricing page to waitlist - we want people to contact us first
export default function PricingPage() {
  redirect("/waitlist");
}
