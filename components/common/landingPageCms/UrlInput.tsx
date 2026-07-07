import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { CMS_STRINGS } from "@/constants/landingCms.strings";

interface UrlInputProps {
  value: string;
  onChange: (value: string) => void;
  allowedDomains?: string[];
  className?: string;
  [key: string]: any;
}

export function UrlInput({ value, onChange, allowedDomains, className, ...props }: UrlInputProps) {
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const validateUrl = (val: string) => {
    if (!val) {
      setError(null);
      return;
    }

    if (val.startsWith("/") || val.startsWith("mailto:") || val.startsWith("tel:")) {
      setError(null);
      return;
    }

    const res = z.string().url().safeParse(val);
    if (!res.success) {
      setError(CMS_STRINGS.urlInvalid);
      return;
    }

    if (allowedDomains && allowedDomains.length > 0) {
      try {
        const urlObj = new URL(val);
        const host = urlObj.hostname;
        const isAllowed = allowedDomains.some((domain) => host === domain || host.endsWith("." + domain));
        if (!isAllowed) {
          setError(CMS_STRINGS.urlNotAllowed);
          return;
        }
      } catch (e) {
        setError(CMS_STRINGS.urlInvalid);
        return;
      }
    }

    setError(null);
  };

  useEffect(() => {
    if (touched) {
      validateUrl(value);
    }
  }, [value, allowedDomains, touched]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    if (touched) validateUrl(e.target.value);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(true);
    validateUrl(e.target.value);
    if (props.onBlur) props.onBlur(e);
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <Input
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`${error ? "border-destructive focus-visible:ring-destructive" : ""} ${className || ""}`}
        {...props}
      />
      {error && touched && (
        <span className="text-xs text-destructive font-medium">{error}</span>
      )}
    </div>
  );
}
