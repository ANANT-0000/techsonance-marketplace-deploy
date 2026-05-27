'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Palette, Building2, ShieldCheck, FileText,
 
  Pen, Globe, Phone, Mail, Link as LinkIcon,
 
} from 'lucide-react';
 
import * as z from 'zod';
import { authToken } from '@/utils/authToken';

import { BrandingTab } from '@/components/vendor/BrandingTab';
import { LegalProfileTab } from '@/components/vendor/LegalProfileTab';
import { DocumentConfigTab } from '@/components/vendor/DocumentConfigTab';


// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'branding' | 'legal' | 'documents';




 
// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'branding', label: 'Branding', icon: <Palette size={16} />, description: 'Logos, colors & typography for PDFs and emails' },
  { id: 'legal', label: 'Legal Profile', icon: <Building2 size={16} />, description: 'Legal name, trade name and contact details' },
  { id: 'documents', label: 'Documents', icon: <FileText size={16} />, description: 'Invoice numbering, signatory and terms' },
];

export default function CompanyIdentityPage() {
  const [activeTab, setActiveTab] = useState<Tab>('branding');
  const token = authToken() || '';

  return (
    <div className="w-full mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Company Identity</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure how your company appears on invoices, warranty cards and all generated documents.
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex w-full gap-1 p-1 bg-gray-100 rounded-xl mb-8 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab description */}
      <AnimatePresence mode="wait">
        {TABS.filter(t => t.id === activeTab).map(tab => (
          <motion.p
            key={tab.id}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-sm text-gray-500 mb-6 -mt-4"
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
            {activeTab === 'branding' && <BrandingTab token={token} />}
            {activeTab === 'legal' && <LegalProfileTab token={token} />}
            {activeTab === 'documents' && <DocumentConfigTab token={token} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}