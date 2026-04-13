"use server"
import { ACCESS_TOKEN_KEY, BASE_API_URL } from "@/constants";
import { authToken } from "./authToken";
import { revalidatePath } from "next/cache";
import { companyDomain } from "@/config";
export const fetchVendorsProductsCategory = async (vendorId: string) => {
    try {
        const response = await fetch(`${BASE_API_URL}categories/${vendorId}`, {
            method: 'GET',
            cache: 'force-cache',
            next: { revalidate: 3600 },
        });
        if (response.status !== 200) {
            return { data: [], message: 'Failed to fetch product categories' };
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching product categories:', error);
        return { data: [], message: 'Error fetching product categories' };
    }
};
export const createVendorProductCategory = async (vendorId: string, categoryData: { name: string; description?: string }, companyId: string) => {
    try {

        console.log(categoryData);
        const response = await fetch(`${BASE_API_URL}categories/${vendorId}`, {
            method: 'POST',
            headers: {
                // Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ category: categoryData, companyId }),
        });
        if (response.status !== 201) {
            console.error('Failed to create product category');
        }
        revalidatePath(`/vendor/${vendorId}/categories`);
        return await response.json();
    }
    catch (error) {
        console.error('Error creating product category:', error);
        throw error;
    }
}
export const updateVendorProductCategory = async (vendorId: string, categoryId: string, categoryData: { name: string; description?: string }) => {
    try {
        const response = await fetch(`${BASE_API_URL}categories/${vendorId}/${categoryId}`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${await authToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ category: categoryData }),
        });
        if (response.status !== 200) {
            throw new Error('Failed to update product category');
        }
        revalidatePath(`/vendor/${vendorId}/categories`);
        return await response.json();
    }
    catch (error) {
        console.error('Error updating product category:', error);
        throw error;
    }
}
export const deleteVendorProductCategory = async (vendorId: string, categoryId: string) => {
    try {
        console.log('vendorId', vendorId);
        console.log('categoryId', categoryId);

        const response = await fetch(`${BASE_API_URL}categories/${vendorId}/${categoryId}`, {
            method: 'DELETE',
            headers: {
                // Authorization: `Bearer ${await authToken()}`,
            },
        });
        if (response.status !== 200) {
            console.error('Failed to delete product category');
        }
        console.log('delete successful');
        revalidatePath(`/vendor/${vendorId}/categories`);
        return await response.json();
    }
    catch (error) {
        console.error('Error deleting product category:', error);
        throw error;
    }
}
export const createProduct = async (productData: FormData, vendorId: string) => {
    try {
        const response = await fetch(`${BASE_API_URL}products/${vendorId}`, {
            method: 'POST',
            headers: {
                // Authorization: `Bearer ${await authToken()}`,
                'company-domain': companyDomain,
            },
            body: productData
        });
        if (!response.ok) {
            console.error('Failed to create product');
        }
        revalidatePath(`/vendor/${vendorId}/products`);
        return await response.json();
    } catch (error) {
        console.error('Error creating product:', error);
        throw error;
    }
}
export const fetchVendorProducts = async (vendorId: string) => {
    try {
        const response = await fetch(`${BASE_API_URL}products/all`, {
            method: 'GET',
            cache: 'force-cache',
            next: { revalidate: 3600 },

            headers: {
                'company-domain': companyDomain,
                // Authorization: `Bearer ${await authToken()}`,
            },
        });
        if (response.status !== 200) {
            console.error('Failed to fetch products');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}
export const fetchVendorOneProducts = async (id: string) => {
    try {
        const response = await fetch(`${BASE_API_URL}products/${id}`, {
            method: 'GET',
            cache: 'force-cache',
            next: { revalidate: 3600 },
            headers: {
                // Authorization: `Bearer ${await authToken()}`,
            },
        });
        if (response.status !== 200) {
            console.error('Failed to fetch products');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}
export const updateProduct = async (productId: string, productData: FormData, vendorId: string) => {
    try {
        const response = await fetch(`${BASE_API_URL}products/update/${productId}`, {
            method: 'PUT',
            headers: {
                'company-domain': companyDomain,
                // Authorization: `Bearer ${await authToken()}`,
            },
            body: productData
        });
        if (!response.ok) {
            console.error('Failed to update product');
        }
        revalidatePath(`/vendor/${vendorId}/products`);
        return await response.json();
    } catch (error) {
        console.error('Error updating product:', error);

    }
}
export const deleteProduct = async (productId: string, vendorId: string) => {
    try {
        const response = await fetch(`${BASE_API_URL}products/${productId}`, {
            method: 'DELETE',
            headers: {
                'company-domain': companyDomain,
                // Authorization: `Bearer ${await authToken()}`,    
            },
        });
        if (!response.ok) {
            console.error('Failed to delete product');
        }
        revalidatePath(`/vendor/${vendorId}/products`);
        revalidatePath(`/vendor/${vendorId}/products/${productId}`);
        return await response.json();
    } catch (error) {
        console.error('Error deleting product:', error);

    }
}

export const createProductVariant = async (variantData: FormData, vendorId: string, productId: string) => {
    try {
        const response = await fetch(`${BASE_API_URL}product-variant`, {
            method: "POST",
            body: variantData,
        });
        if (!response.ok) throw new Error("Failed to create variant");
        const res = await response.json();
        revalidatePath(`/vendor/${vendorId}/products/${productId}/variants`);
        return res;
    } catch (error) {
        console.error("Error creating product variant:", error);
    }
}
export const updateProductVariant = async (variantData: FormData, vendorId: string, productId: string, variantId: string) => {
    try {
        const response = await fetch(`${BASE_API_URL}product-variant/${variantId}`, {
            method: "PATCH",
            body: variantData,
        });
        if (!response.ok) throw new Error("Failed to create variant");
        const res = await response.json();
        revalidatePath(`/vendor/${vendorId}/products/${productId}/variants`);
        return res;
    } catch (error) {
        console.error("Error creating product variant:", error);
    }
}
export const fetchProductVariants = async (productId: string) => {
    try {
        const response = await fetch(`${BASE_API_URL}product-variant/${productId}`, {
            method: 'GET',
            cache: 'force-cache',
            next: { revalidate: 3600 },
            headers: {
                // Authorization: `Bearer ${await authToken()}`,
            },
        });
        console.log(response)
        if (response.status !== 200) {
            console.error('Failed to fetch product variants');
            return [];
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching product variants:', error);
        throw error;
    }
}
export const deleteProductVariant = async (productId: string, variantId: string, vendorId: string) => {
    try {
        const response = await fetch(`${BASE_API_URL}product-variant/${variantId}`, {
            method: 'DELETE',
            headers: {
                // Authorization: `Bearer ${await authToken()}`,    
            },
        });
        if (!response.ok) {
            console.error('Failed to delete product variant');
        }
        revalidatePath(`/vendor/${vendorId}/products/${productId}/variants`);
        revalidatePath(`/vendor/${vendorId}/products`);
        return await response.json();
    } catch (error) {
        console.error('Error deleting product variant:', error);
    }
}
export const fetchVariant = async (variantId: string, vendorId: string, productId: string) => {
    try {
        const response = await fetch(`${BASE_API_URL}product-variant/variant/${variantId}`, {
            method: 'GET',
            headers: {
                // Authorization: `Bearer ${await authToken()}`,
            },

        });
        if (response.status !== 200) {
            console.error('Failed to fetch variant data');

            return null;
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching variant data:', error);
    }
}