export const CMS_STRINGS = {
  // Page Shell
  publishConfirmTitleLive: "Unpublish this page?",
  publishConfirmTitleDraft: "Make this page live?",
  publishSuccess: "🚀 Landing page is now LIVE!",
  unpublishSuccess: "Landing page is now unpublished (draft mode).",
  publishError: "Failed to toggle publish state.",
  statusLive: "Live",
  statusDraft: "Draft Mode",
  statusUnknown: "Unknown — couldn't confirm",
  unknownStatusWarning: "Couldn't confirm whether this page is live or in draft mode — the status shown here may be out of date. Refresh before publishing.",
  proTipAdmin: "Changes saved inside configuration tabs are applied instantly to your working draft. Visitors will not see them until you click Go Live.",

  // Theme Editor
  themeSaveSuccess: "Landing page theme colors have been updated successfully.",
  themeSaveError: "An error occurred while saving the theme.",
  themeLoadError: "Failed to load theme configuration.",
  themeResetWarning: "Are you sure you want to revert all unsaved theme changes to the currently live version?",

  // Content Editor
  contentSaveSuccess: "Landing page saved successfully!",
  contentSaveError: "Failed to save. Please check your connection.",
  contentLoadError: "Failed to load landing page content.",
  contentLoadErrorBanner: "Content failed to load. Editing is disabled until this succeeds, so you don't accidentally save over your real content.",
  saveConflictWarning: "Someone else saved changes to this page since you loaded it. Your edits weren't saved to avoid overwriting theirs.",
  unsavedChangesSuffix: "with unsaved changes",
  noUnsavedChanges: "No unsaved changes",
  
  // Validation Messages
  urlInvalid: "Please enter a valid URL.",
  urlNotAllowed: "This domain is not permitted for embeds.",
};

export interface ThemePreset {
  name: string;
  primary: string;
  secondary: string;
  background: string;
  text: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    name: "Classic Blue",
    primary: "#3b82f6",
    secondary: "#1d4ed8",
    background: "#ffffff",
    text: "#1e293b",
  },
  {
    name: "Emerald Forest",
    primary: "#10b981",
    secondary: "#047857",
    background: "#f8fafc",
    text: "#0f172a",
  },
  {
    name: "Vibrant Indigo",
    primary: "#6366f1",
    secondary: "#4338ca",
    background: "#ffffff",
    text: "#1e293b",
  },
  {
    name: "Sunset Rose",
    primary: "#f43f5e",
    secondary: "#be123c",
    background: "#fff1f2",
    text: "#4c0519",
  },
  {
    name: "Classic Midnight",
    primary: "#818cf8",
    secondary: "#4f46e5",
    background: "#0f172a",
    text: "#f8fafc",
  },
];
