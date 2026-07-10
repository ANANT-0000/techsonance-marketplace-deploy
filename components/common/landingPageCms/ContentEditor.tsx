"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "react-hot-toast";
import {
  Loader2,
  Save,
  Sparkles,
  Layers,
  DollarSign,
  MessageSquare,
  HelpCircle,
  BarChart3,
  Image as ImageIcon,
  Link2,
  Megaphone,
  Footprints,
  Tag,
  AlertTriangle,
  RefreshCw,
  Layout,
  Search,
} from "lucide-react";

import { useLandingCms } from "@/contexts/LandingCmsContext";
import { CmsActionType, SectionKey } from "@/contexts/LandingCmsContext";
import { CMS_STRINGS } from "@/constants/landingCms.strings";

import { HeroEditor } from "./HeroEditor";
import { FaqEditor } from "./FaqEditor";
import { TestimonialsEditor } from "./TestimonialsEditor";
import { NavbarEditor } from "./NavbarEditor";
import {
  CtaEditor,
  StatsEditor,
  TickerEditor,
  IntegrationsEditor,
} from "./SimpleEditors";
import { FooterEditor, ShowcaseEditor, FeaturesEditor } from "./ComplexEditors";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// ─── Inline Fallback Editors for Navbar and Metadata ────────────────────────────

function MetadataEditor({
  value,
  onChange,
}: {
  value: any;
  onChange: (v: any) => void;
}) {
  const set = (patch: any) => onChange({ ...value, ...patch });
  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Search className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">SEO & Metadata</h3>
      </div>
      <div className="grid gap-1.5">
        <Label>Page Title</Label>
        <Input
          value={value.title || ""}
          onChange={(e) => set({ title: e.target.value })}
        />
      </div>
      <div className="grid gap-1.5">
        <Label>Page Description</Label>
        <Textarea
          value={value.description || ""}
          onChange={(e) => set({ description: e.target.value })}
          rows={3}
          className="resize-none"
        />
      </div>
    </div>
  );
}
// ────────────────────────────────────────────────────────────────────────────────

const SECTIONS = [
  { key: "navbar", label: "Navbar", icon: Layout },
  { key: "metadata", label: "SEO", icon: Search },
  { key: "hero", label: "Hero", icon: Sparkles },
  { key: "features", label: "Features", icon: Layers },
  { key: "testimonials", label: "Testimonials", icon: MessageSquare },
  { key: "faq", label: "FAQ", icon: HelpCircle },
  { key: "stats", label: "Stats", icon: BarChart3 },
  { key: "showcase", label: "Showcase", icon: ImageIcon },
  { key: "integrations", label: "Integrations", icon: Link2 },
  { key: "cta", label: "CTA", icon: Megaphone },
  { key: "footer", label: "Footer", icon: Footprints },
  { key: "ticker", label: "Ticker", icon: Tag },
] as const;

function ContentTabsSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="flex flex-wrap gap-1 rounded-3xl border border-border bg-card/80 p-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-9 w-24 animate-pulse rounded-2xl bg-muted"
          />
        ))}
      </div>
      <div className="min-h-[300px] animate-pulse rounded-3xl border border-border bg-card p-5">
        <div className="h-4 w-48 rounded bg-muted" />
        <div className="mt-4 h-24 rounded-xl bg-muted/60" />
      </div>
    </div>
  );
}

