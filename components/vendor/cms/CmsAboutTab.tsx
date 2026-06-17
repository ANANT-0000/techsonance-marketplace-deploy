import React from "react";
import { AddBtn } from "./AddBtn";
import { ListCard } from "./ListCard";

import { CmsSection } from "./Section";

import { InputField } from "./InputField";
import { ImageUploadField } from "./ImageUploadField";
import { UILabels } from "@/constants/ui-labels";
export const CmsAboutTab = ({
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
            value={data.heroTitle || ""}
            onChange={(v: string) => set("heroTitle", v)}
          />
          <InputField
            label={UILabels.FIELDS.HERO_SUBTITLE}
            value={data.heroDesc || ""}
            onChange={(v: string) => set("heroDesc", v)}
          />
          <div className="md:col-span-2">
            <ImageUploadField
              label={UILabels.FIELDS.HERO_BACKGROUND_IMAGE}
              value={data.heroImg || ""}
              onChange={(v: string) => set("heroImg", v)}
              onAutoSave={makeAutoSave("heroImg")}
            />
          </div>
        </div>
      </CmsSection>
      <CmsSection title={UILabels.SECTIONS.THOUGHTS__FOUNDER}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label={UILabels.FIELDS.SECTION_TITLE}
            value={data.ownThoughtsTitle || ""}
            onChange={(v: string) => set("ownThoughtsTitle", v)}
          />
          <ImageUploadField
            label={UILabels.FIELDS.SECTION_IMAGE}
            value={data.ownThoughtsImg || ""}
            onChange={(v: string) => set("ownThoughtsImg", v)}
            onAutoSave={makeAutoSave("ownThoughtsImg")}
          />
          <div className="md:col-span-2">
            <InputField
              label={UILabels.FIELDS.DESCRIPTION}
              value={data.ownThoughtsDesc || ""}
              onChange={(v: string) => set("ownThoughtsDesc", v)}
              textarea
            />
          </div>
          <InputField
            label={UILabels.FIELDS.FOUNDER_NAME}
            value={data.founderName || ""}
            onChange={(v: string) => set("founderName", v)}
          />
          <InputField
            label={UILabels.FIELDS.FOUNDER_TITLE__ROLE}
            value={data.founderTitle || ""}
            onChange={(v: string) => set("founderTitle", v)}
          />
          <div className="md:col-span-2">
            <ImageUploadField
              label={UILabels.FIELDS.FOUNDER_PHOTO}
              value={data.founderImg || ""}
              onChange={(v: string) => set("founderImg", v)}
              onAutoSave={makeAutoSave("founderImg")}
            />
          </div>
        </div>
      </CmsSection>
      <CmsSection title={UILabels.SECTIONS.CORE_VALUES_BANNER}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label={UILabels.FIELDS.SECTION_TITLE}
            value={data.coreValuesTitle || ""}
            onChange={(v: string) => set("coreValuesTitle", v)}
          />
          <ImageUploadField
            label={UILabels.FIELDS.BACKGROUND_IMAGE}
            value={data.coreValuesImg || ""}
            onChange={(v: string) => set("coreValuesImg", v)}
            onAutoSave={makeAutoSave("coreValuesImg")}
          />
          <div className="md:col-span-2">
            <InputField
              label={UILabels.FIELDS.DESCRIPTION}
              value={data.coreValuesDesc || ""}
              onChange={(v: string) => set("coreValuesDesc", v)}
            />
          </div>
        </div>
      </CmsSection>
      <CmsSection
        title={UILabels.SECTIONS.CORE_VALUES_LIST}
        action={
          <AddBtn
            onClick={() =>
              addItem("coreValues", {
                title: "",
                tagline: "",
                description: "",
              })
            }
            label={UILabels.FIELDS.ADD_VALUE}
          />
        }
      >
        {(data.coreValues || []).map((v: any) => (
          <ListCard key={v.id} onRemove={() => removeItem("coreValues", v.id)}>
            <InputField
              label={UILabels.FIELDS.TITLE}
              value={v.title}
              onChange={(val: string) =>
                updateItem("coreValues", v.id, "title", val)
              }
            />
            <InputField
              label={UILabels.FIELDS.TAGLINE}
              value={v.tagline}
              onChange={(val: string) =>
                updateItem("coreValues", v.id, "tagline", val)
              }
            />
            <div className="md:col-span-2">
              <InputField
                label={UILabels.FIELDS.DESCRIPTION}
                value={v.description}
                onChange={(val: string) =>
                  updateItem("coreValues", v.id, "description", val)
                }
              />
            </div>
          </ListCard>
        ))}
      </CmsSection>
      <CmsSection title={UILabels.SECTIONS.MISSION_SECTION}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label={UILabels.FIELDS.MISSION_TITLE}
            value={data.missionTitle || ""}
            onChange={(v: string) => set("missionTitle", v)}
          />
          <ImageUploadField
            label={UILabels.FIELDS.MISSION_IMAGE}
            value={data.missionImg || ""}
            onChange={(v: string) => set("missionImg", v)}
            onAutoSave={makeAutoSave("missionImg")}
          />
          <div className="md:col-span-2">
            <InputField
              label={UILabels.FIELDS.MISSION_STATEMENT}
              value={data.missionDesc || ""}
              onChange={(v: string) => set("missionDesc", v)}
              textarea
            />
          </div>
        </div>
      </CmsSection>
      <CmsSection
        title={UILabels.SECTIONS.MISSION_DELIVERABLES}
        action={
          <AddBtn
            onClick={() =>
              addItem("missionToDeliver", {
                title: "",
                tagline: "",
                description: "",
              })
            }
            label={UILabels.FIELDS.ADD_CARD}
          />
        }
      >
        {(data.missionToDeliver || []).map((m: any) => (
          <ListCard
            key={m.id}
            onRemove={() => removeItem("missionToDeliver", m.id)}
          >
            <InputField
              label={UILabels.FIELDS.TITLE}
              value={m.title}
              onChange={(val: string) =>
                updateItem("missionToDeliver", m.id, "title", val)
              }
            />
            <InputField
              label={UILabels.FIELDS.TAGLINE}
              value={m.tagline}
              onChange={(val: string) =>
                updateItem("missionToDeliver", m.id, "tagline", val)
              }
            />
            <div className="md:col-span-2">
              <InputField
                label={UILabels.FIELDS.DESCRIPTION}
                value={m.description}
                onChange={(val: string) =>
                  updateItem("missionToDeliver", m.id, "description", val)
                }
              />
            </div>
          </ListCard>
        ))}
      </CmsSection>
    </>
  );
};
