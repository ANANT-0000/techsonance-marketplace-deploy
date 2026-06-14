'use client';

import { useEffect, useMemo, useState } from "react";
import { Globe } from "lucide-react";
import { SEQUENCE_RESET_SELECT_TEXT } from "@/constants/vendorText";

// ─── Fiscal year data by timezone region ─────────────────────────────────────

interface FiscalOption {
  value: string;       // stored in DB
  label: string;       // shown in dropdown
  month: number;       // 1-indexed reset month
  day: number;
  countries: string;   // tooltip hint
}

const ALL_OPTIONS: FiscalOption[] = SEQUENCE_RESET_SELECT_TEXT.ALL_OPTIONS;

// Timezone prefix → likely fiscal year start month
const TZ_TO_FISCAL: Record<string, number> = {
  // April — India, UK
  "Asia/Kolkata": 4,
  "Asia/Calcutta": 4,
  "Asia/Colombo": 4,
  "Asia/Kathmandu": 4,
  "Europe/London": 4,
  "Europe/Dublin": 4,
  "Pacific/Auckland": 4,
  "America/Toronto": 4,
  "America/Vancouver": 4,
  "America/Winnipeg": 4,
  // July — Australia, Pakistan
  "Australia/Sydney": 7,
  "Australia/Melbourne": 7,
  "Australia/Brisbane": 7,
  "Australia/Perth": 7,
  "Asia/Karachi": 7,
  "Asia/Dhaka": 7,
  "Africa/Cairo": 7,
  // October — US
  "America/New_York": 10,
  "America/Chicago": 10,
  "America/Denver": 10,
  "America/Los_Angeles": 10,
  "America/Phoenix": 10,
  // January — everyone else defaults to calendar year
};

function getFiscalMonthForTimezone(tz: string): number {
  // Exact match
  if (TZ_TO_FISCAL[tz]) return TZ_TO_FISCAL[tz];
  // Prefix match  e.g. "Europe/Paris" → 1
  const prefix = tz.split("/")[0];
  if (prefix === "Europe" || prefix === "Asia" || prefix === "Africa" || prefix === "Pacific") {
    // Most of these are calendar year unless mapped above
    return 1;
  }
  return 1; // default: calendar year
}

/** Returns the next occurrence of the reset date as a human-readable string */
function getNextResetDate(option: FiscalOption): string {
  const now = new Date();
  let year = now.getFullYear();
  const resetThisYear = new Date(year, option.month - 1, option.day);
  if (now >= resetThisYear) year += 1;
  const next = new Date(year, option.month - 1, option.day);
  return next.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
}

// ─── Component ────────────────────────────────────────────────────────────────

interface SequenceResetSelectProps {
  value: string | undefined;
  onChange: (value: string) => void;
  /** react-hook-form can pass name + ref through spread; forward them */
  name?: string;
}

export function SequenceResetSelect({ value, onChange, name }: SequenceResetSelectProps) {
  const [detectedTz, setDetectedTz] = useState<string>("");
  const [detectedMonth, setDetectedMonth] = useState<number>(4); // default India
  const [autoSelected, setAutoSelected] = useState(false);

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setDetectedTz(tz);
      const month = getFiscalMonthForTimezone(tz);
      setDetectedMonth(month);

      // Only auto-select if the parent hasn't already set a real value
      if (!value || value === "") {
        const match = ALL_OPTIONS.find((o) => o.month === month);
        if (match) {
          onChange(match.value);
          setAutoSelected(true);
        }
      }
    } catch {
      // Intl not available — no-op
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedOption = useMemo(
    () => ALL_OPTIONS.find((o) => o.value === value) ?? ALL_OPTIONS[0],
    [value]
  );

  // Show recommended option first, then the rest
  const sortedOptions = useMemo(() => {
    const recommended = ALL_OPTIONS.filter((o) => o.month === detectedMonth);
    const rest = ALL_OPTIONS.filter((o) => o.month !== detectedMonth);
    return [...recommended, ...rest];
  }, [detectedMonth]);

  return (
    <div className="space-y-2">
      {/* Select */}
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={(e) => {
            setAutoSelected(false);
            onChange(e.target.value);
          }}
          className="w-full px-3 py-2 text-theme-body-sm bg-white border border-gray-200 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
                     transition-all appearance-none pr-8"
        >
          {sortedOptions.map((opt, i) => (
            <option key={opt.value} value={opt.value}>
              {i === 0 && detectedMonth === opt.month ? "★ " : ""}
              {opt.label}
            </option>
          ))}
        </select>
        {/* chevron */}
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
          ▾
        </span>
      </div>

      {/* Contextual info strip */}
      <div className="flex flex-col gap-1 px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-theme-xxs text-gray-500">
        <div className="flex items-center gap-1.5">
          <Globe size={11} className="text-gray-400 shrink-0" />
          <span>
            {SEQUENCE_RESET_SELECT_TEXT.DETECTED_TZ}{" "}
            <span className="font-semibold text-gray-700 font-mono">
              {detectedTz || SEQUENCE_RESET_SELECT_TEXT.UNKNOWN}
            </span>
            {autoSelected && (
              <span className="ml-1.5 bg-blue-50 text-blue-600 border border-blue-100
                               px-1.5 py-0.5 rounded text-theme-tiny font-semibold">
                {SEQUENCE_RESET_SELECT_TEXT.AUTO_SELECTED}
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span>
            {SEQUENCE_RESET_SELECT_TEXT.USED_BY}{" "}
            <span className="text-gray-600">{selectedOption.countries}</span>
          </span>
          <span className="shrink-0">
            {SEQUENCE_RESET_SELECT_TEXT.NEXT_RESET}{" "}
            <span className="font-semibold text-gray-700">
              {getNextResetDate(selectedOption)}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}