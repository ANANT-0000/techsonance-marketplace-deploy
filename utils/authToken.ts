import { ACCESS_TOKEN_KEY } from "@/constants";

export const authToken = () => {
  // Client-side: Return the token from localStorage so legacy client checks pass
  if (typeof window !== "undefined") {
    return localStorage.getItem(ACCESS_TOKEN_KEY) || null;
  }

  // Server-side (SSR of Client Components):
  // We cannot use cookies().get() synchronously in Next.js 16.2.
  // Returning a placeholder prevents aggressive client-side route guards
  // (like `if (!token) redirect()`) from falsely triggering during SSR.
  return null;
};
