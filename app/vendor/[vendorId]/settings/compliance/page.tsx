'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck, FileText, Receipt, BadgeCheck,
  X, Download, ExternalLink, Upload,
  Globe, Star, Calendar, Hash, Building2,
  AlertCircle, ImageIcon, Clock,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import { authToken } from '@/utils/authToken';
import {
  fetchCompanyCompliance,
  fetchGstRecords,
  fetchTaxProfiles,
  fetchTaxRates,
  upsertCompanyComplianceField,
} from '@/utils/vendorApiClient';
import { COUNTRIES } from '@/constants/common';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: string | null | undefined) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function isImageUrl(url: string) {
  return /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i.test(url);
}
function isPdfUrl(url: string) {
  return /\.pdf(\?.*)?$/i.test(url);
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
      active
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : 'bg-gray-100 text-gray-500 border-gray-200'
    }`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

// ─── Document Viewer Modal ────────────────────────────────────────────────────

function DocumentModal({ url, onClose }: { url: string; onClose: () => void }) {
  const isImg = isImageUrl(url);
  const isPdf = isPdfUrl(url);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.15 }}
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-700 truncate">{url.split('/').pop()}</p>
          <div className="flex items-center gap-2">
            <a
              href={url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition"
            >
              <ExternalLink size={12} /> Open
            </a>
            <a
              href={url} download
              className="flex items-center gap-1.5 text-xs font-medium text-gray-600 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
            >
              <Download size={12} /> Download
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-50">
          {isImg ? (
            <img src={url} alt="document" className="max-w-full max-h-full object-contain rounded-lg shadow" />
          ) : isPdf ? (
            <iframe src={url} className="w-full h-[600px] rounded-lg" title="PDF Viewer" />
          ) : (
            <div className="text-center text-gray-400 py-16">
              <FileText size={40} className="mx-auto mb-3 text-gray-200" />
              <p className="text-sm">Preview unavailable</p>
              <a
                href={url} target="_blank" rel="noopener noreferrer"
                className="text-blue-500 text-xs underline mt-1 block"
              >
                Open in new tab
              </a>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Proof Upload Cell ────────────────────────────────────────────────────────

function ProofUploadCell({
  existingUrl,
  fieldKey,
  countryCode,
  token,
  onUploaded,
}: {
  existingUrl?: string;
  fieldKey: string;
  countryCode: string;
  token: string;
  onUploaded: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(undefined);
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const displayUrl = preview || existingUrl;

  const handleFile = async (file: File) => {
    setUploading(true);
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    try {
      const res = await upsertCompanyComplianceField(
        {
          country_code: countryCode,
          field_key: `${fieldKey}_proof`,
          field_value: file.name,
        },
        token,
      );
      if (res?.data?.document_url) {
        onUploaded(res.data.document_url);
        URL.revokeObjectURL(localUrl);
        setPreview(res.data.document_url);
      }
    } catch (_) {
      // keep optimistic preview
    }
    setUploading(false);
  };

  if (displayUrl) {
    const isImg = isImageUrl(displayUrl);
    return (
      <>
        {viewUrl && <DocumentModal url={viewUrl} onClose={() => setViewUrl(null)} />}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewUrl(displayUrl)}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition"
          >
            {isImg ? <ImageIcon size={12} /> : <FileText size={12} />}
            View Proof
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-xs text-gray-400 hover:text-gray-600 transition underline"
          >
            Replace
          </button>
          <input
            ref={inputRef} type="file" accept="image/*,.pdf" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
        </div>
      </>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-1.5 text-xs font-medium text-gray-500 border border-dashed border-gray-300 px-3 py-1.5 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition disabled:opacity-50"
      >
        {uploading
          ? <span className="w-3 h-3 border-2 border-gray-300/50 border-t-gray-400 rounded-full animate-spin" />
          : <Upload size={12} />}
        {uploading ? 'Uploading…' : 'Upload Proof'}
      </button>
      <input
        ref={inputRef} type="file" accept="image/*,.pdf" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
    </div>
  );
}

// ─── COMPLIANCE SECTION ───────────────────────────────────────────────────────
// One card per country. Fields come from the COUNTRIES constant.
// DB values fill in saved data; unsaved = "Not provided".
// Each field gets a proof doc upload button.

function ComplianceSection({ token }: { token: string }) {
  const [savedFields, setSavedFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [proofUrls, setProofUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCompanyCompliance(token).then(res => {
      setSavedFields(res?.data ?? []);
      setLoading(false);
    });
  }, [token]);

  // Build lookup: "countryCode:fieldKey" → saved row
  const savedMap = new Map<string, any>(
    savedFields.map(f => [`${f.country_code}:${f.field_key}`, f])
  );

  // Only show countries that have at least one saved field
  const activeCountryCodes = new Set(savedFields.map((f: any) => f.country_code));
  const relevantCountries = COUNTRIES.filter(c => activeCountryCodes.has(c.country_code));

  if (loading)
    return (
      <div className="space-y-4">
        {[1, 2].map(i => <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />)}
      </div>
    );

  if (!relevantCountries.length)
    return (
      <div className="flex flex-col items-center py-16 text-gray-400">
        <ShieldCheck size={40} className="mb-3 text-gray-200" />
        <p className="text-sm font-medium">No compliance fields saved yet</p>
        <p className="text-xs mt-1">Compliance data is collected during vendor registration.</p>
      </div>
    );

  return (
    <div className="space-y-6">
      {relevantCountries.map(country => {
        const countryRows = savedFields.filter(f => f.country_code === country.country_code);
        const validUntilRow = countryRows.find(r => r.valid_until);

        return (
          <div key={country.country_code} className="border border-gray-100 rounded-2xl overflow-hidden">
            {/* Country header */}
            <div className="flex items-center gap-3 px-5 py-3.5 bg-gray-50 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                <Globe size={14} className="text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{country.country_name}</p>
                <p className="text-[11px] text-gray-400 font-medium">
                  {country.country_code} · {country.fields.length} compliance fields
                </p>
              </div>
              <div className="ml-auto">
                <StatusBadge active={true} />
              </div>
            </div>

            {/* Fields list — one row per field */}
            <div className="divide-y divide-gray-50">
              {country.fields.map(field => {
                const savedRow = savedMap.get(`${country.country_code}:${field.value}`);
                const proofRow = savedMap.get(`${country.country_code}:${field.value}_proof`);
                const savedValue = savedRow?.field_value;
                const proofUrl = proofUrls[`${country.country_code}:${field.value}`] || proofRow?.field_value;
                const hasValue = !!savedValue;

                return (
                  <div key={field.value} className="flex flex-wrap items-center gap-4 px-5 py-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                          {field.label}
                        </p>
                        {field.required && (
                          <span className="text-[9px] font-bold text-red-500 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded uppercase tracking-wide">
                            Required
                          </span>
                        )}
                      </div>
                      {hasValue ? (
                        <p className="text-sm font-semibold text-gray-900 font-mono">{savedValue}</p>
                      ) : (
                        <p className="text-sm text-gray-300 italic">Not provided</p>
                      )}
                      {field.helperText && (
                        <p className="text-[11px] text-gray-400 mt-0.5">{field.helperText}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {hasValue && <StatusBadge active={savedRow?.is_active ?? true} />}
                      {hasValue && (
                        <ProofUploadCell
                          existingUrl={proofUrl}
                          fieldKey={field.value}
                          countryCode={country.country_code}
                          token={token}
                          onUploaded={url =>
                            setProofUrls(p => ({
                              ...p,
                              [`${country.country_code}:${field.value}`]: url,
                            }))
                          }
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer: valid until */}
            {validUntilRow && (
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                <Clock size={11} />
                Valid until{' '}
                <span className="font-semibold text-gray-700">
                  {formatDate(validUntilRow.valid_until)}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── GST SECTION ─────────────────────────────────────────────────────────────
// Read-only. Groups rows from groupComplianceAsGstRegistrations into cards.
// Expand to see all fields rendered from gstFieldMeta map.

const GST_FIELD_META: Record<string, { label: string; helperText: string; isDate?: boolean }> = {
  gst_number:        { label: 'GSTIN',             helperText: 'Goods & Services Tax Identification Number' },
  state_code:        { label: 'State Code',         helperText: 'Two-digit state code under GST' },
  registration_type: { label: 'Registration Type',  helperText: 'Regular / Composition / Casual etc.' },
  registration_date: { label: 'Registration Date',  helperText: 'Date of GST enrollment', isDate: true },
  effective_from:    { label: 'Effective From',      helperText: 'Registration validity start', isDate: true },
  effective_to:      { label: 'Effective To',        helperText: 'Registration validity end', isDate: true },
};

function GstSection({ token }: { token: string }) {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetchGstRecords('', '', token).then(res => {
      setRegistrations(res?.data ?? []);
      setLoading(false);
    });
  }, [token]);

  if (loading)
    return (
      <div className="space-y-4">
        {[1, 2].map(i => <div key={i} className="h-36 bg-gray-100 rounded-2xl animate-pulse" />)}
      </div>
    );

  if (!registrations.length)
    return (
      <div className="flex flex-col items-center py-16 text-gray-400">
        <BadgeCheck size={40} className="mb-3 text-gray-200" />
        <p className="text-sm font-medium">No GST registrations found</p>
        <p className="text-xs mt-1">GST registrations are added during onboarding or from Finances → GST.</p>
      </div>
    );

  return (
    <div className="space-y-4">
      {/* Read-only notice */}
      <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
        <AlertCircle size={14} className="shrink-0 mt-0.5" />
        <p>
          <span className="font-bold">Read-only.</span> GST registrations are legal documents and cannot be modified
          here. Use{' '}
          <span className="font-semibold">Finances → GST</span> to manage registrations.
        </p>
      </div>

      {registrations.map(reg => {
        const isOpen = expanded === reg.id;

        return (
          <div key={reg.id} className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
            {/* Summary row — always visible */}
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : reg.id)}
              className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50/50 transition"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                reg.is_default ? 'bg-gray-900' : 'bg-gray-100'
              }`}>
                <BadgeCheck size={18} className={reg.is_default ? 'text-white' : 'text-gray-400'} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <code className="text-sm font-bold text-gray-900 tracking-wider">{reg.gst_number}</code>
                  {reg.is_default && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wide">
                      <Star size={9} /> Default
                    </span>
                  )}
                  <StatusBadge active={reg.is_active} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Hash size={10} /> State {reg.state_code}</span>
                  <span className="flex items-center gap-1"><Building2 size={10} /> {reg.registration_type}</span>
                  <span className="flex items-center gap-1"><Calendar size={10} /> Reg. {formatDate(reg.registration_date)}</span>
                  <span className="flex items-center gap-1"><Clock size={10} /> Valid till {formatDate(reg.effective_to)}</span>
                </div>
              </div>

              <span className="text-gray-400 shrink-0">
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </span>
            </button>

            {/* Expanded detail grid */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-gray-50 px-5 py-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Globe size={12} className="text-gray-400" />
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                        India · IN
                      </span>
                      <div className="flex-1 h-px bg-gray-100" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(GST_FIELD_META).map(([key, meta]) => {
                        const rawVal = (reg as any)[key];
                        const displayVal = meta.isDate ? formatDate(rawVal) : rawVal;
                        return (
                          <div
                            key={key}
                            className="flex flex-col gap-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl"
                          >
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                              {meta.label}
                            </p>
                            {rawVal ? (
                              <p className={`text-sm font-semibold text-gray-800 ${
                                key === 'gst_number' ? 'font-mono tracking-wider' : ''
                              }`}>
                                {displayVal}
                              </p>
                            ) : (
                              <p className="text-sm text-gray-300 italic">—</p>
                            )}
                            <p className="text-[10px] text-gray-400 mt-0.5">{meta.helperText}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ─── Tax Profiles Section ─────────────────────────────────────────────────────

function TaxProfilesSection({ token }: { token: string }) {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTaxProfiles('', undefined, token).then(res => {
      setProfiles(res?.data ?? []);
      setLoading(false);
    });
  }, [token]);

  if (loading)
    return (
      <div className="space-y-3">
        {[1, 2].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
      </div>
    );

  if (!profiles.length)
    return (
      <div className="flex flex-col items-center py-12 text-gray-400">
        <FileText size={36} className="mb-3 text-gray-200" />
        <p className="text-sm font-medium">No tax profiles configured</p>
      </div>
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {profiles.map(profile => (
        <div
          key={profile.id}
          className="border border-gray-100 rounded-2xl p-4 bg-white shadow-sm flex items-center gap-4"
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            profile.is_default ? 'bg-amber-50 border border-amber-200' : 'bg-gray-100'
          }`}>
            <FileText size={16} className={profile.is_default ? 'text-amber-600' : 'text-gray-400'} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-sm font-semibold text-gray-800">{profile.profile_type}</p>
              {profile.is_default && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Default
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400">Added {formatDate(profile.created_at)}</p>
          </div>
          <StatusBadge active={true} />
        </div>
      ))}
    </div>
  );
}

// ─── Tax Rates Section ────────────────────────────────────────────────────────

function TaxRatesSection({ token }: { token: string }) {
  const [rates, setRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTaxRates('', undefined, token).then(res => {
      const data = res?.data ?? res ?? [];
      setRates(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, [token]);

  if (loading)
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
      </div>
    );

  if (!rates.length)
    return (
      <div className="flex flex-col items-center py-12 text-gray-400">
        <Receipt size={36} className="mb-3 text-gray-200" />
        <p className="text-sm font-medium">No tax rates configured</p>
      </div>
    );

  return (
    <div className="overflow-hidden border border-gray-100 rounded-2xl">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            {['Rate Name', 'State', 'Rate %', 'Effective From', 'Effective To', 'Status'].map(h => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rates.map(rate => (
            <tr key={rate.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-4 py-3 font-semibold text-gray-800">{rate.tax_rate_name}</td>
              <td className="px-4 py-3 text-gray-600">{rate.state || '—'}</td>
              <td className="px-4 py-3">
                <span className="font-mono font-bold text-gray-900">{rate.tax_rate_value}%</span>
              </td>
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(rate.effective_from)}</td>
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(rate.effective_to)}</td>
              <td className="px-4 py-3">
                <StatusBadge active={!rate.is_exempt} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Tab Config ───────────────────────────────────────────────────────────────

type Tab = 'compliance' | 'gst' | 'tax-profiles' | 'tax-rates';

const TABS: { id: Tab; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: 'compliance',
    label: 'Compliance Fields',
    icon: <ShieldCheck size={16} />,
    description: 'Country-specific tax IDs, registration numbers and linked proof documents',
  },
  {
    id: 'gst',
    label: 'GST Registrations',
    icon: <BadgeCheck size={16} />,
    description: 'GSTIN registrations grouped by state — read-only for legal integrity',
  },
  {
    id: 'tax-profiles',
    label: 'Tax Profiles',
    icon: <FileText size={16} />,
    description: 'Tax profile types assigned to your company',
  },
  {
    id: 'tax-rates',
    label: 'Tax Rates',
    icon: <Receipt size={16} />,
    description: 'Applicable GST / tax rate slabs mapped to your products',
  },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState<Tab>('compliance');
  const token = authToken() || '';
  const activeTabMeta = TABS.find(t => t.id === activeTab)!;

  return (
    <div className="w-full mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Compliance & Taxes</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your tax registrations, compliance certificates, GST details and applicable tax rates.
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex w-full gap-1 p-1 bg-gray-100 rounded-xl mb-8 overflow-x-auto">
        {TABS.map(tab => (
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
        <motion.p
          key={activeTab}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="text-sm text-gray-500 mb-6 -mt-4"
        >
          {activeTabMeta.description}
        </motion.p>
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
            {activeTab === 'compliance'   && <ComplianceSection  token={token} />}
            {activeTab === 'gst'          && <GstSection         token={token} />}
            {activeTab === 'tax-profiles' && <TaxProfilesSection token={token} />}
            {activeTab === 'tax-rates'    && <TaxRatesSection    token={token} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}