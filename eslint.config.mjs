import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals.js";
import nextTs from "eslint-config-next/typescript.js";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Tooling configs that intentionally use console
    "wdyr.ts",
    "sentry.*.config.ts",
    "instrumentation*.ts",
  ]),
  {
    // ── PR hygiene rules ─────────────────────────────────────────────────
    rules: {
      /** Warn on any console.* call so stray debug logs surface in CI. */
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      /** Hard-fail on leftover debugger statements. */
      "no-debugger": "error",
      /** Warn on alert / confirm / prompt (uncommon in Next.js but good to catch). */
      "no-alert": "warn",
    },
  },
]);

export default eslintConfig;
