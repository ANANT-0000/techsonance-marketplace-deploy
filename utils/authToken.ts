import { ACCESS_TOKEN_KEY, isClient } from "@/constants";

import { cookies } from "next/headers";
export const authToken = async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get(ACCESS_TOKEN_KEY)?.value;
    if (!token) {
        throw new Error('Access token not found');
    }
    return token;
}