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
export const updateProduct = async (formData: FormData, vendorId: string, productId: string) => {
    try {
        const response = await fetch(`${BASE_API_URL}products/${productId}`, {
            method: "PATCH",
            body: formData,
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
            cache: 'no-cache',
            // next: { revalidate: 3600 },
            headers: {
                // Authorization: `Bearer ${await authToken()}`,
                'company-domain': companyDomain,
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
export const createInventoryRecord = async (
    productVariantId: string,
    warehouseId: string,
    stockQuantity: number,
    domain: string,
) => {
    const response = await fetch(`${BASE_API_URL}inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'company-domain': domain },
        body: JSON.stringify({ productVariantId, warehouseId, stockQuantity }),
    });
    return response.json();
};
export const updateProductVariant = async (
    formData: FormData,
    vendorId: string,
    productId: string,
    variantId: string
) => {
    try {
        const response = await fetch(`${BASE_API_URL}product-variant/${variantId}`, {
            method: "PATCH",
            body: formData,
        });

        if (!response.ok) throw new Error(`Failed to update variant: ${response.statusText}`);

        const res = await response.json();
        revalidatePath(`/vendor/${vendorId}/products/${productId}/variants`);
        return { status: 200, data: res };
    } catch (error) {
        console.error("Error updating product variant:", error);
    }
};
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
export const fetchVariant = async (variantId: string,) => {
    try {
        const response = await fetch(`${BASE_API_URL}product-variant/variant/${variantId}`, {
            method: 'GET',
            headers: {
                'company-domain': companyDomain,
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
export const fetchVendorOrderList = async () => {
    try {
        const response = await fetch(`${BASE_API_URL}orders`, {
            method: 'GET',
            headers: {
                'company-domain': companyDomain,
                // Authorization: `Bearer ${await authToken()}`,
            },
        });
        if (response.status !== 200) {
            console.error('Failed to fetch orders');

            return [];
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
    }
}
export const fetchVendorOrderDetails = async (orderId: string) => {
    try {
        const response = await fetch(`${BASE_API_URL}orders/${orderId}`, {
            method: 'GET',
            headers: {
                'company-domain': companyDomain,
                // Authorization: `Bearer ${await authToken()}`,
            },
        });
        if (response.status !== 200) {
            console.error('Failed to fetch order details');
            return {};
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching order details:', error);
        return {};
    }
}
export const fetchUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
        const response = await fetch(`${BASE_API_URL}orders/${orderId}/status`, {
            method: 'PATCH',
            headers: {
                'company-domain': companyDomain,
                // Authorization: `Bearer ${await authToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        if (response.status !== 200) {
            console.error('Failed to update order status');
        }
        return await response.json();

    } catch (error) {
        console.log("failed to update order status", error)
    }
}
export const fetchAddTrackingUrl = async (orderId: string, trackingUrl: string) => {
    console.log(orderId, trackingUrl)
    try {
        const response = await fetch(`${BASE_API_URL}shipping`, {
            method: 'POST',
            headers: {
                'company-domain': companyDomain,
                // Authorization: `Bearer ${await authToken()}`,    
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ orderId: orderId, trackingUrl: trackingUrl })
        }); console.log(response)
        if (response.status !== 201) {
            console.error('Failed to add tracking URL', response);
        }
        return await response.json();
    } catch (error) {
        console.error('Error adding tracking URL:', error);
    }

}
export const fetchUpdateTrackingUrl = async (orderId: string, trackingUrl: string) => {
    console.log(orderId, trackingUrl)
    try {
        const response = await fetch(`${BASE_API_URL}shipping/${orderId}`, {
            method: 'PATCH',
            headers: {
                'company-domain': companyDomain,
                // Authorization: `Bearer ${await authToken()}`,    
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ trackingUrl: trackingUrl })
        }); console.log(response)
        if (response.status !== 201) {
            console.error('Failed to update tracking URL', response);
        }
        return await response.json();
    } catch (error) {
        console.error('Error updating tracking URL:', error);
    }

}
export const fetchCreateWarehouseLocation = async (warehouseAddress: any) => {
    console.log(warehouseAddress)
    try {
        const response = await fetch(`${BASE_API_URL}warehouse`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'company-domain': companyDomain,
                // Authorization: `Bearer ${await authToken()}`,
            },
            body: JSON.stringify(warehouseAddress)
        });
        return await response.json();
    } catch (error) {
        console.error('Error creating warehouse location:', error);
        return { message: 'Error creating warehouse location', success: false };
    }
}
export const fetchUpdateWarehouseLocation = async (locationId: string, warehouseData: any) => {
    try {
        const response = await fetch(`${BASE_API_URL}warehouse/${locationId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'company-domain': companyDomain,
                // Authorization: `Bearer ${await authToken()}`,
            },
            body: JSON.stringify(warehouseData)
        });

        return await response.json();
    }
    catch (error) {
        console.error('Error updating warehouse location:', error);
        return { message: 'Error updating warehouse location', success: false };
    }
}
export const fetchVendorWarehouseLocations = async () => {
    try {
        const response = await fetch(`${BASE_API_URL}warehouse`, {
            method: 'GET',
            headers: {
                'company-domain': companyDomain,
            }
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching warehouse locations:', error);
        return { data: {}, message: 'Error fetching warehouse locations' };
    }
}
export const fetchVendorWarehouse = async () => {
    try {
        const response = await fetch(`${BASE_API_URL}warehouse/options`, {
            method: 'GET',
            cache: 'force-cache',
            next: { revalidate: 3600 },
            headers: {
                'company-domain': companyDomain,
            }
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching warehouse locations:', error);
        return { data: {}, message: 'Error fetching warehouse locations' };
    }
}

export const fetchDeleteWarehouseLocation = async (locationId: string) => {
    try {
        const response = await fetch(`${BASE_API_URL}warehouse/${locationId}`, {
            method: 'DELETE',
            headers: {
                'company-domain': companyDomain,
            }
        });
        return await response.json();
    } catch (error) {
        console.error('Error deleting warehouse location:', error);
        return { message: 'Error deleting warehouse location', success: false };
    }
}