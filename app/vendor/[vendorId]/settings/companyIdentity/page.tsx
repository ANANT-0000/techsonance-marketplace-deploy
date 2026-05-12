'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Palette, Building2, ShieldCheck, FileText,
  Upload, Check, AlertCircle, Loader2, Plus,
  Trash2, Eye, EyeOff, ChevronDown, RefreshCw,
  Pen, Globe, Phone, Mail, Link as LinkIcon,
  Hash, Calendar, Type, AlignLeft,
} from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authToken } from '@/utils/authToken';
import {
  fetchCompanyBranding, upsertCompanyBranding,
  fetchCompanyLegalProfile, upsertCompanyLegalProfile,
  fetchCompanyCompliance, upsertCompanyComplianceField, deleteCompanyComplianceField,
  fetchCompanyDocumentConfig, upsertCompanyDocumentConfig,
} from '@/utils/vendorApiClient';
import { COUNTRIES } from '@/constants/common';


// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'branding' | 'legal' | 'compliance' | 'documents';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const brandingSchema = z.object({
  logo_url: z.string().optional(),
  logo_dark_url: z.string().optional(),
  watermark_url: z.string().optional(),
  favicon_url: z.string().optional(),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color').default('#000000'),
  secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color').optional().or(z.literal('')),
  accent_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color').optional().or(z.literal('')),
  font_family: z.string().min(1, 'Required').default('Inter'),
});

const legalSchema = z.object({
  legal_name: z.string().min(2, 'Required'),
  trade_name: z.string().optional(),
  country_code: z.string().length(2, 'Must be 2-letter ISO code'),
  support_email: z.string().email('Invalid email').optional().or(z.literal('')),
  support_phone: z.string().optional(),
  website_url: z.string().url('Invalid URL').optional().or(z.literal('')),
});

const docConfigSchema = z.object({
  invoice_number_prefix: z.string().min(1).max(10).default('INV'),
  invoice_number_format: z.string().min(1).default('{PREFIX}-{YYYY}-{SEQ8}'),
  invoice_sequence_reset: z.enum(['APRIL', 'CALENDAR']).default('APRIL'),
  default_currency: z.string().length(3).default('INR'),
  default_timezone: z.string().min(1).default('Asia/Kolkata'),
  date_format: z.string().min(1).default('DD/MM/YYYY'),
  signatory_name: z.string().optional(),
  signatory_designation: z.string().optional(),
  signatory_signature_url: z.string().optional(),
  invoice_footer_text: z.string().optional(),
  invoice_terms_and_conditions: z.string().optional(),
});

// ─── Reusable field components ────────────────────────────────────────────────

function Field({ label, error, children, hint }: {
  label: string; error?: string; children: React.ReactNode; hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{error}</p>}
    </div>
  );
}

function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all placeholder-gray-300 ${className}`}
      {...props}
    />
  );
}

function Textarea({ className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all placeholder-gray-300 resize-none ${className}`}
      {...props}
    />
  );
}

