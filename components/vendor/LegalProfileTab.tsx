'use client';
import { legalSchema } from "@/utils/validation";
import { fetchCompanyLegalProfile, fetchGetCompanyLocations, upsertCompanyLegalProfile } from "@/utils/vendorApiClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Field } from "./Field";
import { Input } from "./Input";
import { Select } from "./Select";
import { COUNTRIES } from "@/constants";
import { Globe, Mail, Phone } from "lucide-react";
import { LEGAL_PROFILE_TAB_TEXT } from "@/constants/vendorText";
import { SaveButton } from "./SaveButton";

export function LegalProfileTab({ token }: { token: string }) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [companyLocations, setCompanyLocations] = useState<{ id: string; address_line_1: string }[]>([]);
  const { register, handleSubmit, setValue, formState: { errors } } =
    useForm<z.infer<typeof legalSchema>>({ resolver: zodResolver(legalSchema) });

  useEffect(() => {
    const loadData = async () => {
         const res =
    await fetchGetCompanyLocations(token)
    if(res?.data)      setCompanyLocations(res.data || []);
  
    await fetchCompanyLegalProfile(token).then((res) => {
      if (res?.data) {
        const d = res.data;
        setValue('legal_name', d.legal_name || '');
        setValue('trade_name', d.trade_name || '');
        setValue('country_code', d.country_code || 'IN');
        setValue('registered_address_id', d.registered_address_id || '');
        setValue('support_email', d.support_email || '');
        setValue('support_phone', d.support_phone || '');
        setValue('website_url', d.website_url || '');
      }
    });

    }
    loadData();
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
        <h3 className="text-theme-body-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-gray-900 rounded-full" />
          {LEGAL_PROFILE_TAB_TEXT.SECTIONS.LEGAL_ID}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={LEGAL_PROFILE_TAB_TEXT.FIELDS.LEGAL_NAME} error={errors.legal_name?.message}
            hint={LEGAL_PROFILE_TAB_TEXT.FIELDS.LEGAL_NAME_HINT}>
            <Input {...register('legal_name')} placeholder={LEGAL_PROFILE_TAB_TEXT.FIELDS.LEGAL_NAME_PH} />
          </Field>
          <Field label={LEGAL_PROFILE_TAB_TEXT.FIELDS.TRADE_NAME} error={errors.trade_name?.message}
            hint={LEGAL_PROFILE_TAB_TEXT.FIELDS.TRADE_NAME_HINT}>
            <Input {...register('trade_name')} placeholder={LEGAL_PROFILE_TAB_TEXT.FIELDS.TRADE_NAME_PH} />
          </Field>
          <Field label={LEGAL_PROFILE_TAB_TEXT.FIELDS.COUNTRY} error={errors.country_code?.message}>
            <Select {...register('country_code')}>
              {COUNTRIES.map(c => (
                <option key={c.country_code} value={c.country_code}>
                  {c.country_name} ({c.country_code})
                </option>
              ))}
            </Select>
          </Field>
          <Field label={LEGAL_PROFILE_TAB_TEXT.FIELDS.LOCATIONS} error={errors.registered_address_id?.message}>
            <Select {...register('registered_address_id')}>
              {companyLocations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.address_line_1}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </section>

      <section>
        <h3 className="text-theme-body-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-gray-900 rounded-full" />
          {LEGAL_PROFILE_TAB_TEXT.SECTIONS.CONTACT}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label={LEGAL_PROFILE_TAB_TEXT.FIELDS.EMAIL} error={errors.support_email?.message}>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
              <Input {...register('support_email')} placeholder={LEGAL_PROFILE_TAB_TEXT.FIELDS.EMAIL_PH} className="pl-8" />
            </div>
          </Field>
          <Field label={LEGAL_PROFILE_TAB_TEXT.FIELDS.PHONE} error={errors.support_phone?.message}>
            <div className="relative">
              <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
              <Input {...register('support_phone')} placeholder={LEGAL_PROFILE_TAB_TEXT.FIELDS.PHONE_PH} className="pl-8" />
            </div>
          </Field>
          <Field label={LEGAL_PROFILE_TAB_TEXT.FIELDS.WEBSITE} error={errors.website_url?.message}>
            <div className="relative">
              <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
              <Input {...register('website_url')} placeholder={LEGAL_PROFILE_TAB_TEXT.FIELDS.WEBSITE_PH} className="pl-8" />
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