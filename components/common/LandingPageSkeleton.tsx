"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function LandingPageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50/50 overflow-x-hidden w-full space-y-20 pb-20">
      {/* Skeleton Navbar */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-lg bg-slate-200" />
          <Skeleton className="w-24 h-5 rounded-md bg-slate-200" />
        </div>
        <div className="hidden md:flex items-center gap-6">
          <Skeleton className="w-16 h-4 rounded bg-slate-200" />
          <Skeleton className="w-16 h-4 rounded bg-slate-200" />
          <Skeleton className="w-16 h-4 rounded bg-slate-200" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="w-20 h-9 rounded-xl bg-slate-200" />
          <Skeleton className="w-24 h-9 rounded-xl bg-slate-300" />
        </div>
      </header>

      {/* Skeleton Hero Section */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-8">
        <div className="lg:col-span-7 space-y-6">
          {/* Tagline Badge */}
          <Skeleton className="w-36 h-8 rounded-full bg-slate-200" />
          {/* Main Title */}
          <div className="space-y-3">
            <Skeleton className="w-5/6 h-12 rounded-xl bg-slate-200" />
            <Skeleton className="w-4/6 h-12 rounded-xl bg-slate-200" />
          </div>
          {/* Subtitle */}
          <div className="space-y-2 pt-2">
            <Skeleton className="w-full h-4 rounded bg-slate-200" />
            <Skeleton className="w-11/12 h-4 rounded bg-slate-200" />
            <Skeleton className="w-4/5 h-4 rounded bg-slate-200" />
          </div>
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 pt-4">
            <Skeleton className="w-36 h-12 rounded-xl bg-slate-300" />
            <Skeleton className="w-36 h-12 rounded-xl bg-slate-200" />
          </div>
        </div>
        {/* Right Hero Image/Mockup */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-md aspect-[4/3] rounded-2xl bg-white shadow-sm border border-slate-200 p-4 flex flex-col justify-between">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <Skeleton className="w-20 h-4 rounded bg-slate-200" />
              <div className="flex gap-2">
                <Skeleton className="w-8 h-3 rounded bg-slate-200" />
                <Skeleton className="w-8 h-3 rounded bg-slate-200" />
              </div>
            </div>
            <div className="flex-1 flex items-end justify-center py-6">
              <Skeleton className="w-5/6 h-2/3 rounded-xl bg-slate-200" />
            </div>
          </div>
        </div>
      </section>

      {/* Skeleton Brands Ticker */}
      <section className="max-w-7xl mx-auto px-6 py-6 border-y border-slate-100 flex flex-wrap items-center justify-between gap-6">
        <Skeleton className="w-28 h-6 rounded bg-slate-200" />
        <Skeleton className="w-28 h-6 rounded bg-slate-200" />
        <Skeleton className="w-28 h-6 rounded bg-slate-200" />
        <Skeleton className="w-28 h-6 rounded bg-slate-200" />
        <Skeleton className="w-28 h-6 rounded bg-slate-200" />
      </section>

      {/* Skeleton Features Section */}
      <section className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <Skeleton className="w-24 h-6 rounded-full bg-slate-200 mx-auto" />
          <Skeleton className="w-3/4 h-10 rounded-xl bg-slate-200 mx-auto" />
          <Skeleton className="w-5/6 h-4 rounded bg-slate-200 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 border border-slate-100 bg-white rounded-2xl space-y-4">
            <Skeleton className="w-12 h-12 rounded-xl bg-slate-200" />
            <Skeleton className="w-1/2 h-6 rounded bg-slate-200" />
            <Skeleton className="w-full h-4 rounded bg-slate-200" />
            <Skeleton className="w-5/6 h-4 rounded bg-slate-200" />
          </div>
          <div className="p-6 border border-slate-100 bg-white rounded-2xl space-y-4">
            <Skeleton className="w-12 h-12 rounded-xl bg-slate-200" />
            <Skeleton className="w-1/2 h-6 rounded bg-slate-200" />
            <Skeleton className="w-full h-4 rounded bg-slate-200" />
            <Skeleton className="w-5/6 h-4 rounded bg-slate-200" />
          </div>
          <div className="p-6 border border-slate-100 bg-white rounded-2xl space-y-4">
            <Skeleton className="w-12 h-12 rounded-xl bg-slate-200" />
            <Skeleton className="w-1/2 h-6 rounded bg-slate-200" />
            <Skeleton className="w-full h-4 rounded bg-slate-200" />
            <Skeleton className="w-5/6 h-4 rounded bg-slate-200" />
          </div>
        </div>
      </section>
    </div>
  );
}
