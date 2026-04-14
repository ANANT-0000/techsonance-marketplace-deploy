import { ACCESS_TOKEN_KEY } from "@/constants";
import { cookies } from "next/headers";

export const authToken = async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get(ACCESS_TOKEN_KEY)?.value;

    // Return null instead of throwing an error
    if (!token) {
        return null;
    }

    return token;
}