import { BASE_API_URL } from "@/constants";

export const fetchProduct = async (productId: string) => {
    try {
        const response = await fetch(`${BASE_API_URL}products/${productId}`, {
            method: 'GET',
        });
        if (response.status !== 200) {
            console.error('Failed to fetch product');
        }
        console.log("Product Response:", response);
        return await response.json();
    } catch (error) {
        console.error('Error fetching product:', error);
        throw error;
    }
}

