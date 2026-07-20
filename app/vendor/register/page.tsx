/**
 * Vendor Register – Server Component page gate
 *
 * Reads the VENDOR_REGISTER_DOMAINS environment variable (server-only, no
 * NEXT_PUBLIC_ prefix) and calls notFound() for any hostname not in the
 * comma-separated allow-list.  Only whitelisted domains render the real
 * registration form.
 */

import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import VendorRegisterClient from "./VendorRegisterClient";

export default async function VendorRegisterPage() {
  const allowedRaw = process.env.VENDOR_REGISTER_DOMAINS ?? "";
  const allowed = allowedRaw
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);

  const headersList = await headers();
  // next/headers gives us the incoming host. x-forwarded-host is set by
  // reverse-proxies and Vercel; fall back to the plain host header.
  const rawHost =
    headersList.get("x-forwarded-host") ?? headersList.get("host") ?? "";
  const hostname = rawHost.split(":")[0].toLowerCase(); // strip port

  if (allowed.length > 0 && !allowed.includes(hostname)) {
    notFound();
  }

  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <VendorRegisterClient />
    </Suspense>
  );
}
