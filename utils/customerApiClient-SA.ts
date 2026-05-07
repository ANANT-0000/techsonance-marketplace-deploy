'use server';
import { BASE_API_URL } from "@/constants";
import { getCompanyDomain } from "@/lib/get-domain";
import { revalidatePath } from "next/cache";

export const fetchInitCheckout = async (userId: string, initPayload: any) => {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(
        `${BASE_API_URL}/v1/checkout/${userId}/initiate`,
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
    const response = await fetch(`${BASE_API_URL}/v1/checkout/verify`, {
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
export const fetchCreateUserAddress = async (customerId: string, addressData: any) => {
    try {
        const response = await fetch(`${BASE_API_URL}/v1/address/customer/${customerId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // "company-domain": companyDomain,
                // Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(addressData),
        });
        console.warn(response)
        if (response.status !== 201) {
            console.log('Failed to create address');
            return {
                success: false,
                message: 'Failed to create address',
                data: null
            }
        }
        revalidatePath(`/customerProfile/${customerId}/addresses`);
        const responseData = await response.json();
        return {
            success: true,
            message: 'Address created successfully',
            data: responseData
        };
    } catch (error) {
        console.log('Error creating address:', error);
    }
}
export const fetchUpdateUserAddress = async (customerId: string, addressId: string, addressData: any) => {
    try {
        console.log("customerId", customerId, '\n address id', addressId)
        const response = await fetch(`${BASE_API_URL}/v1/address/customer/${customerId}/${addressId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                // "company-domain": companyDomain,
                // Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(addressData),
        });
        console.warn(response)
        if (response.status !== 202) {
            console.log('Failed to update address');
            return {
                success: false,
                message: 'Failed to update address'
            }
        }
        revalidatePath(`/customerProfile/${customerId}/addresses`);
        const responseData = await response.json();
        return {
            success: true,
            message: 'Address updated successfully',
            data: responseData
        };
    }
    catch (error) {
        console.log('Error updating address:', error);
    }
}
export const fetchDeleteUserAddress = async (customerId: string, addressId: string) => {
    try {
        console.log(customerId, addressId)
        const response = await fetch(`${BASE_API_URL}/v1/address/customer/${customerId}/${addressId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                // "company-domain": companyDomain,
                // Authorization: `Bearer ${token}`,
            },
        });
        if (response.status !== 200) {
            console.log('Failed to delete address');
            return;
        }
        revalidatePath(`/customerProfile/${customerId}/addresses`);
        return await response.json();
    }
    catch (error) {
        console.log('Error deleting address:', error);
    }
}