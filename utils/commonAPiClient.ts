import { companyDomain } from "@/config";
import { BASE_API_URL } from "@/constants";

export const fetchProduct = async (productId: string) => {
    try {
        const response = await fetch(`${BASE_API_URL}products/${productId}`, {
            method: 'GET',
            cache: "force-cache",
            next: { revalidate: 3600 },
        });
        if (response.status !== 200) {
            console.error('Failed to fetch product');
        }
        console.log("Product Response:", response);
        return await response.json();
    } catch (error) {
        console.log('Error fetching product:', error);
        // throw error;
    }
}
export const fetchProductVariantDetails = async (id: string) => {
    try {
        const response = await fetch(`${BASE_API_URL}product-variant/details/${id}`, {
            method: 'GET',
            cache: "force-cache",
            next: { revalidate: 3600 },
            headers: {
                'Content-Type': 'application/json',
                'company-domain': companyDomain,
                // Authorization: `Bearer ${await authToken()}`,
            },
        });
        const data = await response.json();
        if (response.status !== 200) {
            console.error('Failed to fetch product variant details:', data);
        }
        return {
            data: data,
            success: response.status === 200
        };
    } catch (error) {
        console.error('Error fetching product variants:', error);
        return {
            data: undefined,
            success: false,
            message: "Failed to fetch product variant details."
        };
    }
};
export const fetchProductVendorProducts = async () => {
    try {
        const response = await fetch(`${BASE_API_URL}products/all`, {
            method: 'GET',
            cache: "force-cache",
            next: { revalidate: 3600 },
            headers: {
                'Content-Type': 'application/json',
                'company-domain': companyDomain,
                // Authorization: `Bearer ${await authToken()}`,
            },

        });
        if (response.status !== 200) {
            console.log('Failed to fetch vendor products');
        }
        console.log("Vendor Products Response:", response);
        return await response.json();
    } catch (error) {
        console.log('Error fetching vendor products:', error);
        return [];
    }
}
