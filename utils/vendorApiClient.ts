"use server"
import { ACCESS_TOKEN_KEY, BASE_API_URL } from "@/constants";
import { authToken } from "./authToken";

import { revalidatePath } from "next/cache";
export const fetchVendorsProductsCategory = async (vendorId: string) => {

    try {

        // console.log(`Fetching product categories for vendor ${vendorId} with token: ${token}`);
        const response = await fetch(`${BASE_API_URL}categories/${vendorId}`, {
            method: 'GET',
            headers: {
                // Authorization: `Bearer ${token}`,
            },
        });
        if (response.status !== 200) {
            return { data: [], message: 'Failed to fetch product categories' };
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching product categories:', error);
        throw error;
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
export const createProduct = async (productData: FormData) => {
    try {
        const response = await fetch(`${BASE_API_URL}/products/create`, {
            method: 'POST',
            headers: {
                // Authorization: `Bearer ${await authToken()}`,
            },
            body: productData
        });
        if (!response.ok) {
            console.error('Failed to create product');
        }
        return await response.json();
    } catch (error) {
        console.error('Error creating product:', error);
        throw error;
    }
}
export const fetchVendorProducts = async (vendorId: string) => {
    try {
        const response = await fetch(`${BASE_API_URL}products/${vendorId}/all`, {
            method: 'GET',
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
export const updateProduct = async (productId: string, productData: FormData) => {
    try {
        const response = await fetch(`${BASE_API_URL}products/update/${productId}`, {
            method: 'PUT',
            headers: {
                // Authorization: `Bearer ${await authToken()}`,
            },
            body: productData
        });
        if (!response.ok) {
            console.error('Failed to update product');
        }
        return await response.json();
    } catch (error) {
        console.error('Error updating product:', error);

    }
}
