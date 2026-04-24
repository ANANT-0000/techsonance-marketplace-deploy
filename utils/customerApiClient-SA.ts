'use server';
import { BASE_API_URL } from "@/constants";
import { getCompanyDomain } from "@/lib/get-domain";
import { revalidatePath } from "next/cache";

export const fetchInitCheckout = async (userId: string, initPayload: any) => {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(
        `${BASE_API_URL}checkout/${userId}/initiate`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'company-domain': companyDomain,
            },
            body: JSON.stringify(initPayload),
        }
    );
    return await response.json();

}
export const fetchVerifyPayment = async (userId: string, verifyPayload: any) => {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(`${BASE_API_URL}checkout/verify`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'company-domain': companyDomain,
        },
        body: JSON.stringify(verifyPayload),
    });
    revalidatePath(`/customerProfile`);
    return await response.json();
}