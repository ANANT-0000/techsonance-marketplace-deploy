'use client';
import { COLOR_BLACK } from "@/constants";
import { Field } from "./Field";
import { Input } from "./Input";

export function ColorField({ label, value, onChange, error }: {
  label: string; value: string; onChange: (v: string) => void; error?: string;
}) {
  return (
    <Field label={label} error={error}>
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="color"
            value={value || COLOR_BLACK}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 w-10 h-10 cursor-pointer"
          />
          <div
            className="w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer shadow-sm"
            style={{ backgroundColor: value || COLOR_BLACK }}
          />
        </div>
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={COLOR_BLACK}
          maxLength={7}
          className="font-mono uppercase w-32"
        />
      </div>
    </Field>
  );
}
