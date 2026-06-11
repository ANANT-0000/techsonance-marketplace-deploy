"use client";
import { docConfigSchema } from "@/utils/validation";
import {
  fetchCompanyDocumentConfig,
  upsertCompanyDocumentConfig,
} from "@/utils/vendorApiClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Field } from "./Field";
import { Input } from "./Input";
import { Select } from "./Select";
import { Hash } from "lucide-react";
import { Textarea } from "./TextArea";
import { SaveButton } from "./SaveButton";
import { SignatureUpload } from "./SignatureUpload";
import { z } from "zod";
import { SequenceResetSelect } from "./SequenceResetSelect";
import { DOCUMENT_CONFIG_TAB_TEXT } from "@/constants/vendorText";

export function DocumentConfigTab({ token }: { token: string }) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  // Holds the existing signature URL loaded from the server
  const [existingSignatureUrl, setExistingSignatureUrl] = useState<
    string | undefined
  >(undefined);
  // Holds a newly picked File (null = user cleared it, undefined = untouched)
  const [signatureFile, setSignatureFile] = useState<File | null | undefined>(
    undefined,
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(docConfigSchema),
    defaultValues: {
      invoice_number_prefix: "INV",
      invoice_number_format: "{PREFIX}-{YYYY}-{SEQ8}",
      invoice_sequence_reset: "APRIL",
      default_currency: "INR",
      default_timezone: "Asia/Kolkata",
      date_format: "DD/MM/YYYY",
    },
  });

  useEffect(() => {
    fetchCompanyDocumentConfig(token).then((res) => {
      if (res?.data) {
        const d = res.data;
        if (d.signatory_signature_url) {
          setExistingSignatureUrl(d.signatory_signature_url);
        }
        Object.entries(d).forEach(([k, v]) => {
          if (v !== null && v !== undefined) {
            setValue(k as any, v as any);
          }
        });
      }
    });
  }, [token]);
  const prefix = watch("invoice_number_prefix");
  const format = watch("invoice_number_format");

  const previewNumber = useMemo(() => {
    const now = new Date();
    return (format || "")
      .replace("{PREFIX}", prefix || "INV")
      .replace("{YYYY}", String(now.getFullYear()))
      .replace("{YY}", String(now.getFullYear()).slice(-2)) // bonus token
      .replace("{MM}", String(now.getMonth() + 1).padStart(2, "0"))
      .replace("{DD}", String(now.getDate()).padStart(2, "0")) // bonus token
      .replace("{SEQ8}", "00000001")
      .replace("{SEQ6}", "000001")
      .toUpperCase();
  }, [prefix, format]);

  const onSubmit = (data: z.infer<typeof docConfigSchema>) => {
    startTransition(async () => {
      const payload = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== null && v !== undefined) payload.append(k, String(v));
      });

      if (signatureFile instanceof File) {
        payload.append("signatory_signature_file", signatureFile);
      } else if (signatureFile === null) {
        payload.append("signatory_signature_url", "");
      } else if (existingSignatureUrl) {
        payload.append("signatory_signature_url", existingSignatureUrl);
      }
      
      const res = await upsertCompanyDocumentConfig(payload, token);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  };

  const TIMEZONES = DOCUMENT_CONFIG_TAB_TEXT.TIMEZONES;
  const DATE_FORMATS = DOCUMENT_CONFIG_TAB_TEXT.DATE_FORMATS;
  const CURRENCIES = DOCUMENT_CONFIG_TAB_TEXT.CURRENCIES;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Invoice Numbering */}
      <section>
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-gray-900 rounded-full" />
          {DOCUMENT_CONFIG_TAB_TEXT.SECTIONS.INVOICE_NUMBERING}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label={DOCUMENT_CONFIG_TAB_TEXT.INVOICE_NUMBERING.PREFIX_LABEL}
            error={errors.invoice_number_prefix?.message}
            hint={DOCUMENT_CONFIG_TAB_TEXT.INVOICE_NUMBERING.PREFIX_HINT}
          >
            <Input
              {...register("invoice_number_prefix")}
              placeholder="INV"
              className="font-mono uppercase"
            />
          </Field>
          <Field
            label={DOCUMENT_CONFIG_TAB_TEXT.INVOICE_NUMBERING.FORMAT_LABEL}
            error={errors.invoice_number_format?.message}
            hint={DOCUMENT_CONFIG_TAB_TEXT.INVOICE_NUMBERING.FORMAT_HINT}
          >
            <Input
              {...register("invoice_number_format")}
              placeholder="{PREFIX}-{YYYY}-{SEQ8}"
              className="font-mono"
            />
          </Field>
          <Field 
            label={DOCUMENT_CONFIG_TAB_TEXT.INVOICE_NUMBERING.SEQ_RESET_LABEL} 
            hint={DOCUMENT_CONFIG_TAB_TEXT.INVOICE_NUMBERING.SEQ_RESET_HINT}
          >
            <SequenceResetSelect
              name="invoice_sequence_reset"
              value={watch("invoice_sequence_reset")}
              onChange={(val) =>
                setValue(
                  "invoice_sequence_reset",
                  val as "APRIL" | "CALENDAR",
                  { shouldDirty: true },
                )
              }
            />
          </Field>
        </div>

        {previewNumber && (
          <div className="mt-3 flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <Hash size={13} className="text-gray-400 shrink-0" />
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                {DOCUMENT_CONFIG_TAB_TEXT.INVOICE_NUMBERING.PREVIEW}
              </p>
              <code className="text-sm font-mono font-bold text-gray-800">
                {previewNumber}
              </code>
            </div>
          </div>
        )}
      </section>

      {/* Signatory Block */}
      <section>
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-gray-900 rounded-full" />
          {DOCUMENT_CONFIG_TAB_TEXT.SECTIONS.SIGNATORY}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={DOCUMENT_CONFIG_TAB_TEXT.SIGNATORY.NAME_LABEL}>
            <Input
              {...register("signatory_name")}
              placeholder={DOCUMENT_CONFIG_TAB_TEXT.SIGNATORY.NAME_PH}
            />
          </Field>
          <Field label={DOCUMENT_CONFIG_TAB_TEXT.SIGNATORY.DESIG_LABEL}>
            <Input
              {...register("signatory_designation")}
              placeholder={DOCUMENT_CONFIG_TAB_TEXT.SIGNATORY.DESIG_PH}
            />
          </Field>

          {/* Replaced: old <Input type="file" /> → new SignatureUpload */}
          <div className="sm:col-span-2">
            <Field
              label={DOCUMENT_CONFIG_TAB_TEXT.SIGNATORY.SIG_LABEL}
              hint={DOCUMENT_CONFIG_TAB_TEXT.SIGNATORY.SIG_HINT}
            >
              <SignatureUpload
                existingUrl={existingSignatureUrl}
                onChange={(file) => setSignatureFile(file)}
              />
            </Field>
          </div>
        </div>
      </section>

      {/* Footer & Terms */}
      <section>
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-gray-900 rounded-full" />
          {DOCUMENT_CONFIG_TAB_TEXT.SECTIONS.FOOTER_TERMS}
        </h3>
        <div className="space-y-4">
          <Field
            label={DOCUMENT_CONFIG_TAB_TEXT.FOOTER.TEXT_LABEL}
            hint={DOCUMENT_CONFIG_TAB_TEXT.FOOTER.TEXT_HINT}
          >
            <Input
              {...register("invoice_footer_text")}
              placeholder={DOCUMENT_CONFIG_TAB_TEXT.FOOTER.TEXT_PH}
            />
          </Field>
          <Field
            label={DOCUMENT_CONFIG_TAB_TEXT.FOOTER.TERMS_LABEL}
            hint={DOCUMENT_CONFIG_TAB_TEXT.FOOTER.TERMS_HINT}
          >
            <Textarea
              {...register("invoice_terms_and_conditions")}
              rows={4}
              placeholder={DOCUMENT_CONFIG_TAB_TEXT.FOOTER.TERMS_PH}
            />
          </Field>
        </div>
      </section>

      {/* Locale Defaults */}
      <section>
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-gray-900 rounded-full" />
          {DOCUMENT_CONFIG_TAB_TEXT.SECTIONS.LOCALE}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label={DOCUMENT_CONFIG_TAB_TEXT.LOCALE.CURRENCY_LABEL}>
            <Select {...register("default_currency")}>
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={DOCUMENT_CONFIG_TAB_TEXT.LOCALE.TZ_LABEL}>
            <Select {...register("default_timezone")}>
              {TIMEZONES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={DOCUMENT_CONFIG_TAB_TEXT.LOCALE.DATE_FORMAT_LABEL}>
            <Select {...register("date_format")}>
              {DATE_FORMATS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
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
