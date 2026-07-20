// Reads request headers via getCompanyDomain() — must never be statically prerendered.
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { InnerSideBar } from "@/components/vendor/InnerSideBar";
import React from "react";

export default async function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex w-full">
      <InnerSideBar selectedMenu="Catalog" />
      {children}
    </main>
  );
}
