"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Layout,
  Plus,
  Trash2,
  Image as ImageIcon,
  Type,
  Link2,
} from "lucide-react";
import type { LandingNavbarContent } from "@/utils/Types";
import { UndoBanner, useUndoableRemoval } from "@/hooks/useUndoableRemoval";
import { MediaUploadField } from "../MediaUploadField";
import { UrlInput } from "./UrlInput";

interface NavbarEditorProps {
  value: LandingNavbarContent;
  onChange: (value: LandingNavbarContent) => void;
  companyLogoUrl: string | null;
}

export function NavbarEditor({
  value,
  onChange,
  companyLogoUrl,
}: NavbarEditorProps) {
  const { pending, schedule, runUndo } = useUndoableRemoval();

  const set = (patch: Partial<LandingNavbarContent>) =>
    onChange({ ...value, ...patch });
  const setLogo = (patch: Partial<LandingNavbarContent["logo"]>) =>
    set({ logo: { ...value.logo, ...patch } });
  const setCtas = (patch: Partial<LandingNavbarContent["ctas"]>) =>
    set({ ctas: { ...value.ctas, ...patch } });

  const addLink = () => {
    set({
      links: [
        ...(value.links || []),
        { id: crypto.randomUUID(), label: "New Link", href: "#" },
      ],
    });
  };

  const updateLink = (
    i: number,
    patch: Partial<{ label: string; href: string }>,
  ) => {
    const links = [...(value.links || [])];
    links[i] = { ...links[i], ...patch };
    set({ links });
  };

  const removeLink = (i: number) => {
    const removed = value.links[i];
    const links = value.links.filter((_, idx) => idx !== i);
    set({ links });
    schedule({
      label: `Removed link "${removed.label}"`,
      undo: () => {
        const restored = [...links];
        restored.splice(i, 0, removed);
        set({ links: restored });
      },
    });
  };

  const logoType = value.logo?.type || "text";

  return (
    <div className="space-y-6">
      <UndoBanner pending={pending} onUndo={runUndo} />

      <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Layout className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Navbar Configuration</h3>
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-sm font-semibold">Logo Style</Label>
          <div className="flex gap-2">
            <Button
              variant={logoType === "text" ? "default" : "outline"}
              size="sm"
              onClick={() => setLogo({ type: "text", imageUrl: "" })}
            >
              <Type className="h-4 w-4 mr-2" /> Text Logo
            </Button>
            <Button
              variant={logoType === "image" ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setLogo({ type: "image", text: "", highlight: "" })
              }
            >
              <ImageIcon className="h-4 w-4 mr-2" /> Image Logo
            </Button>
          </div>

          {logoType === "text" ? (
            <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-border mt-4">
              <div className="grid gap-1.5">
                <Label>Logo Text</Label>
                <Input
                  value={value.logo?.text || ""}
                  onChange={(e) => setLogo({ text: e.target.value })}
                  placeholder="Brand Name"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Logo Highlight</Label>
                <Input
                  value={value.logo?.highlight || ""}
                  onChange={(e) => setLogo({ highlight: e.target.value })}
                  placeholder="Secondary Part"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-2 border-t border-border mt-4">
              <MediaUploadField
                label="Upload Navbar Logo"
                value={value.logo?.imageUrl ?? ""}
                onChange={(url) => setLogo({ imageUrl: url })}
                accept="image/*"
              />

              {companyLogoUrl && (
                <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg border border-border mt-2">
                  <div className="w-12 h-12 bg-white rounded flex items-center justify-center p-1 border">
                    <img
                      src={companyLogoUrl}
                      alt="Company Identity Logo"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Company Identity Logo Available
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Extracted from your global branding settings.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLogo({ imageUrl: companyLogoUrl })}
                  >
                    Use this Logo
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Navigation Links</h3>
          </div>
          <Button variant="outline" size="sm" onClick={addLink} className="h-8">
            <Plus className="h-4 w-4 mr-1" /> Add Link
          </Button>
        </div>

        {!value.links || value.links.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-background/70 p-4 text-sm text-muted-foreground">
            No navigation links added.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {value.links?.map((link, i) => (
              <div
                key={i}
                className="flex gap-2 items-start p-2 border border-border rounded-lg bg-background"
              >
                <Input
                  value={link.label}
                  onChange={(e) => updateLink(i, { label: e.target.value })}
                  placeholder="Label (e.g. Pricing)"
                  className="h-8 text-xs flex-1"
                />
                <div className="flex-1">
                  <UrlInput
                    value={link.href}
                    onChange={(val) => updateLink(i, { href: val })}
                    placeholder="url"
                    className="h-8 text-xs"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => removeLink(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <h3 className="font-semibold text-lg">Action Buttons (CTAs)</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label>Login Button Text</Label>
            <Input
              value={value.ctas?.login || ""}
              onChange={(e) => setCtas({ login: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Signup Button Text</Label>
            <Input
              value={value.ctas?.signup || ""}
              onChange={(e) => setCtas({ signup: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
