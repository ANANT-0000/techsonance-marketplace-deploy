"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Palette, RefreshCw } from "lucide-react";

import { useLandingCms } from "@/contexts/LandingCmsContext";
import { CmsActionType } from "@/contexts/LandingCmsContext";
import { CMS_STRINGS, THEME_PRESETS, ThemePreset } from "@/constants/landingCms.strings";

export function ThemeEditor() {
  const { state, dispatch, saveTheme, fetchData } = useLandingCms();
  const { isLoading, isThemeSaving, isThemeDirty, theme, loadFailed } = state;
  const [confirmingReset, setConfirmingReset] = useState(false);

  const handleSave = async () => {
    await saveTheme();
  };

  const applyPreset = (preset: ThemePreset) => {
    dispatch({ 
      type: CmsActionType.APPLY_THEME_PRESET, 
      payload: {
        primary_color: preset.primary,
        secondary_color: preset.secondary,
        background_color: preset.background,
        text_color: preset.text,
      }
    });
  };

  const performReset = async () => {
    setConfirmingReset(false);
    await fetchData();
  };

  if (isLoading) {
    return (
      <div className="flex h-60 items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading theme configurations…</span>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-12 w-full ">
      {loadFailed && (
        <div className="lg:col-span-12 p-4 border rounded-xl bg-destructive/5 border-destructive/20 text-sm shadow-sm text-destructive font-medium">
          {CMS_STRINGS.themeLoadError}
        </div>
      )}

      {/* Editor Controls */}
      <div className="space-y-6 lg:col-span-7">
        {/* Preset Palettes */}
        <div className="p-6 border-border rounded-xl bg-card space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">Curated Color Presets</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Instantly set color palettes compiled by design experts.
          </p>
          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
            {THEME_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset)}
                className="flex flex-col items-start p-2.5 border-border rounded-lg hover:border-primary transition-all text-left bg-background hover:shadow-sm space-y-1.5"
              >
                <span className="text-xs font-semibold">{preset.name}</span>
                <div className="flex gap-1 items-center">
                  <span
                    className="h-3.5 w-3.5 rounded-full border-border shadow-sm"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <span
                    className="h-3.5 w-3.5 rounded-full border-border shadow-sm"
                    style={{ backgroundColor: preset.secondary }}
                  />
                  <span
                    className="h-3.5 w-3.5 rounded-full border-border shadow-sm"
                    style={{ backgroundColor: preset.background }}
                  />
                  <span
                    className="h-3.5 w-3.5 rounded-full border-border shadow-sm"
                    style={{ backgroundColor: preset.text }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Color Inputs */}
        <div className="p-6 border-border rounded-xl bg-card space-y-6 shadow-sm">
          <h2 className="font-semibold text-lg border-border  border-b pb-2">
            Custom Color Tokens
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="primary">Primary Accent</Label>
              <div className="flex gap-3 items-center">
                <Input
                  id="primary"
                  type="color"
                  value={theme.primary_color}
                  onChange={(e) =>
                    dispatch({
                      type: CmsActionType.SET_THEME_COLOR,
                      payload: { key: "primary_color", value: e.target.value },
                    })
                  }
                  className="w-12 h-10 p-1 cursor-pointer shrink-0 border-border rounded-md"
                />
                <Input
                  value={theme.primary_color}
                  onChange={(e) =>
                    dispatch({
                      type: CmsActionType.SET_THEME_COLOR,
                      payload: { key: "primary_color", value: e.target.value },
                    })
                  }
                  className="font-mono uppercase h-10 text-sm"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="secondary">Secondary Accent</Label>
              <div className="flex gap-3 items-center">
                <Input
                  id="secondary"
                  type="color"
                  value={theme.secondary_color}
                  onChange={(e) =>
                    dispatch({
                      type: CmsActionType.SET_THEME_COLOR,
                      payload: {
                        key: "secondary_color",
                        value: e.target.value,
                      },
                    })
                  }
                  className="w-12 h-10 p-1 cursor-pointer shrink-0 border-border rounded-md"
                />
                <Input
                  value={theme.secondary_color}
                  onChange={(e) =>
                    dispatch({
                      type: CmsActionType.SET_THEME_COLOR,
                      payload: {
                        key: "secondary_color",
                        value: e.target.value,
                      },
                    })
                  }
                  className="font-mono uppercase h-10 text-sm"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="background">Page Background</Label>
              <div className="flex gap-3 items-center">
                <Input
                  id="background"
                  type="color"
                  value={theme.background_color}
                  onChange={(e) =>
                    dispatch({
                      type: CmsActionType.SET_THEME_COLOR,
                      payload: {
                        key: "background_color",
                        value: e.target.value,
                      },
                    })
                  }
                  className="w-12 h-10 p-1 cursor-pointer shrink-0 border-border rounded-md"
                />
                <Input
                  value={theme.background_color}
                  onChange={(e) =>
                    dispatch({
                      type: CmsActionType.SET_THEME_COLOR,
                      payload: {
                        key: "background_color",
                        value: e.target.value,
                      },
                    })
                  }
                  className="font-mono uppercase h-10 text-sm"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="text">Primary Text</Label>
              <div className="flex gap-3 items-center">
                <Input
                  id="text"
                  type="color"
                  value={theme.text_color}
                  onChange={(e) =>
                    dispatch({
                      type: CmsActionType.SET_THEME_COLOR,
                      payload: { key: "text_color", value: e.target.value },
                    })
                  }
                  className="w-12 h-10 p-1 cursor-pointer shrink-0 border-border rounded-md"
                />
                <Input
                  value={theme.text_color}
                  onChange={(e) =>
                    dispatch({
                      type: CmsActionType.SET_THEME_COLOR,
                      payload: { key: "text_color", value: e.target.value },
                    })
                  }
                  className="font-mono uppercase h-10 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground pl-2">
            {isThemeDirty ? (
              <span className="font-medium text-foreground">
                Unsaved changes
              </span>
            ) : (
              "No unsaved changes"
            )}
          </p>
          <div className="flex justify-end gap-3">
            {confirmingReset ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{CMS_STRINGS.themeResetWarning}</span>
                <Button variant="outline" size="sm" onClick={() => setConfirmingReset(false)}>Cancel</Button>
                <Button variant="destructive" size="sm" onClick={performReset}>Confirm Reset</Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setConfirmingReset(true)}
                disabled={isLoading || !isThemeDirty}
                className="flex items-center gap-1.5"
              >
                <RefreshCw className="h-4 w-4" /> Reset
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={isThemeSaving || !isThemeDirty}
              className="min-w-[120px]"
            >
              {isThemeSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Colors
            </Button>
          </div>
        </div>
      </div>

      {/* Live Visual Preview */}
      <div className="lg:col-span-5 space-y-4">
        <div className="p-4 border-border rounded-xl bg-card space-y-4 shadow-sm h-full flex flex-col">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Live Preview Mockup
          </h3>
          <div
            className="flex-1 min-h-[300px] border-border rounded-lg p-6 flex flex-col justify-between transition-all"
            style={{
              backgroundColor: theme.background_color,
              color: theme.text_color,
            }}
          >
            {/* Mock Header */}
            <div className="flex justify-between items-center pb-4 border-border  border-b border-muted/20">
              <span className="font-bold text-sm">
                Techso<span style={{ color: theme.primary_color }}>nance</span>
              </span>
              <div className="flex gap-3 text-xs">
                <span>Features</span>
                <span>Pricing</span>
              </div>
            </div>

            {/* Mock Hero content */}
            <div className="space-y-4 my-8 text-center sm:text-left">
              <span
                className="inline-block text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full border"
                style={{
                  color: theme.primary_color,
                  borderColor: theme.primary_color,
                }}
              >
                Launch Faster
              </span>
              <h1 className="text-2xl font-extrabold tracking-tight leading-tight">
                Launch Your Branded{" "}
                <span style={{ color: theme.primary_color }}>Online Store</span>
              </h1>
              <p className="text-xs opacity-80 max-w-sm">
                No coding required. Sell to customers globally with your own
                domain and branding.
              </p>
            </div>

            {/* Mock CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-muted/20">
              <button
                type="button"
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-md shadow-sm transition-all hover:opacity-90 text-white"
                style={{ backgroundColor: theme.primary_color }}
              >
                Start Free Trial
              </button>
              <button
                type="button"
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-md shadow-sm transition-all border-border hover:bg-muted/10 bg-transparent"
                style={{
                  borderColor: theme.secondary_color,
                  color: theme.secondary_color,
                }}
              >
                Build My Store
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
