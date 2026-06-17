import { UILabels } from "@/constants/ui-labels";
import { CmsSection } from "./Section";
import { InputField } from "./InputField";
import React from "react";
import { ImageUploadField } from "./ImageUploadField";
import { toDatetimeLocal } from "@/lib/utils";
import { ColorField } from "./ColorField";

export const CmsStoreTab = ({
  data,
  set,
  makeAutoSave,
}: {
  data: any;
  set: (key: string, value: any) => void;
  makeAutoSave: (key: string) => (newUrl: string) => Promise<void>;
}) => {
  return (
    <>
      <CmsSection title={UILabels.SECTIONS.STORE_PAGE_PROMOTIONAL_BANNER}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label={UILabels.FIELDS.BANNER_TITLE}
            value={data.promo_banner_title || ""}
            onChange={(v: string) => set("promo_banner_title", v)}
          />
          <InputField
            label={UILabels.FIELDS.BANNER_ACTION_LINK_URL}
            value={data.promo_banner_link || ""}
            onChange={(v: string) => set("promo_banner_link", v)}
            mono
          />
          <div className="md:col-span-2">
            <InputField
              label={UILabels.FIELDS.BANNER_DESCRIPTION}
              value={data.promo_banner_desc || ""}
              onChange={(v: string) => set("promo_banner_desc", v)}
              textarea
            />
          </div>
          <div className="md:col-span-2">
            <ImageUploadField
              label={UILabels.FIELDS.PROMO_CARD_BACKGROUND_IMAGE}
              value={data.promo_banner_image_url || ""}
              onChange={(v: string) => set("promo_banner_image_url", v)}
              onAutoSave={makeAutoSave("promo_banner_image_url")}
            />
          </div>
        </div>
      </CmsSection>
      <CmsSection title={UILabels.SECTIONS.URGENT_PROMO__COUNTDOWN_TIMER}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label={UILabels.FIELDS.TIMER_HEADING_TITLE}
            value={data.promo_timer_title || ""}
            onChange={(v: string) => set("promo_timer_title", v)}
            placeholder="e.g. FLASH SALE ENDS IN"
          />

          <InputField
            label={UILabels.FIELDS.EXPIRATION_DATE__TIME}
            value={toDatetimeLocal(data.promo_expires_at || "")}
            onChange={(v: string) => set("promo_expires_at", v)}
            type="datetime-local"
          />

          <InputField
            label={UILabels.FIELDS.ACTION_BUTTON_TEXT}
            value={data.promo_btn_text || ""}
            onChange={(v: string) => set("promo_btn_text", v)}
            placeholder="e.g. Shop the Sale"
          />

          <InputField
            label={UILabels.FIELDS.ACTION_BUTTON_LINK_URL}
            value={data.promo_btn_link || ""}
            onChange={(v: string) => set("promo_btn_link", v)}
            placeholder="e.g. /store"
            mono
          />

          <div className="md:col-span-2">
            <InputField
              label={UILabels.FIELDS.MARKETING_ALERT_BANNER_TEXT}
              value={data.promo_alert_text || ""}
              onChange={(v: string) => set("promo_alert_text", v)}
              placeholder="e.g. Use coupon FIRST10 for an extra 10% off!"
            />
          </div>

          <ColorField
            label={UILabels.FIELDS.ALERT_BAR_BACKGROUND_COLOR}
            value={data.promo_alert_bg || "#ef4444"}
            onChange={(v: string) => set("promo_alert_bg", v)}
          />

          <ColorField
            label={UILabels.FIELDS.ALERT_BAR_TEXT_COLOR}
            value={data.promo_alert_text_color || "#ffffff"}
            onChange={(v: string) => set("promo_alert_text_color", v)}
          />
        </div>
      </CmsSection>
    </>
  );
};
