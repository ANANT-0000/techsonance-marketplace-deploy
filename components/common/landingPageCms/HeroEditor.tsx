"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Layout, LinkIcon, Plus, Shield, Sparkles, Trash2 } from "lucide-react";
import type { LandingHeroContent, LandingHeroTrustBadge } from "@/utils/Types";
import { MediaUploadField } from "../MediaUploadField";
import { UndoBanner, useUndoableRemoval } from "@/hooks/useUndoableRemoval";
import { UrlInput } from "./UrlInput";

interface HeroEditorProps {
  value: LandingHeroContent;
  onChange: (value: LandingHeroContent) => void;
}

export function HeroEditor({ value, onChange }: HeroEditorProps) {
  const { pending, schedule, runUndo } = useUndoableRemoval();

  const set = (patch: Partial<LandingHeroContent>) =>
    onChange({ ...value, ...patch });
  const setVisual = (patch: Partial<LandingHeroContent["visual"]>) =>
    onChange({ ...value, visual: { ...value.visual, ...patch } });
  const setMedia = (
    patch: Partial<NonNullable<LandingHeroContent["visual"]["media"]>>,
  ) =>
    setVisual({
      media: {
        ...(value.visual.media ?? { type: "image", src: "" }),
        ...patch,
      },
    });

  const removeTrustBadge = (i: number) => {
    const removed = value.trustBadges[i];
    const trustBadges = value.trustBadges.filter((_, idx) => idx !== i);
    set({ trustBadges });
    schedule({
      label: `Removed badge "${removed.label}"`,
      undo: () => {
        const restored = [...trustBadges];
        restored.splice(i, 0, removed);
        set({ trustBadges: restored });
      },
    });
  };

  return (
    <div className="space-y-6">
      <UndoBanner pending={pending} onUndo={runUndo} />

      {/* Badge & Headlines */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Headlines & Badge</h3>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="hero-badge" className="text-sm font-medium">
              Hero Badge Text
            </Label>
            <Input
              id="hero-badge"
              value={value.badge}
              onChange={(e) => set({ badge: e.target.value })}
              placeholder="e.g. Launch faster"
            />
            <p className="text-[11px] text-muted-foreground">
              Small accent tag above the main headline.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="hero-title1" className="text-sm font-medium">
              Headline (Part 1)
            </Label>
            <Input
              id="hero-title1"
              value={value.titlePart1}
              onChange={(e) => set({ titlePart1: e.target.value })}
            />
            <p className="text-[11px] text-muted-foreground">
              Opening text of the main hero headline.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="hero-highlight" className="text-sm font-medium">
              Headline Highlight (Colored)
            </Label>
            <Input
              id="hero-highlight"
              value={value.titleHighlight}
              onChange={(e) => set({ titleHighlight: e.target.value })}
            />
            <p className="text-[11px] text-muted-foreground">
              This phrase is highlighted in your theme color.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="hero-title2" className="text-sm font-medium">
              Headline (Part 2 - Suffix)
            </Label>
            <Input
              id="hero-title2"
              value={value.titlePart2 ?? ""}
              onChange={(e) => set({ titlePart2: e.target.value })}
            />
            <p className="text-[11px] text-muted-foreground">
              Ending text of the main hero headline (optional).
            </p>
          </div>
        </div>
        <div className="grid gap-2 pt-2">
          <Label htmlFor="hero-subtitle" className="text-sm font-medium">
            Hero Description / Subtitle
          </Label>
          <Textarea
            id="hero-subtitle"
            value={value.subtitle}
            onChange={(e) => set({ subtitle: e.target.value })}
            rows={3}
            className="resize-none"
          />
          <p className="text-[11px] text-muted-foreground">
            Summarizes your value proposition in 2-3 lines.
          </p>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <LinkIcon className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Call to Action Buttons</h3>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="hero-cta-primary" className="text-sm font-medium">
              Primary Button Label
            </Label>
            <Input
              id="hero-cta-primary"
              value={value.ctaPrimary}
              onChange={(e) => set({ ctaPrimary: e.target.value })}
              placeholder="Start Free Trial"
            />
            <p className="text-[11px] text-muted-foreground">
              Solid background primary action button.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="hero-cta-secondary" className="text-sm font-medium">
              Secondary Button Label
            </Label>
            <Input
              id="hero-cta-secondary"
              value={value.ctaSecondary}
              onChange={(e) => set({ ctaSecondary: e.target.value })}
              placeholder="Build My Store"
            />
            <p className="text-[11px] text-muted-foreground">
              Outlined secondary choice button.
            </p>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Trust & Security Badges</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              set({
                trustBadges: [
                  ...value.trustBadges,
                  {
                    id: crypto.randomUUID(),
                    label: "New badge",
                    icon: "shield",
                  },
                ],
              })
            }
            className="h-8"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Badge
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {value.trustBadges.map((badge, i) => (
            <div
              key={badge.id || i}
              className="flex gap-2 items-center p-3 border border-border rounded-lg bg-background hover:shadow-sm transition-all"
            >
              <div className="flex-1 space-y-1.5">
                <Label className="text-[11px] text-muted-foreground">
                  Label
                </Label>
                <Input
                  value={badge.label}
                  onChange={(e) => {
                    const updated = [...value.trustBadges];
                    updated[i] = { ...badge, label: e.target.value };
                    set({ trustBadges: updated });
                  }}
                  placeholder="Badge label"
                  className="h-8 text-xs"
                />
              </div>
              <div className="w-24 space-y-1.5">
                <Label className="text-[11px] text-muted-foreground">
                  Icon
                </Label>
                <Select
                  value={badge.icon}
                  onValueChange={(v) => {
                    const updated = [...value.trustBadges];
                    updated[i] = {
                      ...badge,
                      icon: v as LandingHeroTrustBadge["icon"],
                    };
                    set({ trustBadges: updated });
                  }}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shield">Shield</SelectItem>
                    <SelectItem value="users">Users</SelectItem>
                    <SelectItem value="server">Server</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove badge "${badge.label}"`}
                className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 mt-5"
                onClick={() => removeTrustBadge(i)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        {value.trustBadges.length === 0 && (
          <div className="rounded-lg border border-dashed border-border bg-background/70 p-4 text-sm text-muted-foreground">
            No trust badges yet. Add one to reassure visitors above the fold.
          </div>
        )}
      </div>

      {/* Dashboard Visual / Media */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Layout className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Hero Visual Component</h3>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label className="text-sm font-medium">Visual Card Title</Label>
            <Input
              value={value.visual.title}
              onChange={(e) => setVisual({ title: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-sm font-medium">Visual Status Text</Label>
            <Input
              value={value.visual.status}
              onChange={(e) => setVisual({ status: e.target.value })}
              placeholder="Live"
            />
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="grid gap-2">
            <Label className="text-sm font-medium">Media Element Type</Label>
            <Select
              value={value.visual.media?.type ?? "image"}
              onValueChange={(v) =>
                setMedia({
                  type: v as NonNullable<
                    LandingHeroContent["visual"]["media"]
                  >["type"],
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Image Asset</SelectItem>
                <SelectItem value="video">Direct MP4 Video</SelectItem>
                <SelectItem value="embed">Embed (iframe)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label className="text-sm font-medium">Media Source URL</Label>
            {value.visual.media?.type === "embed" ? (
              <UrlInput
                value={value.visual.media?.src ?? ""}
                onChange={(url) => setMedia({ src: url })}
                placeholder="https://youtube.com/embed/..."
                allowedDomains={[
                  "youtube.com",
                  "youtube-nocookie.com",
                  "loom.com",
                  "vimeo.com",
                  "wistia.com",
                ]}
              />
            ) : (
              <Input
                value={value.visual.media?.src ?? ""}
                onChange={(e) => setMedia({ src: e.target.value })}
                placeholder="/assets/landing/dashboard.jpg"
              />
            )}
          </div>
        </div>

        {value.visual.media?.type === "embed" && value.visual.media?.src && (
          <div className="pt-2">
            <Label className="text-sm font-medium mb-2 block">
              Live Embed Preview
            </Label>
            <div className="w-full aspect-video rounded-lg border border-border overflow-hidden bg-muted flex items-center justify-center">
              <iframe
                src={value.visual.media.src}
                className="w-full h-full border-0"
                title="Embed Preview"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {(value.visual.media?.type === "image" ||
          value.visual.media?.type === "video") && (
          <div className="pt-2">
            <MediaUploadField
              label={`Upload ${value.visual.media?.type === "image" ? "Image" : "Video"} Asset`}
              value={value.visual.media?.src ?? ""}
              onChange={(url) => setMedia({ src: url })}
              accept={
                value.visual.media?.type === "image" ? "image/*" : "video/*"
              }
            />
          </div>
        )}

        {value.visual.media?.type === "image" && (
          <div className="grid gap-2">
            <Label className="text-sm font-medium">
              SEO Image Description (Alt Text)
            </Label>
            <Input
              value={value.visual.media?.alt ?? ""}
              onChange={(e) => setMedia({ alt: e.target.value })}
              placeholder="e.g. Sales dashboard preview highlighting revenue graph"
            />
          </div>
        )}

        {value.visual.media?.type === "video" && (
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="hero-media-autoplay"
              checked={value.visual.media?.autoPlay ?? true}
              onChange={(e) => setMedia({ autoPlay: e.target.checked })}
              className="rounded h-4 w-4 text-primary focus:ring-primary border-muted"
            />
            <Label
              htmlFor="hero-media-autoplay"
              className="text-sm font-medium cursor-pointer"
            >
              Enable Video Autoplay (Muted & Loop)
            </Label>
          </div>
        )}

      </div>
    </div>
  );
}
