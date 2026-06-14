import * as Sentry from "@sentry/nextjs";
import { ENV_DEVELOPMENT } from "./constants";

export async function register() {
  if (process.env.NODE_ENV !== ENV_DEVELOPMENT) {
    return;
  }

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError =
  process.env.NODE_ENV === ENV_DEVELOPMENT
    ? Sentry.captureRequestError
    : undefined;
