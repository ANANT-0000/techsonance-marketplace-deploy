import { companyDomain } from "@/config";
import { ENV_DEVELOPMENT } from "@/constants";

export const getCompanyDomain = async (): Promise<string> => {
  const isDev = process.env.NODE_ENV === ENV_DEVELOPMENT;
  let rawHost = "";

  if (typeof window === "undefined") {
    const { headers } = await import("next/headers");
    const headersList = await headers();
    rawHost = headersList.get("host")?.split(":")[0] || "";
  } else {
    // window.location.hostname is a synchronous, free property read.
    // Do NOT cache this at module level — on Vercel, warm Lambda instances
    // can be reused across requests from different tenants, causing the
    // wrong company-domain to be sent to the backend.
    rawHost = window.location.hostname;
  }

  if (!rawHost) {
    return isDev ? companyDomain : "";
  }

  if (isDev && rawHost === "localhost") {
    return companyDomain;
  }

  return rawHost;
};

export const isAdminDomainAllowed = async (): Promise<boolean> => {
  const allowedDomainsEnv = process.env.NEXT_PUBLIC_ADMIN_ALLOWED_DOMAINS;
  if (!allowedDomainsEnv) {
    return false; // Access denied if allowed domains are not explicitly configured
  }

  // Strip single or double quotes around the env variable string if they exist
  const cleanedEnv = allowedDomainsEnv.replace(/['"]/g, "");
  const allowedList = cleanedEnv
    .split(",")
    .filter((d) => d.trim().length > 0)
    .map((d) => d.trim().toLowerCase());

  // Get the actual hostname (e.g. localhost, admin.techsonance.co.in) to verify against allowedList,
  // rather than getCompanyDomain() which returns a mock UUID in local dev.
  let actualHostname = "";
  if (typeof window === "undefined") {
    const { headers } = await import("next/headers");
    const headersList = await headers();
    actualHostname = headersList.get("host")?.split(":")[0] || "";
  } else {
    actualHostname = window.location.hostname;
  }

  return allowedList.includes(actualHostname.toLowerCase());
};
