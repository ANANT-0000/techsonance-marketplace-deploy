"use client";
import React from "react";
import { InnerSideBar } from "@/components/vendor/InnerSideBar";
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex w-full">
      <InnerSideBar selectedMenu="Marketing" />
      {children}
    </main>
  );
}