export function ContentEditor() {
  const { state, dispatch, saveContent, fetchData } = useLandingCms();
  const {
    isLoading,
    isContentSaving,
    loadFailed,
    ignoreLoadError,
    contentDirtySections,
    contentSaveConflict,
    companyLogoUrl,
    content,
  } = state;

  const [activeSection, setActiveSection] = useState<SectionKey>("hero");

  const isDirty = contentDirtySections.size > 0;
  const isEditingDisabled = loadFailed && !ignoreLoadError;

  const handleSave = async () => {
    await saveContent();
  };

  const handleDiscardAndReload = () => {
    fetchData();
  };

  if (isLoading) {
    return <ContentTabsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {loadFailed && !ignoreLoadError && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {CMS_STRINGS.contentLoadErrorBanner}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={fetchData}
            >
              Retry
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() =>
                dispatch({ type: CmsActionType.IGNORE_LOAD_ERROR })
              }
            >
              Edit Anyway (Danger)
            </Button>
          </div>
        </div>
      )}

      {contentSaveConflict && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 shrink-0" />
            {CMS_STRINGS.saveConflictWarning}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
              onClick={handleDiscardAndReload}
            >
              Discard my changes &amp; reload
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-border bg-card/80 p-2 shadow-sm overflow-x-auto">
        <div
          className="flex flex-wrap gap-1 min-w-max"
          role="tablist"
          aria-label="Landing page sections"
        >
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.key;
            const sectionDirty = contentDirtySections.has(section.key);
            return (
              <button
                key={section.key}
                type="button"
                role="tab"
                id={`tab-${section.key}`}
                aria-selected={isActive}
                aria-controls={`panel-${section.key}`}
                onClick={() => setActiveSection(section.key)}
                disabled={isEditingDisabled}
                className={`relative flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${isActive ? "text-white" : "text-muted-foreground"}`}
                />
                {section.label}
                {sectionDirty && (
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-white" : "bg-blue-600"}`}
                    aria-label="Unsaved changes"
                    title="Unsaved changes"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div
        role="tabpanel"
        id={`panel-${activeSection}`}
        aria-labelledby={`tab-${activeSection}`}
        className={`min-h-[400px] rounded-3xl border border-border bg-card p-5 shadow-sm transition-opacity ${isEditingDisabled ? "opacity-50 pointer-events-none" : ""}`}
      >
        {activeSection === "navbar" && (
          <NavbarEditor
            value={content.navbar}
            companyLogoUrl={companyLogoUrl}
            onChange={(v) =>
              dispatch({
                type: CmsActionType.SET_SECTION_CONTENT,
                payload: { key: "navbar", value: v },
              })
            }
          />
        )}
        {activeSection === "metadata" && (
          <MetadataEditor
            value={content.metadata}
            onChange={(v) =>
              dispatch({
                type: CmsActionType.SET_SECTION_CONTENT,
                payload: { key: "metadata", value: v },
              })
            }
          />
        )}
        {activeSection === "hero" && (
          <HeroEditor
            value={content.hero}
            onChange={(v) =>
              dispatch({
                type: CmsActionType.SET_SECTION_CONTENT,
                payload: { key: "hero", value: v },
              })
            }
          />
        )}
        {activeSection === "features" && (
          <FeaturesEditor
            value={content.features}
            onChange={(v) =>
              dispatch({
                type: CmsActionType.SET_SECTION_CONTENT,
                payload: { key: "features", value: v },
              })
            }
          />
        )}
        {activeSection === "testimonials" && (
          <TestimonialsEditor
            value={content.testimonials}
            onChange={(v) =>
              dispatch({
                type: CmsActionType.SET_SECTION_CONTENT,
                payload: { key: "testimonials", value: v },
              })
            }
          />
        )}
        {activeSection === "faq" && (
          <FaqEditor
            value={content.faq}
            onChange={(v) =>
              dispatch({
                type: CmsActionType.SET_SECTION_CONTENT,
                payload: { key: "faq", value: v },
              })
            }
          />
        )}
        {activeSection === "stats" && (
          <StatsEditor
            value={content.stats}
            onChange={(v) =>
              dispatch({
                type: CmsActionType.SET_SECTION_CONTENT,
                payload: { key: "stats", value: v },
              })
            }
          />
        )}
        {activeSection === "showcase" && (
          <ShowcaseEditor
            value={content.showcase}
            onChange={(v) =>
              dispatch({
                type: CmsActionType.SET_SECTION_CONTENT,
                payload: { key: "showcase", value: v },
              })
            }
          />
        )}
        {activeSection === "integrations" && (
          <IntegrationsEditor
            value={content.integrations}
            onChange={(v) =>
              dispatch({
                type: CmsActionType.SET_SECTION_CONTENT,
                payload: { key: "integrations", value: v },
              })
            }
          />
        )}
        {activeSection === "cta" && (
          <CtaEditor
            value={content.cta}
            onChange={(v) =>
              dispatch({
                type: CmsActionType.SET_SECTION_CONTENT,
                payload: { key: "cta", value: v },
              })
            }
          />
        )}
        {activeSection === "footer" && (
          <FooterEditor
            value={content.footer}
            onChange={(v) =>
              dispatch({
                type: CmsActionType.SET_SECTION_CONTENT,
                payload: { key: "footer", value: v },
              })
            }
          />
        )}
        {activeSection === "ticker" && (
          <TickerEditor
            value={content.ticker}
            onChange={(v) =>
              dispatch({
                type: CmsActionType.SET_SECTION_CONTENT,
                payload: { key: "ticker", value: v },
              })
            }
          />
        )}
      </div>

      <div className="sticky bottom-0 left-0 right-0 z-10 mt-8 flex items-center justify-between rounded-2xl border border-border bg-background/90 p-4 shadow-lg backdrop-blur-md">
        <p className="text-sm text-muted-foreground">
          {isDirty ? (
            <span className="font-medium text-foreground">
              {contentDirtySections.size} section
              {contentDirtySections.size > 1 ? "s" : ""}{" "}
              {CMS_STRINGS.unsavedChangesSuffix}
            </span>
          ) : (
            CMS_STRINGS.noUnsavedChanges
          )}
        </p>
        <Button
          onClick={handleSave}
          disabled={isContentSaving || isEditingDisabled || !isDirty}
          size="lg"
          className="min-w-[150px] shadow-sm font-semibold"
        >
          {isContentSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isContentSaving ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
