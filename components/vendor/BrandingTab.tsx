'use client';
import { brandingSchema } from "@/utils/validation";
import { fetchCompanyBranding, upsertCompanyBranding } from "@/utils/vendorApiClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { LogoUploadField } from "./LogoUploadField";
import { ColorField } from "./ColorField";
import { Field } from "./Field";
import { Select } from "./Select";
import { SaveButton } from "./SaveButton";
import { z } from "zod";

export function BrandingTab({ token }: { token: string }) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [files, setFiles] = useState<Record<string, File>>({});

  const { register, handleSubmit, setValue, watch, formState: { errors } } =
    useForm ({
      resolver: zodResolver(brandingSchema),
      defaultValues: { primary_color: '#000000', font_family: 'Inter' },
    });

  useEffect(() => {
    fetchCompanyBranding(token).then((res) => {
      console.log(res.data)
      if (res?.data.data) {
        const d = res.data.data;
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
      const res = await upsertCompanyBranding(fd, token);
      console.log("res upsertCompanyBranding",res)
      if (res?.status === 200) {

      }
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
