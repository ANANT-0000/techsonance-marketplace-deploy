"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Info, ShieldCheck } from "lucide-react";
import { COMPLIANCE_REGEX } from "@/app/auth/vendorRegister/page";
import { FINANCIAL_COMPLIANCE_TEXT } from "@/constants/vendorText";

export interface ComplianceField {
  value: string;
  label: string;
  placeholder: string;
  required: boolean;
  helperText?: string;
}

interface FinancialComplianceProps {
  country_code: string;
  fields: ComplianceField[];
  // Controlled: parent owns the values map { field_key: field_value }
  values: Record<string, string>;
  onChange: (key: string, val: string) => void;
  // External errors pushed from step-level validation
  externalErrors?: Record<string, string>;
}

function getValidationState(
  fieldKey: string,
  value: string,
  required: boolean,
): "idle" | "valid" | "invalid" | "empty-required" {
  const trimmed = value.trim();
  if (!trimmed) return required ? "empty-required" : "idle";
  const rule = COMPLIANCE_REGEX[fieldKey];
  if (!rule) return "valid"; // no regex = free text (e.g. DPO name basic)
  return rule.pattern.test(trimmed) ? "valid" : "invalid";
}

export default function FinancialCompliance({
  country_code,
  fields,
  values,
  onChange,
  externalErrors = {},
}: FinancialComplianceProps) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Reset touched state when country changes
  useEffect(() => {
    setTouched({});
  }, [country_code]);

  if (!country_code || fields.length === 0) {
    return (
      <div className="mt-4 flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-400 text-theme-body-sm">
        <Info size={16} className="shrink-0" />
        {FINANCIAL_COMPLIANCE_TEXT.EMPTY_STATE}
      </div>
    );
  }

  const requiredCount = fields.filter((f) => f.required).length;

  return (
    <div className="mt-5 space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck size={17} className="text-blue-500" />
          <h3 className="font-semibold text-gray-800 text-theme-body-sm">
            {FINANCIAL_COMPLIANCE_TEXT.HEADER}
          </h3>
        </div>
        <span className="text-theme-caption bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-1 rounded-full font-medium">
          {requiredCount} {FINANCIAL_COMPLIANCE_TEXT.REQUIRED_COUNT}
        </span>
      </div>

      <div className="space-y-3">
        {fields.map((field) => {
          const val = values[field.value] ?? "";
          const isTouched = touched[field.value];
          const extError = externalErrors[field.value];
          const state = getValidationState(field.value, val, field.required);
          const rule = COMPLIANCE_REGEX[field.value];

          // Show error if: externally pushed OR (touched and not valid)
          const showError =
            extError ||
            (isTouched && state === "invalid") ||
            (isTouched && state === "empty-required");

          const errorMsg =
            extError ||
            (state === "empty-required"
              ? `${field.label} ${FINANCIAL_COMPLIANCE_TEXT.FIELD_REQUIRED}`
              : rule?.message ?? "");

          return (
            <div key={field.value} className="group">
              <label className="flex items-center gap-1.5 text-theme-caption font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                {field.label}
                {field.required && (
                  <span className="text-red-500 text-theme-body-sm leading-none">*</span>
                )}
                {!field.required && (
                  <span className="text-theme-tiny text-gray-400 font-normal normal-case tracking-normal ml-1 bg-gray-100 px-1.5 py-0.5 rounded">
                    {FINANCIAL_COMPLIANCE_TEXT.OPTIONAL}
                  </span>
                )}
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={val}
                  placeholder={field.placeholder}
                  onChange={(e) => {
                    onChange(field.value, e.target.value.toUpperCase());
                  }}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, [field.value]: true }))
                  }
                  className={[
                    "w-full px-4 py-2.5 pr-10 rounded-xl border text-theme-body-sm font-mono transition-all outline-none",
                    "bg-white placeholder:font-sans placeholder:text-gray-400",
                    showError
                      ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                      : isTouched && state === "valid"
                        ? "border-emerald-300 bg-emerald-50/30 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                        : "border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100",
                  ].join(" ")}
                />

                {/* Inline status icon */}
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  {isTouched && state === "valid" && (
                    <CheckCircle2 size={16} className="text-emerald-500" />
                  )}
                  {showError && (
                    <AlertCircle size={16} className="text-red-400" />
                  )}
                </span>
              </div>

              {/* Error message */}
              {showError && (
                <p className="mt-1.5 text-theme-caption text-red-600 flex items-start gap-1">
                  <AlertCircle size={12} className="mt-0.5 shrink-0" />
                  {errorMsg}
                </p>
              )}

              {/* Helper text (shown when not erroring) */}
              {!showError && field.helperText && (
                <p className="mt-1.5 text-theme-caption text-gray-400 flex items-start gap-1">
                  <Info size={11} className="mt-0.5 shrink-0 text-gray-400" />
                  {field.helperText}
                </p>
              )}

              {/* Format hint when typing (not yet touched) */}
              {!isTouched && rule && val.length > 0 && (
                <p className="mt-1 text-theme-caption text-blue-500">
                  {FINANCIAL_COMPLIANCE_TEXT.FORMAT_HINT}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}