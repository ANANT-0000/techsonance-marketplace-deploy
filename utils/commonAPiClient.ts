import { BASE_API_URL } from "@/constants";
import { getCompanyDomain } from "@/lib/get-domain";

export const fetchProduct = async (productId: string) => {
    const companyDomain = await getCompanyDomain();
    console.log('company domain  in product by id', companyDomain)
    try {
        const response = await fetch(`${BASE_API_URL}products/${productId}`, {
            method: 'GET',
            // cache: "force-cache",
            // next: { revalidate: 3600 },
            headers: {
                'Content-Type': 'application/json',
                'company-domain': companyDomain,
            },
            // Authorization: `Bearer ${await authToken()}`,
        });
        console.log(response)
        if (response.status !== 200) {
            console.log('Failed to fetch product', response);
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
        const companyDomain = await getCompanyDomain();
        const response = await fetch(`${BASE_API_URL}product-variant/details/${id}`, {
            method: 'GET',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
                'company-domain': companyDomain,
            },
        });

        const result = await response.json(); // Renamed 'data' to 'result' for clarity

        if (response.status !== 200) {
            console.error('Failed to fetch product variant details:', result);
        }

        return {
            data: result.data,
            success: response.status === 200,
            message: result?.message || (response.status === 200 ? "Success" : "Failed")
        };
    } catch (error) {
        console.error('Error fetching product variants:', error);
        return { data: undefined, success: false, message: "Error occurred" };
    }
};
export const fetchProductVendorProducts = async () => {
    const companyDomain = await getCompanyDomain();
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
