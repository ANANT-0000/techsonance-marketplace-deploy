'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { fetchCompanyCompliance, uploadComplianceProofDocument } from '@/utils/vendorApiClient';
import { authToken } from '@/utils/authToken';
import { COUNTRIES } from '@/constants';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

// ─── Types inferred from schema ───────────────────────────────────────────────

interface ComplianceDocument {
  id: string;
  document_type: string;
  document_url: string;
  document_status: string | null;
  created_at: string;
  updated_at: string;
  vendor_id: string | null;
  company_id: string | null;
}

interface ComplianceField {
  id: string;
  company_id: string;
  country_code: string;
  field_key: string;
  field_value: string;
  field_details: unknown;
  document_id: string | null;
  is_active: boolean;
  valid_until: string | null;
  display_name: string | null;
  rejection_reason: string | null;
  verified_by: string | null;
  created_at: string;
  updated_at: string;
  document?: ComplianceDocument | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FIELD_KEY_LABELS: Record<string, { label: string; icon: string; description: string }> = {
  gstin:         { label: 'GST Registration',  icon: 'receipt-tax',    description: 'Goods and Services Tax Identification Number — mandatory for invoicing' },
  pan:           { label: 'PAN',               icon: 'id-badge',       description: 'Permanent Account Number — issued by the Income Tax Department of India' },
  cin:           { label: 'CIN',               icon: 'building-store', description: 'Corporate Identification Number — issued by the Ministry of Corporate Affairs' },
  vat_number:    { label: 'VAT Number',        icon: 'world',          description: 'Value Added Tax registration number for applicable jurisdictions' },
  ein:           { label: 'EIN',               icon: 'id-badge-2',     description: 'Employer Identification Number — US federal tax ID' },
  kvk:           { label: 'KVK Number',        icon: 'building',       description: 'Netherlands Chamber of Commerce registration number' },
  trade_license: { label: 'Trade License',     icon: 'certificate',    description: 'Locally issued trade or business license' },
};

function getFieldMeta(key: string) {
  return COUNTRIES[key] ?? {
    label: key.replace(/_/g, ' ').toUpperCase(),
    icon: 'file-certificate',
    description: 'Regulatory compliance identifier',
  };
}

type StatusColor = 'green' | 'red' | 'amber' | 'blue' | 'gray';

function getStatusConfig(status: string | null | undefined, isActive: boolean): {
  label: string;
  color: StatusColor;
  icon: string;
} {
  if (!isActive) return { label: 'Inactive',       color: 'gray',  icon: 'circle-off' };
  switch (status?.toLowerCase()) {
    case 'verified':       return { label: 'Verified',       color: 'green', icon: 'circle-check' };
    case 'approved':       return { label: 'Approved',       color: 'green', icon: 'circle-check' };
    case 'rejected':       return { label: 'Rejected',       color: 'red',   icon: 'circle-x' };
    case 'pending_review': return { label: 'Pending review', color: 'amber', icon: 'clock' };
    case 'expired':        return { label: 'Expired',        color: 'red',   icon: 'alert-triangle' };
    default:               return { label: 'Submitted',      color: 'blue',  icon: 'circle-dot' };
  }
}

function isPdf(url: string)   { return /\.pdf(\?.*)?$/i.test(url); }
function isImage(url: string) { return /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i.test(url); }

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isExpiringSoon(validUntil: string | null) {
  if (!validUntil) return false;
  const daysLeft = Math.ceil((new Date(validUntil).getTime() - Date.now()) / 86400000);
  return daysLeft > 0 && daysLeft <= 30;
}

function isExpired(validUntil: string | null) {
  if (!validUntil) return false;
  return new Date(validUntil).getTime() < Date.now();
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────

const statusColorMap: Record<StatusColor, string> = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  red:   'bg-red-50 text-red-700 ring-red-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  blue:  'bg-blue-50 text-blue-700 ring-blue-200',
  gray:  'bg-stone-100 text-stone-500 ring-stone-200',
};

function StatusBadge({ status, isActive }: { status: string | null | undefined; isActive: boolean }) {
  const cfg = getStatusConfig(status, isActive);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${statusColorMap[cfg.color]}`}>
      <i className={`ti ti-${cfg.icon} text-[11px]`} aria-hidden="true" />
      {cfg.label}
    </span>
  );
}

// ─── DocumentPreviewModal ─────────────────────────────────────────────────────

function DocumentPreviewModal({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  const pdf   = isPdf(url);
  const image = isImage(url);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100 bg-stone-50/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center shrink-0 shadow-sm">
              <i className={`ti ti-${pdf ? 'file-type-pdf' : 'photo'} text-stone-500 text-sm`} aria-hidden="true" />
            </div>
            <span className="font-medium text-sm text-stone-800 truncate">{title}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-xs text-stone-600 bg-white hover:bg-stone-50 hover:border-stone-300 transition-all no-underline shadow-sm"
            >
              <i className="ti ti-external-link text-xs" aria-hidden="true" />
              Open
            </a>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-stone-200 text-stone-400 bg-white hover:bg-stone-50 hover:text-stone-600 transition-all shadow-sm"
              aria-label="Close preview"
            >
              <i className="ti ti-x text-sm" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Modal body */}
        <div className="flex-1 overflow-auto p-5 flex items-center justify-center min-h-[360px] bg-stone-50/40">
          {pdf ? (
            <iframe
              src={url}
              title={title}
              className="w-full rounded-xl border border-stone-200"
              style={{ height: '62vh' }}
            />
          ) : image ? (
            <img
              src={url}
              alt={title}
              className="max-w-full rounded-xl border border-stone-200 shadow-sm object-contain"
              style={{ maxHeight: '62vh' }}
            />
          ) : (
            <div className="text-center text-stone-400 space-y-3">
              <i className="ti ti-file-unknown text-4xl block" aria-hidden="true" />
              <p className="text-sm">Preview not available for this file type.</p>
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm underline">
                Download file
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ComplianceCard ───────────────────────────────────────────────────────────

function ComplianceCard({
  field,
  token,
  onUpload,
}: {
  field: ComplianceField;
  token: string;
  onUpload: (fieldId: string, file: File) => Promise<void>;
}) {
  const meta     = getFieldMeta(field.field_key);
  const doc      = field.document;
  const expiring = isExpiringSoon(field.valid_until);
  const expired  = isExpired(field.valid_until);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading]   = useState(false);
  const [dragOver, setDragOver]     = useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      await onUpload(field.id, file);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const docIcon = doc ? (isPdf(doc.document_url) ? 'file-type-pdf' : 'photo') : 'file-plus';

  return (
    <>
      {previewUrl && (
        <DocumentPreviewModal
          url={previewUrl}
          title={`${meta.label} — ${field.field_value}`}
          onClose={() => setPreviewUrl(null)}
        />
      )}

      <div className="group flex flex-col gap-4 bg-white rounded-2xl border border-stone-200 p-5 shadow-sm hover:shadow-md hover:border-stone-300 transition-all duration-200">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0">
              <i className={`ti ti-${meta.icon} text-stone-500 text-lg`} aria-hidden="true" />
            </div> */}
            <div className="min-w-0">
              <p className="font-semibold text-sm text-stone-800 truncate leading-snug">
                {field.field_key.toUpperCase().replaceAll('_', ' ')} 
              </p>
              <p className="text-xs text-stone-400 font-mono mt-0.5 tracking-wide truncate">
                {field.field_value}
              </p>
            </div>
          </div>
          <StatusBadge status={doc?.document_status} isActive={field.is_active} />
        </div>

        {/* ── Description ── */}
        {/* <p className="text-xs text-stone-500 leading-relaxed">
          {meta.description}
        </p> */}

        {/* ── Meta pills ── */}
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] text-stone-500 bg-stone-50 border border-stone-200 px-2.5 py-1 rounded-full">
            <i className="ti ti-world text-[11px]" aria-hidden="true" />
            {field.country_code}
          </span>

          {field.valid_until && (
            <span className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border ${
              expired
                ? 'text-red-600 bg-red-50 border-red-200'
                : expiring
                ? 'text-amber-600 bg-amber-50 border-amber-200'
                : 'text-stone-500 bg-stone-50 border-stone-200'
            }`}>
              <i className={`ti ti-${expired ? 'alert-circle' : expiring ? 'alert-triangle' : 'calendar'} text-[11px]`} aria-hidden="true" />
              {expired ? 'Expired' : expiring ? 'Expires soon' : 'Valid until'} {formatDate(field.valid_until)}
            </span>
          )}

          <span className="inline-flex items-center gap-1.5 text-[11px] text-stone-400 bg-stone-50 border border-stone-200 px-2.5 py-1 rounded-full">
            <i className="ti ti-clock text-[11px]" aria-hidden="true" />
            Added {formatDate(field.created_at)}
          </span>
        </div>

        {/* ── Rejection reason ── */}
        {field.rejection_reason && (
          <div className="flex gap-2.5 items-start px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-xl">
            <i className="ti ti-alert-circle text-red-500 text-base shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs text-red-700 leading-relaxed">
              <span className="font-semibold">Rejection reason: </span>
              {field.rejection_reason}
            </p>
          </div>
        )}

        {/* ── Proof document section ── */}
        <div className="border-t border-stone-100 pt-4 mt-auto">
          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-3">
            Proof document
          </p>

          {doc ? (
            <div className="flex items-center gap-3 px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-white border border-stone-200 flex items-center justify-center shrink-0 shadow-sm">
                <i className={`ti ti-${docIcon} text-stone-400 text-base`} aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-stone-700 capitalize truncate">
                  {doc.document_type.replace(/_/g, ' ')}
                </p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Uploaded {formatDate(doc.created_at)} · {isPdf(doc.document_url) ? 'PDF' : 'Image'}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setPreviewUrl(doc.document_url)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-xs text-stone-600 hover:bg-stone-50 hover:border-stone-300 transition-all shadow-sm"
                >
                  <i className="ti ti-eye text-[11px]" aria-hidden="true" />
                  Preview
                </button>
                <a
                  href={doc.document_url}
                  download
                  className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-stone-200 bg-white text-stone-500 hover:bg-stone-50 hover:border-stone-300 transition-all shadow-sm no-underline"
                  aria-label="Download document"
                >
                  <i className="ti ti-download text-[11px]" aria-hidden="true" />
                </a>
              </div>
            </div>
          ) : (
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !uploading && fileRef.current?.click()}
              className={`rounded-xl border-2 border-dashed text-center transition-all duration-150 cursor-pointer select-none ${
                uploading
                  ? 'opacity-60 cursor-wait border-stone-200 bg-stone-50'
                  : dragOver
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-stone-200 bg-stone-50 hover:border-stone-300 hover:bg-white'
              }`}
              style={{ padding: '1.1rem' }}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
              {uploading ? (
                <div className="flex items-center justify-center gap-2 text-stone-400">
                  <i className="ti ti-loader-2 animate-spin text-base" aria-hidden="true" />
                  <span className="text-xs">Uploading…</span>
                </div>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center mx-auto mb-2 shadow-sm">
                    <i className={`ti ti-upload text-stone-400 text-sm ${dragOver ? 'text-blue-500' : ''}`} aria-hidden="true" />
                  </div>
                  <p className="text-xs text-stone-500">
                    Drop file or{' '}
                    <span className="text-blue-600 font-medium">browse</span>
                  </p>
                  <p className="text-[10px] text-stone-400 mt-1">PDF, JPG, PNG, WEBP · max 10 MB</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── FilterBar ────────────────────────────────────────────────────────────────

function FilterBar({
  search, setSearch,
  statusFilter, setStatusFilter,
  countryFilter, setCountryFilter,
  countries,
}: {
  search: string;        setSearch: (v: string) => void;
  statusFilter: string;  setStatusFilter: (v: string) => void;
  countryFilter: string; setCountryFilter: (v: string) => void;
  countries: string[];
}) {
  return (
    <div className="flex flex-wrap gap-2.5 items-center">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm pointer-events-none" aria-hidden="true" />
        <input
          type="text"
          placeholder="Search by key or value…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-stone-200 rounded-xl shadow-sm placeholder-stone-400 text-stone-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
        />
      </div>

      {/* Status filter */}
      <select
        value={statusFilter}
        onChange={e => setStatusFilter(e.target.value)}
        className="px-3 py-2 text-sm bg-white border border-stone-200 rounded-xl shadow-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer"
      >
        <option value="">All statuses</option>
        <option value="verified">Verified</option>
        <option value="pending_review">Pending review</option>
        <option value="rejected">Rejected</option>
        <option value="expired">Expired</option>
        <option value="no_document">No document</option>
      </select>

      {/* Country filter */}
      {countries.length > 1 && (
        <select
          value={countryFilter}
          onChange={e => setCountryFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-white border border-stone-200 rounded-xl shadow-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer"
        >
          <option value="">All countries</option>
          {countries.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      )}
    </div>
  );
}

// ─── SummaryBanner ────────────────────────────────────────────────────────────

type StatItem = {
  label: string;
  value: number;
  icon: string;
  iconColor: string;
  iconBg: string;
};

function SummaryBanner({ fields }: { fields: ComplianceField[] }) {
  const total    = fields.length;
  const verified = fields.filter(f => ['verified', 'approved'].includes(f.document?.document_status?.toLowerCase() ?? '')).length;
  const pending  = fields.filter(f => f.document?.document_status?.toLowerCase() === 'pending_review').length;
  const noDocs   = fields.filter(f => !f.document).length;
  const expiring = fields.filter(f => isExpiringSoon(f.valid_until)).length;

  const items: StatItem[] = [
    { label: 'Total registrations', value: total,    icon: 'file-certificate', iconColor: 'text-blue-600',   iconBg: 'bg-blue-50 border-blue-100' },
    { label: 'Verified',            value: verified,  icon: 'circle-check',     iconColor: 'text-emerald-600',iconBg: 'bg-emerald-50 border-emerald-100' },
    { label: 'Pending review',      value: pending,   icon: 'clock',            iconColor: 'text-amber-600',  iconBg: 'bg-amber-50 border-amber-100' },
    { label: 'Missing documents',   value: noDocs,    icon: 'file-off',         iconColor: 'text-red-500',    iconBg: 'bg-red-50 border-red-100' },
    ...(expiring > 0
      ? [{ label: 'Expiring soon', value: expiring, icon: 'alert-triangle', iconColor: 'text-amber-600', iconBg: 'bg-amber-50 border-amber-100' }]
      : []),
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map(it => (
        <div
          key={it.label}
          className="bg-white rounded-2xl border border-stone-200 px-4 py-3.5 shadow-sm flex flex-col gap-2 hover:shadow-md transition-shadow"
        >
          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${it.iconBg}`}>
            <i className={`ti ti-${it.icon} text-sm ${it.iconColor}`} aria-hidden="true" />
          </div>
          <p className="text-2xl font-semibold text-stone-800 leading-none">{it.value}</p>
          <p className="text-[11px] text-stone-400 leading-snug">{it.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CompliancePage() {
  const [fields, setFields]               = useState<ComplianceField[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [search, setSearch]               = useState('');
  const [statusFilter, setStatusFilter]   = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const router = useRouter();
  const token = authToken();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCompanyCompliance(token!);
      setFields(Array.isArray(res?.data) ? res.data : []);
    } catch {
      setError('Failed to load compliance records.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleUpload = useCallback(async (fieldId: string, file: File) => {
    await uploadComplianceProofDocument(fieldId, file, undefined, token!);
    await load();
  }, [token, load]);

  const countries = Array.from(new Set(fields.map(f => f.country_code))).sort();

  const filtered = fields.filter(f => {
    const meta = getFieldMeta(f.field_key);
    const matchSearch = !search ||
      f.field_value.toLowerCase().includes(search.toLowerCase()) ||
      meta.label.toLowerCase().includes(search.toLowerCase()) ||
      f.field_key.toLowerCase().includes(search.toLowerCase()) ||
      (f.display_name ?? '').toLowerCase().includes(search.toLowerCase());

    const docStatus   = f.document?.document_status?.toLowerCase() ?? null;
    const matchStatus = !statusFilter ||
      (statusFilter === 'no_document' ? !f.document : docStatus === statusFilter);

    const matchCountry = !countryFilter || f.country_code === countryFilter;

    return matchSearch && matchStatus && matchCountry;
  });

  return (
    <div className="min-h-screen w-full">
      <div className="w-full  mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">

        {/* ── Page header ── */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white border border-stone-200 shadow-sm flex items-center justify-center">
              <button onClick={()=>router.back()}>

  <ChevronLeft/>
              </button>
            </div>
            <h1 className="text-xl font-semibold text-stone-800 tracking-tight">
              Compliance &amp; Documents
            </h1>
          </div>
          <p className="text-sm text-stone-500 leading-relaxed pl-[2.75rem]">
            All regulatory registrations and proof documents submitted during and after onboarding.
            Each record may have a linked certificate or proof file.
          </p>
        </div>

        {/* ── Summary banner ── */}
        {!loading && !error && fields.length > 0 && (
          <SummaryBanner fields={fields} />
        )}

        {/* ── Filter bar ── */}
        {!loading && !error && fields.length > 0 && (
          <FilterBar
            search={search}               setSearch={setSearch}
            statusFilter={statusFilter}   setStatusFilter={setStatusFilter}
            countryFilter={countryFilter} setCountryFilter={setCountryFilter}
            countries={countries}
          />
        )}

        {/* ── Content ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-stone-400">
            <i className="ti ti-loader-2 animate-spin text-2xl" aria-hidden="true" />
            <span className="text-sm">Loading compliance records…</span>
          </div>

        ) : error ? (
          <div className="flex items-start gap-3 px-4 py-3.5 bg-red-50 border border-red-200 rounded-2xl shadow-sm">
            <i className="ti ti-alert-circle text-red-500 text-lg shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-red-700">{error}</p>
              <button
                onClick={load}
                className="mt-1.5 text-xs text-red-600 underline underline-offset-2 cursor-pointer bg-transparent border-none p-0"
              >
                Try again
              </button>
            </div>
          </div>

        ) : fields.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center bg-white border border-stone-200 rounded-2xl shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center">
              <i className="ti ti-file-certificate text-stone-400 text-2xl" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-sm text-stone-700">No compliance records yet</p>
              <p className="text-xs text-stone-400 max-w-xs leading-relaxed">
                Compliance fields such as GSTIN, PAN, and CIN are added during onboarding and will appear here.
              </p>
            </div>
          </div>

        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center">
              <i className="ti ti-search text-stone-400 text-xl" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-stone-600">No records match your filters</p>
              <button
                onClick={() => { setSearch(''); setStatusFilter(''); setCountryFilter(''); }}
                className="text-xs text-blue-600 underline underline-offset-2 cursor-pointer bg-transparent border-none p-0 font-medium"
              >
                Clear all filters
              </button>
            </div>
          </div>

        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map(field => (
              <ComplianceCard
                key={field.id}
                field={field}
                token={token!}
                onUpload={handleUpload}
              />
            ))}
          </div>
        )}

        {/* ── Footer note ── */}
        {!loading && !error && fields.length > 0 && (
          <p className="text-center text-[11px] text-stone-400 leading-relaxed pb-2">
            Records marked as{' '}
            <span className="font-medium text-stone-500">Verified</span>{' '}
            have been reviewed by the platform team.
            Contact support if you believe a rejection was made in error.
          </p>
        )}

      </div>
    </div>
  );
}