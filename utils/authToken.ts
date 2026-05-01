import { ACCESS_TOKEN_KEY } from "@/constants";

export const authToken = () => {
    if (typeof window !== 'undefined') {
        if (!localStorage.getItem(ACCESS_TOKEN_KEY)) {
            return null;
        }
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    }
    return null;
}