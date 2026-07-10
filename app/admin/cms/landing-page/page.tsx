"use client";

import { useState } from "react";
import { ThemeEditor } from "@/components/common/landingPageCms/ThemeEditor";
import { ContentEditor } from "@/components/common/landingPageCms/ContentEditor";
import {
  LandingCmsProvider,
  useLandingCms,
} from "@/contexts/LandingCmsContext";
import { PublishStatus, TabKey } from "@/constants/landingCms.core";
import { CMS_STRINGS } from "@/constants/landingCms.strings";

import { Button } from "@/components/ui/button";
import {
  Globe,
  EyeOff,
  Loader2,
  Paintbrush,
  FileText,
  Info,
  AlertTriangle,
} from "lucide-react";
import { Toaster } from "react-hot-toast";

function CMSHeaderSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="flex items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-2">
          <div className="h-7 w-64 animate-pulse rounded bg-muted" />
          <div className="h-4 w-96 animate-pulse rounded bg-muted/70" />
        </div>
        <div className="h-10 w-40 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="h-12 w-full animate-pulse rounded-xl bg-muted/60" />
    </div>
  );
}

function LandingPageCMSInner() {
  const { state, togglePublish } = useLandingCms();
  const [activeTab, setActiveTab] = useState<TabKey>(TabKey.Content);
  const [isToggling, setIsToggling] = useState(false);
  const [confirmingPublish, setConfirmingPublish] = useState(false);

  const performTogglePublish = async () => {
    try {
      setIsToggling(true);
      await togglePublish();
    } finally {
      setIsToggling(false);
      setConfirmingPublish(false);
    }
  };

  if (state.isLoading) {
    return (
      <div className="min-h-screen max-h-screen overflow-y-scroll p-6 md:p-10 mx-auto w-full">
        <CMSHeaderSkeleton />
      </div>
    );
  }

  const isPublished = state.publishStatus === PublishStatus.Live;
  const isDirty = state.isThemeDirty || state.contentDirtySections.size > 0;

  return (
    <div className="min-h-screen max-h-screen overflow-y-scroll p-6 md:p-10 mx-auto space-y-6 w-full">
      <Toaster position="top-right" />

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-border border-b pb-5">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Landing Page CMS
          </h1>
          <p className="text-muted-foreground text-sm">
            Configure layout content sections and adjust color presets of the
            public store landing.
          </p>
        </div>

        {/* Publish Toggle */}
        <div className="flex items-center gap-3 bg-card border border-border rounded-lg p-2 px-3.5 shadow-sm shrink-0">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                state.publishStatus === PublishStatus.Live
                  ? "bg-emerald-500 animate-pulse"
                  : state.publishStatus === PublishStatus.Draft
                    ? "bg-amber-500"
                    : "bg-muted-foreground"
              }`}
            />
            <span className="text-foreground text-xs">
              Status:{" "}
              <span className="font-bold text-foreground">
                {state.publishStatus === PublishStatus.Live
                  ? CMS_STRINGS.statusLive
                  : state.publishStatus === PublishStatus.Draft
                    ? CMS_STRINGS.statusDraft
                    : CMS_STRINGS.statusUnknown}
              </span>
            </span>
          </div>
          <div className="w-[1px] h-6 bg-border" />
          {confirmingPublish ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {isPublished
                  ? CMS_STRINGS.publishConfirmTitleLive
                  : CMS_STRINGS.publishConfirmTitleDraft}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => setConfirmingPublish(false)}
                disabled={isToggling}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs font-semibold"
                onClick={performTogglePublish}
                disabled={isToggling}
              >
                {isToggling && (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                )}
                Confirm
              </Button>
            </div>
          ) : (
            <Button
              variant={isPublished ? "outline" : "default"}
              size="sm"
              onClick={() => setConfirmingPublish(true)}
              className="h-8 text-xs font-semibold px-4"
              disabled={isDirty && !isPublished}
              title={
                isDirty && !isPublished
                  ? "Please save changes before publishing."
                  : ""
              }
            >
              {isPublished ? (
                <EyeOff className="h-3.5 w-3.5 mr-1.5" />
              ) : (
                <Globe className="h-3.5 w-3.5 mr-1.5" />
              )}
              {isPublished ? "Unpublish" : "Go Live"}
            </Button>
          )}
        </div>
      </div>

      {state.publishStatus === PublishStatus.Unknown && (
        <div className="flex gap-3 items-start p-4 border rounded-xl bg-destructive/5 border-destructive/20 text-sm shadow-sm">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-xs text-destructive/90 leading-relaxed">
            {CMS_STRINGS.unknownStatusWarning}
          </p>
        </div>
      )}

      {/* Tip Banner */}
      <div className="flex gap-3 items-start p-4 border rounded-xl bg-primary/5 border-border/15 text-sm shadow-sm">
        <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-foreground text-xs tracking-wide uppercase">
            Pro-Tip for Admins:
          </span>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {CMS_STRINGS.proTipAdmin}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div
          className="flex space-x-6"
          role="tablist"
          aria-label="Landing page CMS sections"
        >
          <button
            type="button"
            role="tab"
            id="cms-tab-content"
            aria-selected={activeTab === TabKey.Content}
            aria-controls="cms-panel-content"
            onClick={() => setActiveTab(TabKey.Content)}
            className={`flex items-center gap-2 pb-4 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === TabKey.Content
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="h-4 w-4" />
            Content Sections
            {state.contentDirtySections.size > 0 && (
              <span className="h-2 w-2 rounded-full bg-blue-600" />
            )}
          </button>
          <button
            type="button"
            role="tab"
            id="cms-tab-theme"
            aria-selected={activeTab === TabKey.Theme}
            aria-controls="cms-panel-theme"
            onClick={() => setActiveTab(TabKey.Theme)}
            className={`flex items-center gap-2 pb-4 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === TabKey.Theme
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Paintbrush className="h-4 w-4" />
            Theme Colors
            {state.isThemeDirty && (
              <span className="h-2 w-2 rounded-full bg-blue-600" />
            )}
          </button>
        </div>
      </div>

      {/* Both editors kept mounted to preserve inner state and context connectivity */}
      <div className="mt-6">
        <div
          className={activeTab === TabKey.Theme ? "block" : "hidden"}
          role="tabpanel"
          id="cms-panel-theme"
          aria-labelledby="cms-tab-theme"
        >
          <ThemeEditor />
        </div>
        <div
          className={activeTab === TabKey.Content ? "block" : "hidden"}
          role="tabpanel"
          id="cms-panel-content"
          aria-labelledby="cms-tab-content"
        >
          <ContentEditor />
        </div>
      </div>
    </div>
  );
}

export default function LandingPageCMS() {
  return (
    <LandingCmsProvider>
      <LandingPageCMSInner />
    </LandingCmsProvider>
  );
}
