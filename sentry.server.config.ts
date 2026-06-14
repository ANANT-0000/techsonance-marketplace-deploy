import * as Sentry from "@sentry/nextjs";
import { ENV_DEVELOPMENT } from "./constants";

if (process.env.NODE_ENV === ENV_DEVELOPMENT) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    tracesSampleRate: 1,

    sendDefaultPii: false,

    environment: process.env.NODE_ENV,
  });
}