function Select({ className = '', children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <select
      className={`w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

function SaveButton({ isPending, saved }: { isPending: boolean; saved: boolean }) {
  return (
    <motion.button
      type="submit"
      disabled={isPending}
      whileTap={{ scale: 0.97 }}
      className="flex items-center gap-2 px-5 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
    >
      {isPending ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : null}
      {isPending ? 'Saving…' : saved ? 'Saved' : 'Save Changes'}
    </motion.button>
  );
}

// ─── Color Picker ─────────────────────────────────────────────────────────────

function ColorField({ label, value, onChange, error }: {
  label: string; value: string; onChange: (v: string) => void; error?: string;
}) {
  return (
    <Field label={label} error={error}>
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="color"
            value={value || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 w-10 h-10 cursor-pointer"
          />
          <div
            className="w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer shadow-sm"
            style={{ backgroundColor: value || '#000000' }}
          />
        </div>
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          maxLength={7}
          className="font-mono uppercase w-32"
        />
      </div>
    </Field>
  );
}

// ─── Logo Upload Field ────────────────────────────────────────────────────────

function LogoUploadField({ label, value, fieldName, onFileSelect, hint }: {
  label: string; value?: string; fieldName: string;
  onFileSelect: (name: string, file: File) => void; hint: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>(value || '');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onFileSelect(fieldName, file);
  };

  return (
    <Field label={label} hint={hint}>
      <div
        onClick={() => ref.current?.click()}
        className="relative flex flex-col items-center justify-center gap-2 h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all group"
      >
        {preview ? (
          <>
            <img src={preview} alt={label} className="h-16 object-contain" />
            <span className="text-xs text-gray-400 group-hover:text-gray-600">Click to replace</span>
          </>
        ) : (
          <>
            <Upload size={20} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
            <span className="text-xs text-gray-400">Upload image</span>
          </>
        )}
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
    </Field>
  );
}

// ─── Tab: Branding ────────────────────────────────────────────────────────────

function BrandingTab({ token }: { token: string }) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [files, setFiles] = useState<Record<string, File>>({});

  const { register, handleSubmit, setValue, watch, formState: { errors } } =
    useForm<z.infer<typeof brandingSchema>>({
      resolver: zodResolver(brandingSchema),
      defaultValues: { primary_color: '#000000', font_family: 'Inter' },
    });

  useEffect(() => {
    fetchCompanyBranding(token).then((res) => {
      if (res?.data) {
        const d = res.data;
        setValue('primary_color', d.primary_color || '#000000');
        setValue('secondary_color', d.secondary_color || '');
        setValue('accent_color', d.accent_color || '');
        setValue('font_family', d.font_family || 'Inter');
        setValue('logo_url', d.logo_url || '');
        setValue('logo_dark_url', d.logo_dark_url || '');
        setValue('watermark_url', d.watermark_url || '');
        setValue('favicon_url', d.favicon_url || '');
      }
    });
  }, [token]);

  const onSubmit = (data: z.infer<typeof brandingSchema>) => {
    startTransition(async () => {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => v && fd.append(k, v as string));
      Object.entries(files).forEach(([k, v]) => fd.append(k, v));
      await upsertCompanyBranding(fd, token);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  };

  const primaryColor = watch('primary_color');
  const secondaryColor = watch('secondary_color');
  const accentColor = watch('accent_color');

  const FONT_OPTIONS = [
    'Inter', 'Plus Jakarta Sans', 'DM Sans', 'Outfit', 'Nunito',
    'Poppins', 'Raleway', 'Lato', 'Source Sans Pro', 'IBM Plex Sans',
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Logo uploads */}
      <section>
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-gray-900 rounded-full" />
          Logos & Images
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <LogoUploadField
            label="Primary Logo"
            fieldName="logo"
            value={watch('logo_url')}
            onFileSelect={(name, file) => setFiles(prev => ({ ...prev, [name]: file }))}
            hint="Used in invoice headers and emails"
          />
          <LogoUploadField
            label="Dark Variant"
            fieldName="logo_dark"
            value={watch('logo_dark_url')}
            onFileSelect={(name, file) => setFiles(prev => ({ ...prev, [name]: file }))}
            hint="For dark backgrounds in PDFs"
          />
          <LogoUploadField
            label="Watermark"
            fieldName="watermark"
            value={watch('watermark_url')}
            onFileSelect={(name, file) => setFiles(prev => ({ ...prev, [name]: file }))}
            hint="Faint background stamp on invoices"
          />
          <LogoUploadField
            label="Favicon"
            fieldName="favicon"
            value={watch('favicon_url')}
            onFileSelect={(name, file) => setFiles(prev => ({ ...prev, [name]: file }))}
            hint="Used in transactional emails"
          />
        </div>
      </section>

      {/* Color palette */}
      <section>
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-gray-900 rounded-full" />
          Brand Palette
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ColorField
            label="Primary Color"
            value={primaryColor || ''}
            onChange={(v) => setValue('primary_color', v)}
            error={errors.primary_color?.message}
          />
          <ColorField
            label="Secondary Color"
            value={secondaryColor || ''}
            onChange={(v) => setValue('secondary_color', v)}
            error={errors.secondary_color?.message}
          />
          <ColorField
            label="Accent Color"
            value={accentColor || ''}
            onChange={(v) => setValue('accent_color', v)}
            error={errors.accent_color?.message}
          />
        </div>

        {/* Live preview swatch */}
        {(primaryColor || secondaryColor || accentColor) && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <span className="text-xs text-gray-500 font-medium">Preview</span>
            <div className="flex gap-2">
              {primaryColor && (
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-lg shadow-sm border border-white/50" style={{ backgroundColor: primaryColor }} />
                  <span className="text-[10px] font-mono text-gray-400">Primary</span>
                </div>
              )}
              {secondaryColor && (
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-lg shadow-sm border border-white/50" style={{ backgroundColor: secondaryColor }} />
                  <span className="text-[10px] font-mono text-gray-400">Secondary</span>
                </div>
              )}
              {accentColor && (
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-lg shadow-sm border border-white/50" style={{ backgroundColor: accentColor }} />
                  <span className="text-[10px] font-mono text-gray-400">Accent</span>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Typography */}
      <section>
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-gray-900 rounded-full" />
          Typography
        </h3>
        <Field label="PDF Font Family" hint="Must be available in your PDF renderer (Puppeteer/PDFKit)">
          <Select {...register('font_family')}>
            {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
          </Select>
        </Field>
      </section>

      <div className="flex justify-end pt-2 border-t border-gray-100">
        <SaveButton isPending={isPending} saved={saved} />
      </div>
    </form>
  );
}

// ─── Tab: Legal Profile ───────────────────────────────────────────────────────

function LegalProfileTab({ token }: { token: string }) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } =
    useForm<z.infer<typeof legalSchema>>({ resolver: zodResolver(legalSchema) });

  useEffect(() => {
    fetchCompanyLegalProfile(token).then((res) => {
      if (res?.data) {
        const d = res.data;
        setValue('legal_name', d.legal_name || '');
        setValue('trade_name', d.trade_name || '');
        setValue('country_code', d.country_code || 'IN');
        setValue('support_email', d.support_email || '');
        setValue('support_phone', d.support_phone || '');
        setValue('website_url', d.website_url || '');
      }
    });
  }, [token]);

  const onSubmit = (data: z.infer<typeof legalSchema>) => {
    startTransition(async () => {
      await upsertCompanyLegalProfile(data, token);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-8">
      <section>
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-gray-900 rounded-full" />
          Legal Identity
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Legal Name *" error={errors.legal_name?.message}
            hint="Must match your tax registration documents exactly">
            <Input {...register('legal_name')} placeholder="ACME PRIVATE LIMITED" />
          </Field>
          <Field label="Trade / Brand Name" error={errors.trade_name?.message}
            hint="The name customers see (can differ from legal name)">
            <Input {...register('trade_name')} placeholder="Acme Store" />
          </Field>
          <Field label="Country of Incorporation *" error={errors.country_code?.message}>
            <Select {...register('country_code')}>
              {COUNTRIES.map(c => (
                <option key={c.country_code} value={c.country_code}>
                  {c.country_name} ({c.country_code})
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-gray-900 rounded-full" />
          Contact Printed on Document Footer
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Support Email" error={errors.support_email?.message}>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
              <Input {...register('support_email')} placeholder="support@example.com" className="pl-8" />
            </div>
          </Field>
          <Field label="Support Phone" error={errors.support_phone?.message}>
            <div className="relative">
              <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
              <Input {...register('support_phone')} placeholder="+91 98765 43210" className="pl-8" />
            </div>
          </Field>
          <Field label="Website URL" error={errors.website_url?.message}>
            <div className="relative">
              <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
              <Input {...register('website_url')} placeholder="https://example.com" className="pl-8" />
            </div>
          </Field>
        </div>
      </section>

      <div className="flex justify-end pt-2 border-t border-gray-100">
        <SaveButton isPending={isPending} saved={saved} />
      </div>
    </form>
  );
}

// ─── Tab: Compliance ──────────────────────────────────────────────────────────

function ComplianceTab({ token }: { token: string }) {
  const [records, setRecords] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('IN');
  const [addingField, setAddingField] = useState<{ key: string; label: string; placeholder: string } | null>(null);
  const [fieldValue, setFieldValue] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadRecords = () => {
    fetchCompanyCompliance(token).then((res) => setRecords(res?.data || []));
  };

  useEffect(() => { loadRecords(); }, [token]);

  const countryFields = COUNTRIES.find(c => c.country_code === selectedCountry)?.fields || [];
  const existingByKey = records.reduce((acc, r) => {
    acc[`${r.country_code}__${r.field_key}`] = r;
    return acc;
  }, {} as Record<string, any>);

  const handleSave = () => {
    if (!addingField || !fieldValue.trim()) return;
    startTransition(async () => {
      await upsertCompanyComplianceField({
        country_code: selectedCountry,
        field_key: addingField.key,
        field_value: fieldValue.trim(),
        is_active: true,
        valid_until: validUntil || null,
      }, token);
      setAddingField(null);
      setFieldValue('');
      setValidUntil('');
      loadRecords();
    });
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    startTransition(async () => {
      await deleteCompanyComplianceField(id, token);
      setDeletingId(null);
      loadRecords();
    });
  };

  return (
    <div className="space-y-6">
      {/* Country selector */}
      <section>
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-gray-900 rounded-full" />
          Country Registration Fields
        </h3>
        <Field label="Select Country">
          <Select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} className="max-w-xs">
            {COUNTRIES.map(c => (
              <option key={c.country_code} value={c.country_code}>
                {c.country_name} ({c.country_code})
              </option>
            ))}
          </Select>
        </Field>
      </section>

      {/* Fields for selected country */}
      {countryFields.length > 0 ? (
        <div className="space-y-3">
          {countryFields.map((field) => {
            const existing = existingByKey[`${selectedCountry}__${field.value}`];
            const isEditing = addingField?.key === field.value;

            return (
              <div
                key={field.value}
                className={`p-4 rounded-xl border transition-all ${existing ? 'bg-white border-gray-200' : 'bg-gray-50 border-dashed border-gray-200'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-800">{field.label}</span>
                      {field.required && <span className="text-[10px] font-bold text-red-500 px-1.5 py-0.5 bg-red-50 rounded-full">Required</span>}
                      {existing?.is_active === false && (
                        <span className="text-[10px] font-bold text-amber-600 px-1.5 py-0.5 bg-amber-50 rounded-full">Inactive</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{field.helperText}</p>
                    {existing && !isEditing && (
                      <div className="mt-2 flex items-center gap-2">
                        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-800">{existing.field_value}</code>
                        {existing.valid_until && (
                          <span className="text-xs text-gray-400">Valid until {existing.valid_until}</span>
                        )}
                      </div>
                    )}

                    {/* Inline edit form */}
                    {isEditing && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 flex flex-col gap-2"
                      >
                        <Input
                          value={fieldValue}
                          onChange={(e) => setFieldValue(e.target.value)}
                          placeholder={field.placeholder}
                          autoFocus
                          className="font-mono max-w-sm"
                        />
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-500">Valid until (optional)</label>
                          <input
                            type="date"
                            value={validUntil}
                            onChange={(e) => setValidUntil(e.target.value)}
                            className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none"
                          />
                        </div>
                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={handleSave}
                            disabled={isPending || !fieldValue.trim()}
                            className="flex items-center gap-1 text-xs px-3 py-1.5 bg-gray-900 text-white rounded-lg disabled:opacity-40"
                          >
                            {isPending ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                            Save
                          </button>
                          <button
                            onClick={() => { setAddingField(null); setFieldValue(''); }}
                            className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setAddingField({ key: field.value, label: field.label, placeholder: field.placeholder });
                        setFieldValue(existing?.field_value || '');
                      }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                      title={existing ? 'Edit' : 'Add'}
                    >
                      {existing ? <Pen size={14} /> : <Plus size={14} />}
                    </button>
                    {existing && (
                      <button
                        onClick={() => handleDelete(existing.id)}
                        disabled={deletingId === existing.id}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors disabled:opacity-40"
                        title="Delete"
                      >
                        {deletingId === existing.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-10 text-center text-gray-400 text-sm">
          No compliance fields defined for {selectedCountry}
        </div>
      )}
    </div>
  );
}

// ─── Tab: Document Config ─────────────────────────────────────────────────────

function DocumentConfigTab({ token }: { token: string }) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [previewNumber, setPreviewNumber] = useState('');

  const { register, handleSubmit, watch, setValue, formState: { errors } } =
    useForm<z.infer<typeof docConfigSchema>>({
      resolver: zodResolver(docConfigSchema),
      defaultValues: {
        invoice_number_prefix: 'INV',
        invoice_number_format: '{PREFIX}-{YYYY}-{SEQ8}',
        invoice_sequence_reset: 'APRIL',
        default_currency: 'INR',
        default_timezone: 'Asia/Kolkata',
        date_format: 'DD/MM/YYYY',
      },
    });

  useEffect(() => {
    fetchCompanyDocumentConfig(token).then((res) => {
      if (res?.data) {
        const d = res.data;
        Object.entries(d).forEach(([k, v]) => {
          if (v !== null && v !== undefined) setValue(k as any, v as any);
        });
      }
    });
  }, [token]);

  // Live invoice number preview
  const prefix = watch('invoice_number_prefix');
  const format = watch('invoice_number_format');
  useEffect(() => {
    const now = new Date();
    const preview = (format || '')
      .replace('{PREFIX}', prefix || 'INV')
      .replace('{YYYY}', String(now.getFullYear()))
      .replace('{MM}', String(now.getMonth() + 1).padStart(2, '0'))
      .replace('{SEQ8}', '00000001')
      .replace('{SEQ6}', '000001');
    setPreviewNumber(preview);
  }, [prefix, format]);

  const onSubmit = (data: z.infer<typeof docConfigSchema>) => {
    startTransition(async () => {
      await upsertCompanyDocumentConfig(data, token);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  };

  const TIMEZONES = ['Asia/Kolkata', 'UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Dubai', 'Asia/Singapore'];
  const DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY'];
  const CURRENCIES = ['INR', 'USD', 'GBP', 'EUR', 'AED', 'SGD'];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Invoice Numbering */}
      <section>
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-gray-900 rounded-full" />
          Invoice Numbering
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Prefix" error={errors.invoice_number_prefix?.message}
            hint="e.g. INV, TAX-INV, SINV">
            <Input {...register('invoice_number_prefix')} placeholder="INV" className="font-mono uppercase" />
          </Field>
          <Field label="Format String" error={errors.invoice_number_format?.message}
            hint="Tokens: {PREFIX} {YYYY} {MM} {SEQ8} {SEQ6}">
            <Input {...register('invoice_number_format')} placeholder="{PREFIX}-{YYYY}-{SEQ8}" className="font-mono" />
          </Field>
          <Field label="Sequence Reset">
            <Select {...register('invoice_sequence_reset')}>
              <option value="APRIL">Indian Financial Year (April 1)</option>
              <option value="CALENDAR">Calendar Year (January 1)</option>
            </Select>
          </Field>
        </div>

        {/* Live preview */}
        {previewNumber && (
          <div className="mt-3 flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <Hash size={13} className="text-gray-400 shrink-0" />
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Preview</p>
              <code className="text-sm font-mono font-bold text-gray-800">{previewNumber}</code>
            </div>
          </div>
        )}
      </section>

      {/* Signatory Block */}
      <section>
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-gray-900 rounded-full" />
          Authorized Signatory
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Signatory Name">
            <Input {...register('signatory_name')} placeholder="e.g. Rahul Sharma" />
          </Field>
          <Field label="Designation">
            <Input {...register('signatory_designation')} placeholder="e.g. Managing Director" />
          </Field>
          <Field label="Signature Image URL" hint="PNG with transparent background, hosted on S3/CDN">
            <div className="relative">
              <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
              <Input {...register('signatory_signature_url')} placeholder="https://cdn.example.com/sig.png" className="pl-8" />
            </div>
          </Field>
        </div>
      </section>

      {/* Footer & Terms */}
      <section>
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-gray-900 rounded-full" />
          Invoice Footer & Terms
        </h3>
        <div className="space-y-4">
          <Field label="Footer Text" hint="Printed at the bottom of every invoice page">
            <Input {...register('invoice_footer_text')}
              placeholder="Thank you for shopping with us. All disputes subject to Surat jurisdiction." />
          </Field>
          <Field label="Terms & Conditions" hint="Printed on last page or as a section">
            <Textarea {...register('invoice_terms_and_conditions')} rows={4}
              placeholder="1. All sales are final unless otherwise specified…" />
          </Field>
        </div>
      </section>

      {/* Locale Defaults */}
      <section>
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-gray-900 rounded-full" />
          Output Locale
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Default Currency">
            <Select {...register('default_currency')}>
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </Field>
          <Field label="Timezone">
            <Select {...register('default_timezone')}>
              {TIMEZONES.map(t => <option key={t} value={t}>{t}</option>)}
            </Select>
          </Field>
          <Field label="Date Format">
            <Select {...register('date_format')}>
              {DATE_FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
            </Select>
          </Field>
        </div>
      </section>

      <div className="flex justify-end pt-2 border-t border-gray-100">
        <SaveButton isPending={isPending} saved={saved} />
      </div>
    </form>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'branding', label: 'Branding', icon: <Palette size={16} />, description: 'Logos, colors & typography for PDFs and emails' },
  { id: 'legal', label: 'Legal Profile', icon: <Building2 size={16} />, description: 'Legal name, trade name and contact details' },
  { id: 'compliance', label: 'Compliance', icon: <ShieldCheck size={16} />, description: 'Country-specific tax IDs (GSTIN, PAN, EIN…)' },
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
            {activeTab === 'compliance' && <ComplianceTab token={token} />}
            {activeTab === 'documents' && <DocumentConfigTab token={token} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}