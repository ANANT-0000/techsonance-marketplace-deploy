import { companyDomain } from "@/config";
import { ENV_DEVELOPMENT } from "@/constants";

let clientCached: string | null = null;

export const getCompanyDomain = async (): Promise<string> => {
  const isDev = process.env.NODE_ENV === ENV_DEVELOPMENT;
  let rawHost = "";

  if (typeof window === "undefined") {
    const { headers } = await import("next/headers");
    const headersList = await headers();
    rawHost = headersList.get("host")?.split(":")[0] || "";
  } else {
    if (clientCached) return clientCached;
    rawHost = window.location.hostname;
  }

  if (!rawHost) {
    return isDev ? companyDomain : "";
  }

  if (isDev && rawHost === "localhost") {
    return companyDomain;
  }

  if (typeof window !== "undefined") {
    clientCached = rawHost;
  }

  return rawHost;
};
