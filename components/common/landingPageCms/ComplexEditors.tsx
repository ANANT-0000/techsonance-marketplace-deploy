"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  LayoutGrid,
  Image,
  Layers,
  Footprints,
  Share2,
  Compass,
  ShieldAlert,
} from "lucide-react";
import type {
  LandingFooterContent,
  LandingShowcaseContent,
  LandingFeaturesContent,
  LandingFeatureContent,
  LandingFeatureVisualItem,
} from "@/utils/Types";
import { MediaUploadField } from "../MediaUploadField";
import { useUndoableRemoval, UndoBanner } from "@/hooks/useUndoableRemoval";

// ─── Footer Editor ────────────────────────────────────────────────────────────
interface FooterEditorProps {
  value: LandingFooterContent;
  onChange: (value: LandingFooterContent) => void;
}

export function FooterEditor({ value, onChange }: FooterEditorProps) {
  const { pending, schedule, runUndo } = useUndoableRemoval();

  const updateSocial = (
    i: number,
    patch: Partial<LandingFooterContent["socials"][number]>,
  ) => {
    const socials = [...value.socials];
    socials[i] = { ...socials[i], ...patch };
    onChange({ ...value, socials });
  };
  const addSocial = () =>
    onChange({
      ...value,
      socials: [
        ...value.socials,
        { id: `social-${Date.now()}`, label: "New Social", url: "#" },
      ],
    });
  const removeSocial = (i: number) => {
    const removed = value.socials[i];
    const socials = value.socials.filter((_, idx) => idx !== i);
    onChange({ ...value, socials });
    schedule({
      label: `Removed social link "${removed.label}"`,
      undo: () => {
        const restored = [...socials];
        restored.splice(i, 0, removed);
        onChange({ ...value, socials: restored });
      },
    });
  };

  const updateColumn = (
    ci: number,
    patch: Partial<LandingFooterContent["columns"][number]>,
  ) => {
    const columns = [...value.columns];
    columns[ci] = { ...columns[ci], ...patch };
    onChange({ ...value, columns });
  };
  const updateColumnLink = (
    ci: number,
    li: number,
    patch: Partial<{ label: string; url: string }>,
  ) => {
    const columns = [...value.columns];
    const links = [...columns[ci].links];
    links[li] = { ...links[li], ...patch };
    columns[ci] = { ...columns[ci], links };
    onChange({ ...value, columns });
  };
  const addColumnLink = (ci: number) => {
    const columns = [...value.columns];
    columns[ci] = {
      ...columns[ci],
      links: [...columns[ci].links, { label: "New Link", url: "#" }],
    };
    onChange({ ...value, columns });
  };
  const removeColumnLink = (ci: number, li: number) => {
    const columns = [...value.columns];
    const removed = columns[ci].links[li];
    const links = columns[ci].links.filter((_, idx) => idx !== li);
    columns[ci] = { ...columns[ci], links };
    onChange({ ...value, columns });
    schedule({
      label: `Removed link "${removed.label}" from "${columns[ci].label}"`,
      undo: () => {
        const restoredColumns = [...columns];
        const restoredLinks = [...links];
        restoredLinks.splice(li, 0, removed);
        restoredColumns[ci] = { ...restoredColumns[ci], links: restoredLinks };
        onChange({ ...value, columns: restoredColumns });
      },
    });
  };
  const addColumn = () =>
    onChange({
      ...value,
      columns: [
        ...value.columns,
        { label: "New Column", links: [{ label: "Link 1", url: "#" }] },
      ],
    });
  const removeColumn = (ci: number) => {
    const removed = value.columns[ci];
    const columns = value.columns.filter((_, idx) => idx !== ci);
    onChange({ ...value, columns });
    schedule({
      label: `Removed column "${removed.label}" and its ${removed.links.length} link(s)`,
      undo: () => {
        const restored = [...columns];
        restored.splice(ci, 0, removed);
        onChange({ ...value, columns: restored });
      },
    });
  };

  const updateLegal = (
    i: number,
    patch: Partial<{ label: string; url: string }>,
  ) => {
    const legal = [...value.legal];
    legal[i] = { ...legal[i], ...patch };
    onChange({ ...value, legal });
  };
  const removeLegal = (i: number) => {
    const removed = value.legal[i];
    const legal = value.legal.filter((_, idx) => idx !== i);
    onChange({ ...value, legal });
    schedule({
      label: `Removed legal link "${removed.label}"`,
      undo: () => {
        const restored = [...legal];
        restored.splice(i, 0, removed);
        onChange({ ...value, legal: restored });
      },
    });
  };

  return (
    <div className="space-y-6">
      <UndoBanner pending={pending} onUndo={runUndo} />

      {/* Brand */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Footprints className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Brand & Copyright</h3>
        </div>
        <div className="grid gap-2">
          <Label>Brand Description</Label>
          <Textarea
            value={value.brandDesc}
            onChange={(e) => onChange({ ...value, brandDesc: e.target.value })}
            rows={2}
            className="resize-none"
          />
        </div>
        <div className="grid gap-2">
          <Label>Copyright Text</Label>
          <Input
            value={value.copyright}
            onChange={(e) => onChange({ ...value, copyright: e.target.value })}
          />
        </div>
      </div>

      {/* Socials */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Social Links</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={addSocial}
            className="h-8"
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
        {value.socials.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-background/70 p-4 text-sm text-muted-foreground">
            No social links yet.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {value.socials.map((s, i) => (
              <div
                key={s.id}
                className="flex gap-2 items-center p-2 border border-border rounded-lg bg-background"
              >
                <Input
                  value={s.label}
                  onChange={(e) => updateSocial(i, { label: e.target.value })}
                  placeholder="Label (e.g. Twitter)"
                  className="h-8 text-xs"
                />
                <Input
                  value={s.url}
                  onChange={(e) => updateSocial(i, { url: e.target.value })}
                  placeholder="https://..."
                  className="h-8 text-xs"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove social link "${s.label}"`}
                  className="shrink-0 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => removeSocial(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Link Columns */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Navigation Columns</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={addColumn}
            className="h-8"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Column
          </Button>
        </div>
        {value.columns.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
            No navigation columns yet.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {value.columns.map((col, ci) => (
              <div
                key={ci}
                className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm"
              >
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <Input
                    value={col.label}
                    onChange={(e) =>
                      updateColumn(ci, { label: e.target.value })
                    }
                    placeholder="Column title"
                    className="font-semibold h-8 text-sm"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove column "${col.label}"`}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 h-8 w-8"
                    onClick={() => removeColumn(ci)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {col.links.map((link, li) => (
                    <div key={li} className="flex gap-2 items-center">
                      <Input
                        value={link.label}
                        onChange={(e) =>
                          updateColumnLink(ci, li, { label: e.target.value })
                        }
                        placeholder="Label"
                        className="h-8 text-xs flex-1"
                      />
                      <Input
                        value={link.url}
                        onChange={(e) =>
                          updateColumnLink(ci, li, { url: e.target.value })
                        }
                        placeholder="Url"
                        className="h-8 text-xs flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove link "${link.label}"`}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 h-7 w-7"
                        onClick={() => removeColumnLink(ci, li)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-muted-foreground text-xs mt-2 border border-border border-dashed"
                    onClick={() => addColumnLink(ci)}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add link
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legal */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Legal Links</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onChange({
                ...value,
                legal: [...value.legal, { label: "New Policy", url: "#" }],
              })
            }
            className="h-8"
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
        {value.legal.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-background/70 p-4 text-sm text-muted-foreground">
            No legal links yet.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {value.legal.map((l, i) => (
              <div
                key={i}
                className="flex gap-2 items-center p-2 border border-border rounded-lg bg-background"
              >
                <Input
                  value={l.label}
                  onChange={(e) => updateLegal(i, { label: e.target.value })}
                  placeholder="Privacy Policy"
                  className="h-8 text-xs"
                />
                <Input
                  value={l.url}
                  onChange={(e) => updateLegal(i, { url: e.target.value })}
                  placeholder="#"
                  className="h-8 text-xs"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove legal link "${l.label}"`}
                  className="shrink-0 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => removeLegal(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Showcase Editor ──────────────────────────────────────────────────────────
interface ShowcaseEditorProps {
  value: LandingShowcaseContent;
  onChange: (value: LandingShowcaseContent) => void;
}

export function ShowcaseEditor({ value, onChange }: ShowcaseEditorProps) {
  const { pending, schedule, runUndo } = useUndoableRemoval();

  const setHeader = (patch: Partial<LandingShowcaseContent["header"]>) =>
    onChange({ ...value, header: { ...value.header, ...patch } });
  const updateImage = (
    i: number,
    patch: Partial<LandingShowcaseContent["images"][number]>,
  ) => {
    const images = [...value.images];
    images[i] = { ...images[i], ...patch };
    onChange({ ...value, images });
  };
  const addImage = () =>
    onChange({
      ...value,
      images: [...value.images, { src: "", alt: "App screenshot" }],
    });
  const removeImage = (i: number) => {
    const removed = value.images[i];
    const images = value.images.filter((_, idx) => idx !== i);
    onChange({ ...value, images });
    schedule({
      label: `Removed screenshot ${i + 1}${removed.alt ? ` ("${removed.alt}")` : ""}`,
      undo: () => {
        const restored = [...images];
        restored.splice(i, 0, removed);
        onChange({ ...value, images: restored });
      },
    });
  };

  return (
    <div className="space-y-6">
      <UndoBanner pending={pending} onUndo={runUndo} />

      <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <LayoutGrid className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg font-medium">
            Showcase Section Header
          </h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label>Label</Label>
            <Input
              value={value.header.label}
              onChange={(e) => setHeader({ label: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Title Part 1</Label>
            <Input
              value={value.header.titlePart1}
              onChange={(e) => setHeader({ titlePart1: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Title Highlight</Label>
            <Input
              value={value.header.titleHighlight}
              onChange={(e) => setHeader({ titleHighlight: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Title Part 2</Label>
            <Input
              value={value.header.titlePart2}
              onChange={(e) => setHeader({ titlePart2: e.target.value })}
            />
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label>Subtitle</Label>
          <Textarea
            value={value.header.subtitle}
            onChange={(e) => setHeader({ subtitle: e.target.value })}
            rows={2}
            className="resize-none"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Image className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Carousel Screenshots</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={addImage}
            className="h-8"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Image
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Recommend using portrait/phone aspect ratio images (e.g. 620×1262 px).
        </p>
        {value.images.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-background/70 p-4 text-sm text-muted-foreground">
            No screenshots yet. Add one to fill the carousel.
          </div>
        ) : (
          <div className="space-y-3">
            {value.images.map((img, i) => (
              <div
                key={i}
                className="flex flex-col gap-3 p-4 border border-border rounded-xl bg-background hover:shadow-sm transition-all"
              >
                <div className="flex justify-between items-center border-b border-border pb-2">
                  <span className="text-xs font-bold text-primary">
                    Screen/Asset #{i + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove screenshot ${i + 1}`}
                    className="shrink-0 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeImage(i)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-12 items-start">
                  <div className="md:col-span-5">
                    <MediaUploadField
                      label="Upload Image or Video"
                      value={img.src}
                      onChange={(url) => updateImage(i, { src: url })}
                      accept="image/*,video/*"
                    />
                  </div>
                  <div className="md:col-span-7 space-y-3">
                    <div className="grid gap-1">
                      <Label className="text-xs font-semibold text-muted-foreground">
                        Or Paste Media Source URL
                      </Label>
                      <Input
                        value={img.src}
                        onChange={(e) =>
                          updateImage(i, { src: e.target.value })
                        }
                        placeholder="/assets/landing/screen-01.jpg"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label className="text-xs font-semibold text-muted-foreground">
                        SEO / Screen Description (Alt Text)
                      </Label>
                      <Input
                        value={img.alt}
                        onChange={(e) =>
                          updateImage(i, { alt: e.target.value })
                        }
                        placeholder="e.g. Mobile dashboard metrics preview"
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Features Editor ──────────────────────────────────────────────────────────
interface FeaturesEditorProps {
  value: LandingFeaturesContent;
  onChange: (value: LandingFeaturesContent) => void;
}

const VISUAL_TYPES = [
  "storefront",
  "inventory",
  "timeline",
  "marketing",
  "analytics",
] as const;

/**
 * Returns a new visual object keeping ONLY the fields relevant to the new type.
 * Fields from the old type that have no meaning in the new type are dropped
 * rather than carried along silently (stale data prevention).
 */
function clearVisualForType(
  current: LandingFeatureContent["visual"],
  newType: LandingFeatureContent["visual"]["type"],
): LandingFeatureContent["visual"] {
  // title is required on the type so always preserved.
  const base = { type: newType, title: current.title };
  switch (newType) {
    case "storefront":
      return { ...base, statusLabel: current.statusLabel, metrics: current.metrics, items: current.items };
    case "inventory":
      return { ...base, statusLabel: current.statusLabel, items: current.items, stats: current.stats };
    case "timeline":
      return { ...base, activityTitle: current.activityTitle, presenceTitle: current.presenceTitle, activity: current.activity };
    case "marketing":
      return { ...base, commentsTitle: current.commentsTitle };
    case "analytics":
      return { ...base, metrics: current.metrics, stats: current.stats };
    default:
      return base;
  }
}

export function FeaturesEditor({ value, onChange }: FeaturesEditorProps) {
  const { pending, schedule, runUndo } = useUndoableRemoval();

  const setHeader = (patch: Partial<LandingFeaturesContent["header"]>) =>
    onChange({ ...value, header: { ...value.header, ...patch } });
  const updateItem = (
    i: number,
    patch: Partial<LandingFeaturesContent["items"][number]>,
  ) => {
    const items = [...value.items];
    items[i] = { ...items[i], ...patch };
    onChange({ ...value, items });
  };
  const updateChecklist = (itemIdx: number, checkIdx: number, text: string) => {
    const items = [...value.items];
    const checklist = [...items[itemIdx].checklist];
    checklist[checkIdx] = text;
    items[itemIdx] = { ...items[itemIdx], checklist };
    onChange({ ...value, items });
  };
  const addChecklistItem = (itemIdx: number) => {
    const items = [...value.items];
    items[itemIdx] = {
      ...items[itemIdx],
      checklist: [...items[itemIdx].checklist, "New feature"],
    };
    onChange({ ...value, items });
  };
  const removeChecklistItem = (itemIdx: number, checkIdx: number) => {
    const items = [...value.items];
    const removed = items[itemIdx].checklist[checkIdx];
    const checklist = items[itemIdx].checklist.filter(
      (_, idx) => idx !== checkIdx,
    );
    items[itemIdx] = { ...items[itemIdx], checklist };
    onChange({ ...value, items });
    schedule({
      label: `Removed checklist item "${removed}" from "${items[itemIdx].title}"`,
      undo: () => {
        const restoredItems = [...items];
        const restoredChecklist = [...checklist];
        restoredChecklist.splice(checkIdx, 0, removed);
        restoredItems[itemIdx] = {
          ...restoredItems[itemIdx],
          checklist: restoredChecklist,
        };
        onChange({ ...value, items: restoredItems });
      },
    });
  };

  return (
    <div className="space-y-6">
      <UndoBanner pending={pending} onUndo={runUndo} />

      <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Layers className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg font-medium">
            Features Section Header
          </h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label>Label</Label>
            <Input
              value={value.header.label}
              onChange={(e) => setHeader({ label: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Title Part 1</Label>
            <Input
              value={value.header.titlePart1}
              onChange={(e) => setHeader({ titlePart1: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Title Highlight</Label>
            <Input
              value={value.header.titleHighlight}
              onChange={(e) => setHeader({ titleHighlight: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Title Part 2</Label>
            <Input
              value={value.header.titlePart2}
              onChange={(e) => setHeader({ titlePart2: e.target.value })}
            />
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label>Subtitle</Label>
          <Textarea
            value={value.header.subtitle}
            onChange={(e) => setHeader({ subtitle: e.target.value })}
            rows={2}
            className="resize-none"
          />
        </div>
      </div>

      <div className="space-y-4">
        {value.items.map((item, i) => (
          <div
            key={item.id}
            className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-sm"
          >
            <h3 className="text-sm font-semibold border-b border-border pb-2 text-primary">
              {item.number} — {item.title}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>Step Label (e.g. 01 - STOREFRONT)</Label>
                <Input
                  value={item.number}
                  onChange={(e) => updateItem(i, { number: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Visual Type (which demo widget shows)</Label>
                <select
                  value={item.visual.type}
                  onChange={(e) => {
                    const newType = e.target.value as LandingFeatureContent["visual"]["type"];
                    updateItem(i, { visual: clearVisualForType(item.visual, newType) });
                  }}
                  className="flex h-10 w-full rounded-md border border-border border-input bg-background px-3 py-1 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary/20"
                >
                  {VISUAL_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Feature Title</Label>
              <Input
                value={item.title}
                onChange={(e) => updateItem(i, { title: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Description</Label>
              <Textarea
                value={item.description}
                onChange={(e) => updateItem(i, { description: e.target.value })}
                rows={2}
                className="resize-none"
              />
            </div>
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between border-t border-border pt-3">
                <Label className="text-xs font-semibold">Checklist Items</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addChecklistItem(i)}
                  className="h-7 text-xs"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add
                </Button>
              </div>
              {item.checklist.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-background/70 p-3 text-xs text-muted-foreground">
                  No checklist items yet.
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {item.checklist.map((check, ci) => (
                    <div key={ci} className="flex gap-2 items-center">
                      <Input
                        value={check}
                        onChange={(e) => updateChecklist(i, ci, e.target.value)}
                        className="h-8 text-xs flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove checklist item "${check}"`}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 h-8 w-8"
                        onClick={() => removeChecklistItem(i, ci)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="space-y-4 pt-4 border-t border-border mt-4">
              <Label className="text-sm font-semibold text-primary">Visual Mockup Configuration ({item.visual.type})</Label>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Configure the specific data points that appear in this feature's animated mockup.
              </p>

              {/* Title / Status Fields (Used across multiple types) */}
              <div className="grid gap-4 sm:grid-cols-2">
                {["storefront", "analytics", "marketing", "inventory"].includes(item.visual.type) && (
                  <div className="grid gap-1.5">
                    <Label className="text-xs">Widget Title</Label>
                    <Input
                      value={item.visual.title || ""}
                      onChange={(e) => updateItem(i, { visual: { ...item.visual, title: e.target.value } })}
                      className="h-8 text-xs"
                    />
                  </div>
                )}
                {["storefront", "inventory"].includes(item.visual.type) && (
                  <div className="grid gap-1.5">
                    <Label className="text-xs">Status Label (e.g. Live)</Label>
                    <Input
                      value={item.visual.statusLabel || ""}
                      onChange={(e) => updateItem(i, { visual: { ...item.visual, statusLabel: e.target.value } })}
                      className="h-8 text-xs"
                    />
                  </div>
                )}
              </div>

              {/* Specific Text Fields for Timeline / Presence */}
              {item.visual.type === "timeline" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <Label className="text-xs">Activity Header</Label>
                    <Input
                      value={item.visual.activityTitle || ""}
                      onChange={(e) => updateItem(i, { visual: { ...item.visual, activityTitle: e.target.value } })}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs">Presence Header</Label>
                    <Input
                      value={item.visual.presenceTitle || ""}
                      onChange={(e) => updateItem(i, { visual: { ...item.visual, presenceTitle: e.target.value } })}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Specific Text Fields for Marketing */}
              {item.visual.type === "marketing" && (
                <div className="grid gap-1.5">
                  <Label className="text-xs">Comments Header</Label>
                  <Input
                    value={item.visual.commentsTitle || ""}
                    onChange={(e) => updateItem(i, { visual: { ...item.visual, commentsTitle: e.target.value } })}
                    className="h-8 text-xs"
                  />
                </div>
              )}

              {/* Metrics Array */}
              {["storefront", "analytics"].includes(item.visual.type) && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Metrics</Label>
                    <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => {
                      const metrics = [...(item.visual.metrics || [])];
                      metrics.push({ label: "New Metric", value: "0", fill: "#000" });
                      updateItem(i, { visual: { ...item.visual, metrics } });
                    }}>
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                  {(!item.visual.metrics || item.visual.metrics.length === 0) ? (
                    <div className="text-[10px] text-muted-foreground p-2 border border-dashed rounded bg-muted/20">No metrics</div>
                  ) : (
                    <div className="grid gap-2">
                      {item.visual.metrics.map((m, mIdx) => (
                        <div key={mIdx} className="flex gap-2 items-center">
                          <Input value={m.label} onChange={(e) => {
                            const metrics = [...(item.visual.metrics || [])];
                            metrics[mIdx] = { ...m, label: e.target.value };
                            updateItem(i, { visual: { ...item.visual, metrics } });
                          }} placeholder="Label" className="h-7 text-[11px]" />
                          <Input value={m.value} onChange={(e) => {
                            const metrics = [...(item.visual.metrics || [])];
                            metrics[mIdx] = { ...m, value: e.target.value };
                            updateItem(i, { visual: { ...item.visual, metrics } });
                          }} placeholder="Value" className="h-7 text-[11px]" />
                          <Input value={m.fill} onChange={(e) => {
                            const metrics = [...(item.visual.metrics || [])];
                            metrics[mIdx] = { ...m, fill: e.target.value };
                            updateItem(i, { visual: { ...item.visual, metrics } });
                          }} placeholder="Color (e.g. #000)" className="h-7 text-[11px] w-24" />
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => {
                            const metrics = (item.visual.metrics || []).filter((_, idx) => idx !== mIdx);
                            updateItem(i, { visual: { ...item.visual, metrics } });
                          }}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Items Array (for Storefront/Inventory) */}
              {["storefront", "inventory"].includes(item.visual.type) && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Line Items</Label>
                    <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => {
                      const itemsList = [...(item.visual.items || [])];
                      itemsList.push({ name: "New Item", status: "Active", tone: "info" });
                      updateItem(i, { visual: { ...item.visual, items: itemsList } });
                    }}>
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                  {(!item.visual.items || item.visual.items.length === 0) ? (
                    <div className="text-[10px] text-muted-foreground p-2 border border-dashed rounded bg-muted/20">No items</div>
                  ) : (
                    <div className="grid gap-2">
                      {item.visual.items.map((mItem, mIdx) => (
                        <div key={mIdx} className="flex gap-2 items-center">
                          <Input value={mItem.name} onChange={(e) => {
                            const itemsList = [...(item.visual.items || [])];
                            itemsList[mIdx] = { ...mItem, name: e.target.value };
                            updateItem(i, { visual: { ...item.visual, items: itemsList } });
                          }} placeholder="Name" className="h-7 text-[11px]" />
                          <Input value={mItem.status} onChange={(e) => {
                            const itemsList = [...(item.visual.items || [])];
                            itemsList[mIdx] = { ...mItem, status: e.target.value };
                            updateItem(i, { visual: { ...item.visual, items: itemsList } });
                          }} placeholder="Status" className="h-7 text-[11px]" />
                          <select value={mItem.tone} onChange={(e) => {
                            const itemsList = [...(item.visual.items || [])];
                            itemsList[mIdx] = { ...mItem, tone: e.target.value as LandingFeatureVisualItem["tone"] };
                            updateItem(i, { visual: { ...item.visual, items: itemsList } });
                          }} className="h-7 text-[11px] rounded border border-border">
                            <option value="success">Success</option>
                            <option value="info">Info</option>
                            <option value="muted">Muted</option>
                          </select>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => {
                            const itemsList = (item.visual.items || []).filter((_, idx) => idx !== mIdx);
                            updateItem(i, { visual: { ...item.visual, items: itemsList } });
                          }}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Activity Array */}
              {item.visual.type === "timeline" && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Activity Feed</Label>
                    <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => {
                      const activity = [...(item.visual.activity || [])];
                      activity.push({ name: "Action", status: "Detail", tone: "info" });
                      updateItem(i, { visual: { ...item.visual, activity } });
                    }}>
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                  {(!item.visual.activity || item.visual.activity.length === 0) ? (
                    <div className="text-[10px] text-muted-foreground p-2 border border-dashed rounded bg-muted/20">No activity</div>
                  ) : (
                    <div className="grid gap-2">
                      {item.visual.activity.map((act, aIdx) => (
                        <div key={aIdx} className="flex gap-2 items-center">
                          <Input value={act.name} onChange={(e) => {
                            const activity = [...(item.visual.activity || [])];
                            activity[aIdx] = { ...act, name: e.target.value };
                            updateItem(i, { visual: { ...item.visual, activity } });
                          }} placeholder="Action" className="h-7 text-[11px]" />
                          <Input value={act.status} onChange={(e) => {
                            const activity = [...(item.visual.activity || [])];
                            activity[aIdx] = { ...act, status: e.target.value };
                            updateItem(i, { visual: { ...item.visual, activity } });
                          }} placeholder="Detail" className="h-7 text-[11px]" />
                          <select value={act.tone} onChange={(e) => {
                            const activity = [...(item.visual.activity || [])];
                            activity[aIdx] = { ...act, tone: e.target.value as LandingFeatureVisualItem["tone"] };
                            updateItem(i, { visual: { ...item.visual, activity } });
                          }} className="h-7 text-[11px] rounded border border-border">
                            <option value="success">Success</option>
                            <option value="info">Info</option>
                            <option value="muted">Muted</option>
                          </select>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => {
                            const activity = (item.visual.activity || []).filter((_, idx) => idx !== aIdx);
                            updateItem(i, { visual: { ...item.visual, activity } });
                          }}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Stats Array */}
              {["inventory", "analytics"].includes(item.visual.type) && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Stats Highlights</Label>
                    <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => {
                      const stats = [...(item.visual.stats || [])];
                      stats.push({ label: "Stat", value: "0" });
                      updateItem(i, { visual: { ...item.visual, stats } });
                    }}>
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                  {(!item.visual.stats || item.visual.stats.length === 0) ? (
                    <div className="text-[10px] text-muted-foreground p-2 border border-dashed rounded bg-muted/20">No stats</div>
                  ) : (
                    <div className="grid gap-2">
                      {item.visual.stats.map((s, sIdx) => (
                        <div key={sIdx} className="flex gap-2 items-center">
                          <Input value={s.label} onChange={(e) => {
                            const stats = [...(item.visual.stats || [])];
                            stats[sIdx] = { ...s, label: e.target.value };
                            updateItem(i, { visual: { ...item.visual, stats } });
                          }} placeholder="Label" className="h-7 text-[11px]" />
                          <Input value={s.value} onChange={(e) => {
                            const stats = [...(item.visual.stats || [])];
                            stats[sIdx] = { ...s, value: e.target.value };
                            updateItem(i, { visual: { ...item.visual, stats } });
                          }} placeholder="Value" className="h-7 text-[11px]" />
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => {
                            const stats = (item.visual.stats || []).filter((_, idx) => idx !== sIdx);
                            updateItem(i, { visual: { ...item.visual, stats } });
                          }}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
