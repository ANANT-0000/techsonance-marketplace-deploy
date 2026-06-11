import * as Sentry from "@sentry/nextjs";

if (process.env.NODE_ENV === "development") {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    tracesSampleRate: 1,

    sendDefaultPii: false,

    environment: process.env.NODE_ENV,
  });
}