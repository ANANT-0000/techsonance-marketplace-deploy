import React from "react";
import { AddBtn } from "./AddBtn";
import { ListCard } from "./ListCard";

import { CmsSection } from "./Section";

import { InputField } from "./InputField";
import { ImageUploadField } from "./ImageUploadField";
import { UILabels } from "@/constants/ui-labels";
import { UiText } from "@/constants/ui-text";
export const CmsContactTab = ({
  data,
  set,
  addItem,
  removeItem,
  updateItem,
  makeAutoSave,
}: {
  data: any;
  set: (key: string, value: any) => void;
  addItem: (key: string, value: any) => void;
  removeItem: (key: string, id: string) => void;
  updateItem: (key: string, id: string, field: string, value: any) => void;
  makeAutoSave: (key: string) => (newUrl: string) => Promise<void>;
}) => {
  return (
    <>
      <CmsSection title={UILabels.SECTIONS.HERO_BLOCK}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label={UILabels.FIELDS.HERO_TITLE}
            value={data.hero?.heroTitle || ""}
            onChange={(v: string) =>
              set("hero", { ...data.hero, heroTitle: v })
            }
          />
          <InputField
            label={UILabels.FIELDS.HERO_SUBTITLE}
            value={data.hero?.heroDesc || ""}
            onChange={(v: string) => set("hero", { ...data.hero, heroDesc: v })}
          />
          <div className="md:col-span-2">
            <ImageUploadField
              label={UILabels.FIELDS.HERO_BACKGROUND_IMAGE}
              value={data.hero?.heroImg || ""}
              onChange={(v: string) =>
                set("hero", { ...data.hero, heroImg: v })
              }
            />
          </div>
        </div>
      </CmsSection>
      <CmsSection
        title={UILabels.SECTIONS.CONTACT_METHODS}
        action={
          <AddBtn
            onClick={() =>
              addItem("list", {
                type: "phone",
                title: "",
                description: "",
                icon: "phone",
              })
            }
            label={UILabels.FIELDS.ADD_METHOD}
          />
        }
      >
        {(data.list || []).map((c: any) => (
          <ListCard key={c.id} onRemove={() => removeItem("list", c.id)}>
            <div>
              <label className="block text-theme-caption font-bold text-gray-500 mb-1.5">
                Type
              </label>
              <select
                value={c.type}
                onChange={(e) =>
                  updateItem("list", c.id, "type", e.target.value)
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-theme-body-sm"
              >
                <option value="phone">{UiText.CONTACT_TYPES.PHONE}</option>
                <option value="email">{UiText.CONTACT_TYPES.EMAIL}</option>
                <option value="address">{UiText.CONTACT_TYPES.ADDRESS}</option>
                <option value="other">{UiText.CONTACT_TYPES.OTHER}</option>
              </select>
            </div>
            <InputField
              label={UILabels.FIELDS.TITLE}
              value={c.title}
              onChange={(v: string) => updateItem("list", c.id, "title", v)}
            />
            <InputField
              label={UILabels.FIELDS.ICON_LUCIDE_NAME}
              value={c.icon}
              onChange={(v: string) => updateItem("list", c.id, "icon", v)}
              mono
            />
            <InputField
              label={UILabels.FIELDS.DETAILS__VALUE}
              value={c.description}
              onChange={(v: string) =>
                updateItem("list", c.id, "description", v)
              }
            />
          </ListCard>
        ))}
      </CmsSection>
    </>
  );
};
