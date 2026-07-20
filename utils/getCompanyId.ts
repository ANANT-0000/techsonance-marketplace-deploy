import { USER_STORAGE_KEY } from "@/constants";
import { User, VendorUser } from "./Types";

export const getClientCompanyId = (): string | null => {
  if (typeof window !== "undefined") {
    try {
      const userStr = localStorage.getItem(USER_STORAGE_KEY);
      if (userStr) {
        const user = JSON.parse(userStr) as User | VendorUser;
        if ("company_id" in user) {
          return user.company_id;
        }
      }
    } catch (e) {}
  }
  return null;
};
