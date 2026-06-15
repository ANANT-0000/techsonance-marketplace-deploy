"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Palette,
  Building2,
  ShieldCheck,
  FileText,
  Pen,
  Globe,
  Phone,
  Mail,
  Link as LinkIcon,
} from "lucide-react";

import * as z from "zod";
import { authToken } from "@/utils/authToken";

import { BrandingTab } from "@/components/vendor/BrandingTab";
import { LegalProfileTab } from "@/components/vendor/LegalProfileTab";
import { DocumentConfigTab } from "@/components/vendor/DocumentConfigTab";
import { COMPANY_IDENTITY_TEXT } from "@/constants/vendorText";

// ─── Types ────────────────────────────────────────────────────────────────────

enum Tab {
  BRANDING = "branding",
  LEGAL = "legal",
  DOCUMENTS = "documents",
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS: {
  id: Tab;
  label: string;
  icon: React.ReactNode;
  description: string;
}[] = [
  {
    id: Tab.BRANDING,
    label: COMPANY_IDENTITY_TEXT.TABS.BRANDING.LABEL,
    icon: <Palette size={16} />,
    description: COMPANY_IDENTITY_TEXT.TABS.BRANDING.DESC,
  },
  {
    id: Tab.LEGAL,
    label: COMPANY_IDENTITY_TEXT.TABS.LEGAL.LABEL,
    icon: <Building2 size={16} />,
    description: COMPANY_IDENTITY_TEXT.TABS.LEGAL.DESC,
  },
  {
    id: Tab.DOCUMENTS,
    label: COMPANY_IDENTITY_TEXT.TABS.DOCUMENTS.LABEL,
    icon: <FileText size={16} />,
    description: COMPANY_IDENTITY_TEXT.TABS.DOCUMENTS.DESC,
  },
];

export default function CompanyIdentityPage() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.BRANDING);
  const token = authToken() || "";

  return (
    <div className="w-full mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-theme-h4 font-bold text-gray-900 tracking-tight">
          {COMPANY_IDENTITY_TEXT.TITLE}
        </h1>
        <p className="text-theme-body-sm text-gray-500 mt-1">
          {COMPANY_IDENTITY_TEXT.SUBTITLE}
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex w-full gap-1 p-1 bg-gray-100 rounded-xl mb-8 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-theme-body-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab description */}
      <AnimatePresence mode="wait">
        {TABS.filter((t) => t.id === activeTab).map((tab) => (
          <motion.p
            key={tab.id}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-theme-body-sm text-gray-500 mb-6 -mt-4"
          >
            {tab.description}
          </motion.p>
        ))}
      </AnimatePresence>

      {/* Tab content */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === "branding" && <BrandingTab />}
            {activeTab === "legal" && <LegalProfileTab token={token} />}
            {activeTab === "documents" && <DocumentConfigTab token={token} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
