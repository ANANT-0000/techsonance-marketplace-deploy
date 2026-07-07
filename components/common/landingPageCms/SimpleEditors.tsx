"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Megaphone, BarChart3, Tag, Link2 } from "lucide-react";
import type {
  LandingCtaContent,
  LandingStatsContent,
  LandingTickerContent,
  LandingIntegrationsContent,
} from "@/utils/Types";
import { useUndoableRemoval, UndoBanner } from "@/hooks/useUndoableRemoval";

// ─── CTA Editor ───────────────────────────────────────────────────────────────
interface CtaEditorProps {
  value: LandingCtaContent;
  onChange: (value: LandingCtaContent) => void;
}

export function CtaEditor({ value, onChange }: CtaEditorProps) {
  const set = (patch: Partial<LandingCtaContent>) =>
    onChange({ ...value, ...patch });
  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Megaphone className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">CTA Section</h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-1.5">
          <Label>Label</Label>
          <Input
            value={value.label}
            onChange={(e) => set({ label: e.target.value })}
          />
        </div>
        <div className="grid gap-1.5">
          <Label>Title Part 1</Label>
          <Input
            value={value.titlePart1}
            onChange={(e) => set({ titlePart1: e.target.value })}
          />
        </div>
        <div className="grid gap-1.5">
          <Label>Title Highlight</Label>
          <Input
            value={value.titleHighlight}
            onChange={(e) => set({ titleHighlight: e.target.value })}
          />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label>Subtitle</Label>
        <Textarea
          value={value.subtitle}
          onChange={(e) => set({ subtitle: e.target.value })}
          rows={2}
          className="resize-none"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label>Primary CTA Label</Label>
          <Input
            value={value.ctaPrimary}
            onChange={(e) => set({ ctaPrimary: e.target.value })}
          />
        </div>
        <div className="grid gap-1.5">
          <Label>Secondary CTA Label</Label>
          <Input
            value={value.ctaSecondary}
            onChange={(e) => set({ ctaSecondary: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Stats Editor ─────────────────────────────────────────────────────────────
interface StatsEditorProps {
  value: LandingStatsContent;
  onChange: (value: LandingStatsContent) => void;
}

export function StatsEditor({ value, onChange }: StatsEditorProps) {
  const { pending, schedule, runUndo } = useUndoableRemoval();

  const updateItem = (
    i: number,
    patch: Partial<LandingStatsContent["items"][number]>,
  ) => {
    const items = [...value.items];
    items[i] = { ...items[i], ...patch };
    onChange({ ...value, items });
  };

  const addItem = () => {
    onChange({
      ...value,
      items: [
        ...value.items,
        { value: "0", suffix: "+", label: "New stat", sublabel: "Description" },
      ],
    });
  };

  const removeItem = (i: number) => {
    const removed = value.items[i];
    const items = value.items.filter((_, idx) => idx !== i);
    onChange({ ...value, items });
    schedule({
      label: `Removed stat "${removed.label}"`,
      undo: () => {
        const restored = [...items];
        restored.splice(i, 0, removed);
        onChange({ ...value, items: restored });
      },
    });
  };

  return (
    <div className="space-y-4">
      <UndoBanner pending={pending} onUndo={runUndo} />

      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Social Proof & Metrics</h3>
        </div>
        <Button variant="outline" size="sm" onClick={addItem} className="h-8">
          <Plus className="h-4 w-4 mr-1" /> Add Stat
        </Button>
      </div>
      {value.items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
          No stats yet. Add one to show social proof.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {value.items.map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-primary">
                  {item.value}
                  {item.suffix}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove stat "${item.label}"`}
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => removeItem(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-3 grid-cols-2">
                <div className="grid gap-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    Number Value
                  </Label>
                  <Input
                    value={item.value}
                    onChange={(e) => updateItem(i, { value: e.target.value })}
                    placeholder="10"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    Suffix (e.g. M+, %)
                  </Label>
                  <Input
                    value={item.suffix}
                    onChange={(e) => updateItem(i, { suffix: e.target.value })}
                    placeholder="M+"
                  />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Label
                </Label>
                <Input
                  value={item.label}
                  onChange={(e) => updateItem(i, { label: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Sub-label
                </Label>
                <Input
                  value={item.sublabel}
                  onChange={(e) => updateItem(i, { sublabel: e.target.value })}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Ticker Editor ────────────────────────────────────────────────────────────
interface TickerEditorProps {
  value: LandingTickerContent;
  onChange: (value: LandingTickerContent) => void;
}

export function TickerEditor({ value, onChange }: TickerEditorProps) {
  const { pending, schedule, runUndo } = useUndoableRemoval();

  const addBrand = () =>
    onChange({ ...value, brands: [...value.brands, "New Brand"] });
  const updateBrand = (i: number, text: string) => {
    const brands = [...value.brands];
    brands[i] = text;
    onChange({ ...value, brands });
  };

  const removeBrand = (i: number) => {
    const removed = value.brands[i];
    const brands = value.brands.filter((_, idx) => idx !== i);
    onChange({ ...value, brands });
    schedule({
      label: `Removed brand "${removed}"`,
      undo: () => {
        const restored = [...brands];
        restored.splice(i, 0, removed);
        onChange({ ...value, brands: restored });
      },
    });
  };

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
      <UndoBanner pending={pending} onUndo={runUndo} />

      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Tag className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Trusted Brand Logos Ticker</h3>
      </div>
      <div className="grid gap-1.5">
        <Label>Ticker Header Label</Label>
        <Input
          value={value.label}
          onChange={(e) => onChange({ ...value, label: e.target.value })}
        />
      </div>
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between border-t border-border pt-3">
          <Label className="text-sm font-semibold">Brand Names</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={addBrand}
            className="h-8"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Brand
          </Button>
        </div>
        {value.brands.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-background/70 p-4 text-sm text-muted-foreground">
            No brands yet. Add the logos/names you want in the ticker.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {value.brands.map((brand, i) => (
              <div
                key={i}
                className="flex gap-2 items-center p-2 border border-border rounded-lg bg-background"
              >
                <Input
                  value={brand}
                  onChange={(e) => updateBrand(i, e.target.value)}
                  className="h-8 text-sm"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove brand "${brand}"`}
                  className="shrink-0 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => removeBrand(i)}
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

// ─── Integrations Editor ──────────────────────────────────────────────────────
interface IntegrationsEditorProps {
  value: LandingIntegrationsContent;
  onChange: (value: LandingIntegrationsContent) => void;
}

export function IntegrationsEditor({
  value,
  onChange,
}: IntegrationsEditorProps) {
  const { pending, schedule, runUndo } = useUndoableRemoval();

  const setHeader = (patch: Partial<LandingIntegrationsContent["header"]>) =>
    onChange({ ...value, header: { ...value.header, ...patch } });
  const addTool = () =>
    onChange({ ...value, tools: [...value.tools, "New Tool"] });
  const updateTool = (i: number, text: string) => {
    const tools = [...value.tools];
    tools[i] = text;
    onChange({ ...value, tools });
  };

  const removeTool = (i: number) => {
    const removed = value.tools[i];
    const tools = value.tools.filter((_, idx) => idx !== i);
    onChange({ ...value, tools });
    schedule({
      label: `Removed tool "${removed}"`,
      undo: () => {
        const restored = [...tools];
        restored.splice(i, 0, removed);
        onChange({ ...value, tools: restored });
      },
    });
  };

  return (
    <div className="space-y-6">
      <UndoBanner pending={pending} onUndo={runUndo} />

      <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Link2 className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Integrations Section Header</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-1.5">
            <Label>Section Label</Label>
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
          <h3 className="font-semibold text-base font-medium">
            Integration Tools
          </h3>
          <Button variant="outline" size="sm" onClick={addTool} className="h-8">
            <Plus className="h-4 w-4 mr-1" /> Add Tool
          </Button>
        </div>
        {value.tools.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-background/70 p-4 text-sm text-muted-foreground">
            No tools yet. Add the integrations you want to highlight.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {value.tools.map((tool, i) => (
              <div
                key={i}
                className="flex gap-2 items-center p-2 border border-border rounded-lg bg-background"
              >
                <Input
                  value={tool}
                  onChange={(e) => updateTool(i, e.target.value)}
                  className="h-8 text-sm"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove tool "${tool}"`}
                  className="shrink-0 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => removeTool(i)}
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
