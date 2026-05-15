'use client';
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
