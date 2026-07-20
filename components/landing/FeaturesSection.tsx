"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import type { LandingFeaturesContent } from "@/utils/Types";
import { VEDNOR_REGISTER_PATH } from "@/constants";

interface FeaturesSectionProps {
  content: LandingFeaturesContent;
}

function renderVisual(
  feature: LandingFeaturesContent["items"][number],
): ReactNode {
  if (feature.visual.type === "storefront") {
    return (
      <div className="rounded-[1.75rem] border border-landing-border bg-landing-surface p-1 shadow-xl shadow-landing-text/5 overflow-hidden">
        {/* Browser header */}
        <div className="bg-landing-background border-b border-landing-border px-4 py-3 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-400/50"></div>
          </div>
          <div className="mx-auto bg-landing-surface border border-landing-border rounded-md px-3 py-1 text-[10px] text-landing-muted w-1/2 text-center truncate">
            yourbrand.com
          </div>
        </div>
        {/* Page content */}
        <div className="p-4 bg-landing-background relative h-72">
          {/* Hero */}
          <div className="w-full h-16 bg-landing-primary-soft rounded-lg flex items-center justify-center text-landing-primary font-bold text-xs uppercase tracking-widest border border-landing-primary/20">
            SUMMER COLLECTION
          </div>
          {/* Nav */}
          <div className="flex justify-center gap-6 mt-4 text-[10px] text-landing-muted uppercase font-semibold tracking-wider">
            <span className="text-landing-text">Home</span>
            <span>Shop</span>
            <span>Deals</span>
            <span>About</span>
          </div>
          {/* Products */}
          <div className="grid grid-cols-2 gap-3 mt-5">
            <div className="bg-landing-surface border border-landing-border rounded-lg p-3 h-24 flex flex-col justify-end">
              <div className="h-2 w-1/2 bg-landing-border rounded-full mb-2"></div>
              <div className="h-2 w-1/3 bg-landing-border rounded-full"></div>
            </div>
            <div className="bg-landing-surface border border-landing-border rounded-lg p-3 h-24 flex flex-col justify-end">
              <div className="h-2 w-1/2 bg-landing-border rounded-full mb-2"></div>
              <div className="h-2 w-1/3 bg-landing-border rounded-full"></div>
            </div>
          </div>

          {/* Floating cards */}
          <div className="absolute -bottom-4 -right-2 bg-landing-surface border border-landing-border shadow-2xl rounded-xl p-3 w-40 transform rotate-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-landing-success"></div>
              <div className="text-[9px] font-bold text-landing-muted uppercase tracking-wider">
                Inventory
              </div>
            </div>
            <div className="text-sm font-bold text-landing-text">
              98% In Stock
            </div>
          </div>
          <div className="absolute -left-6 top-16 bg-landing-surface border border-landing-border shadow-2xl rounded-xl p-3 w-40 transform -rotate-3">
            <div className="text-[9px] font-bold text-landing-muted uppercase tracking-wider mb-1">
              Today's Orders
            </div>
            <div className="text-sm font-bold text-landing-text">148 Ready</div>
          </div>
        </div>
      </div>
    );
  }

  if (feature.visual.type === "inventory") {
    return (
      <div className="rounded-[1.75rem] border border-landing-border bg-landing-surface p-5 shadow-xl shadow-landing-text/5">
        <div className="flex justify-between items-center mb-4">
          <div className="font-semibold text-landing-text text-sm">
            Product Management
          </div>
          <div className="bg-landing-primary text-landing-on-primary text-[10px] font-semibold px-2.5 py-1 rounded-md">
            Add Product
          </div>
        </div>
        <div className="border border-landing-border rounded-xl overflow-hidden bg-landing-background shadow-sm">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-landing-surface border-b border-landing-border text-landing-muted uppercase tracking-wider">
              <tr>
                <th className="p-3 font-semibold">Product</th>
                <th className="p-3 font-semibold">SKU</th>
                <th className="p-3 font-semibold text-right">Stock</th>
                <th className="p-3 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-landing-border text-landing-text">
              {[
                {
                  name: "Modern Sofa",
                  sku: "SOF-001",
                  stock: "12",
                  status: "Active",
                  tone: "success",
                },
                {
                  name: "Oak Table",
                  sku: "TAB-092",
                  stock: "0",
                  status: "Empty",
                  tone: "muted",
                },
                {
                  name: "Accent Chair",
                  sku: "CHR-044",
                  stock: "48",
                  status: "Active",
                  tone: "success",
                },
                {
                  name: "Pendant Light",
                  sku: "LIG-112",
                  stock: "105",
                  status: "Active",
                  tone: "success",
                },
              ].map((row) => (
                <tr key={row.sku}>
                  <td className="p-3 font-medium">{row.name}</td>
                  <td className="p-3 text-landing-muted">{row.sku}</td>
                  <td className="p-3 font-medium text-right">{row.stock}</td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-[9px] font-semibold ${row.tone === "success" ? "bg-landing-success/10 text-landing-success border border-landing-success/20" : "bg-landing-muted/10 text-landing-muted border border-landing-border"}`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (feature.visual.type === "timeline") {
    return (
      <div className="rounded-[1.75rem] border border-landing-border bg-landing-surface p-5 shadow-xl shadow-landing-text/5 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 border border-landing-border bg-landing-background rounded-2xl p-5 relative overflow-hidden">
          <div className="font-semibold text-landing-text text-sm mb-5">
            Order #9820
          </div>
          <div className="space-y-5 relative before:absolute before:inset-y-3 before:left-[11px] before:w-px before:bg-landing-border">
            {[
              { step: "Payment Confirmed", time: "10:42 AM", done: true },
              { step: "Order Packed", time: "11:15 AM", done: true },
              { step: "Shipped", time: "02:30 PM", done: true },
              { step: "Out for Delivery", time: "Est. Tomorrow", done: false },
            ].map((s, i) => (
              <div key={i} className="flex gap-4 relative z-10">
                <div
                  className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center border-2 ${s.done ? "bg-landing-primary border-landing-primary text-white shadow-[0_0_10px_rgba(var(--primary),0.3)]" : "bg-landing-background border-landing-border"}`}
                >
                  {s.done && (
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <div>
                  <div
                    className={`text-sm font-semibold ${s.done ? "text-landing-text" : "text-landing-muted"}`}
                  >
                    {s.step}
                  </div>
                  <div className="text-[10px] text-landing-muted mt-0.5">
                    {s.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-landing-primary-soft border border-landing-primary/20 rounded-2xl p-5 flex-1 flex flex-col justify-center items-center text-center shadow-inner">
            <div className="text-[10px] font-bold text-landing-primary uppercase tracking-wider mb-2">
              Logistics
            </div>
            <div className="font-bold text-landing-text text-lg">
              Shiprocket
            </div>
            <div className="text-xs text-landing-primary mt-1">
              AWB: 9812739123
            </div>
          </div>
          <div className="bg-landing-background border border-landing-border rounded-2xl p-5 flex-1 flex flex-col justify-center items-center text-center shadow-sm">
            <div className="text-[10px] font-bold text-landing-muted uppercase tracking-wider mb-2">
              Payment
            </div>
            <div className="font-bold text-landing-text text-lg">Razorpay</div>
            <div className="text-xs font-semibold text-landing-success mt-1">
              ₹4,299 Paid
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (feature.visual.type === "marketing") {
    return (
      <div className="rounded-[1.75rem] border border-landing-border bg-landing-surface p-5 shadow-xl shadow-landing-text/5">
        <div className="font-semibold text-landing-text text-sm mb-4">
          Marketing Dashboard
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-landing-primary-soft border border-landing-primary/20 rounded-xl p-4 relative overflow-hidden">
            <div className="text-[10px] uppercase font-bold text-landing-primary tracking-wider mb-1 relative z-10">
              Active Campaign
            </div>
            <div className="text-lg font-bold text-landing-text relative z-10">
              Summer Sale
            </div>
            <div className="text-xs font-semibold text-landing-success mt-2 relative z-10">
              ↑ 24% Conversion
            </div>
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-landing-primary/10 rounded-full blur-xl"></div>
          </div>
          <div className="bg-landing-background border border-landing-border rounded-xl p-4">
            <div className="text-[10px] uppercase font-bold text-landing-muted tracking-wider mb-1">
              Coupon Code
            </div>
            <div className="text-sm font-mono font-bold text-landing-text border border-dashed border-landing-primary bg-landing-surface inline-block px-2.5 py-1 rounded mt-1">
              SUMMER20
            </div>
          </div>
        </div>
        <div className="mt-3 bg-landing-background border border-landing-border rounded-xl p-4">
          <div className="text-[10px] uppercase font-bold text-landing-muted tracking-wider mb-3">
            Campaign Revenue
          </div>
          <div className="flex h-20 items-end gap-1.5">
            {[20, 35, 25, 45, 60, 50, 80, 75, 95].map((h, i) => (
              <div
                key={i}
                className={`flex-1 rounded-t-md transition-all duration-500 hover:opacity-80 ${i === 8 ? "bg-landing-primary" : "bg-landing-primary/30"}`}
                style={{ height: `${h}%` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Fallback to analytics / default dashboard
  return (
    <div className="rounded-[1.75rem] border border-landing-border bg-landing-surface p-5 shadow-xl shadow-landing-text/5">
      <div className="flex justify-between items-center mb-5">
        <div className="font-semibold text-landing-text text-sm">
          Business Insights
        </div>
        <div className="bg-landing-background border border-landing-border rounded-md text-[10px] font-semibold text-landing-muted px-2 py-1">
          Last 30 Days
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-landing-background border border-landing-border rounded-xl p-4 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-landing-muted tracking-wider mb-1">
            Total Sales
          </div>
          <div className="text-2xl font-bold text-landing-text">₹1.24L</div>
          <div className="text-[10px] font-semibold text-landing-success mt-1">
            ↑ 12% vs last month
          </div>
        </div>
        <div className="bg-landing-background border border-landing-border rounded-xl p-4 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-landing-muted tracking-wider mb-1">
            Total Orders
          </div>
          <div className="text-2xl font-bold text-landing-text">842</div>
          <div className="text-[10px] font-semibold text-landing-success mt-1">
            ↑ 8% vs last month
          </div>
        </div>
      </div>
      <div className="bg-landing-background border border-landing-border rounded-xl p-4 shadow-sm">
        <div className="text-[10px] uppercase font-bold text-landing-muted tracking-wider mb-4">
          Top Products
        </div>
        <div className="space-y-4">
          {[
            { name: "Modern Sofa", sales: 124, fill: "85%" },
            { name: "Pendant Light", sales: 98, fill: "65%" },
            { name: "Accent Chair", sales: 74, fill: "45%" },
          ].map((p) => (
            <div key={p.name}>
              <div className="flex justify-between text-[11px] mb-1.5">
                <span className="font-semibold text-landing-text">
                  {p.name}
                </span>
                <span className="text-landing-muted">{p.sales} orders</span>
              </div>
              <div className="w-full bg-landing-surface border border-landing-border rounded-full h-2 overflow-hidden">
                <div
                  className="bg-landing-primary h-full rounded-full"
                  style={{ width: p.fill }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function FeaturesSection({ content }: FeaturesSectionProps) {
  return (
    <section
      aria-label="Features"
      id="features"
      className="bg-landing-background py-24 sm:py-28 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mx-auto mb-6 inline-flex items-center rounded-full border border-landing-border bg-landing-surface px-4 py-2"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-landing-primary">
              {content.header.label}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.05 }}
            className="text-4xl font-semibold tracking-[-0.05em] text-landing-text sm:text-5xl"
          >
            {content.header.titlePart1}
            <span className="text-landing-primary">
              {content.header.titleHighlight}
            </span>
            {content.header.titlePart2}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-landing-muted"
          >
            {content.header.subtitle}
          </motion.p>
        </div>

        <div className="mt-16 space-y-20 sm:space-y-24 lg:space-y-28">
          {content.items.map((feature, index) => {
            const isReversed = index % 2 === 1;
            return (
              <div
                key={feature.id}
                className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
                  isReversed ? "lg:[direction:rtl]" : ""
                }`}
              >
                <div className={isReversed ? "lg:[direction:ltr]" : ""}>
                  <motion.div
                    initial={{ opacity: 0, x: isReversed ? 28 : -28 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.55 }}
                  >
                    <div className="text-sm font-semibold uppercase tracking-[0.18em] text-landing-accent">
                      {feature.number}
                    </div>
                    <h3 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-landing-text sm:text-4xl">
                      {feature.title}
                    </h3>
                    <p className="mt-4 text-lg leading-8 text-landing-muted">
                      {feature.description}
                    </p>

                    <ul className="mt-8 space-y-3">
                      {feature.checklist.map((item, i) => {
                        let text = item;
                        while (
                          typeof text === "object" &&
                          text !== null &&
                          "text" in text
                        ) {
                          text = (text as any).text;
                        }
                        const key =
                          typeof item === "object" &&
                          item !== null &&
                          "id" in item
                            ? (item as any).id
                            : item;
                        return (
                          <li key={key} className="flex items-start gap-3">
                            <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-landing-primary/20 bg-landing-primary-soft text-[10px] font-bold text-landing-primary">
                              ✓
                            </span>
                            <span className="text-sm leading-6 text-landing-muted sm:text-base">
                              {text}
                            </span>
                          </li>
                        );
                      })}
                    </ul>

                    {index === 0 && (
                      <div className="mt-8 flex flex-wrap items-center gap-4">
                        <a
                          href={VEDNOR_REGISTER_PATH}
                          className="inline-flex items-center justify-center rounded-full bg-landing-primary px-5 py-2.5 text-sm font-semibold text-landing-on-primary transition-colors hover:bg-landing-primary-hover"
                        >
                          Launch Your Store
                        </a>
                        <a
                          href="#demo"
                          className="inline-flex items-center justify-center rounded-full border border-landing-border bg-landing-surface px-5 py-2.5 text-sm font-semibold text-landing-text transition-colors hover:border-landing-primary hover:bg-landing-primary-soft hover:text-landing-primary"
                        >
                          View Demo Store
                        </a>
                      </div>
                    )}
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: 0.12 }}
                >
                  {renderVisual(feature)}
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
