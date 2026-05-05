"use server"
import { BASE_API_URL } from "@/constants";
import { revalidatePath } from "next/cache";
import { getCompanyDomain } from "@/lib/get-domain";
import { OrderStatus, ReturnStatus } from "./Types";
export const fetchVendorsProductsCategory = async (vendorId: string, token: string) => {
    try {
        const response = await fetch(`${BASE_API_URL}/v1/categories/${vendorId}`, {
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
export const createVendorProductCategory = async (vendorId: string, categoryData: { name: string; description?: string }, token: string) => {
    try {
        const companyDomain = await getCompanyDomain();
        console.log(categoryData);
        const response = await fetch(`${BASE_API_URL}/v1/categories/${vendorId}`, {
            method: 'POST',
            headers: {
                // Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'company-domain': companyDomain,
            },
            body: JSON.stringify({ category: categoryData }),
        });
        if (response.status !== 201) {
            console.error('Failed to create product category');
        }
        revalidatePath(`/vendor/${vendorId}`);
        revalidatePath(`/vendor/${vendorId}/products/categories`);
        return await response.json();
    }
    catch (error) {
        console.error('Error creating product category:', error);
        throw error;
    }
}
export const updateVendorProductCategory = async (vendorId: string, categoryId: string, categoryData: { name: string; description?: string }, token: string) => {
    try {
        const companyDomain = await getCompanyDomain();
        const response = await fetch(`${BASE_API_URL}/v1/categories/${vendorId}/${categoryId}`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'company-domain': companyDomain,
            },
            body: JSON.stringify({ category: categoryData }),
        });
        if (response.status !== 200) {
            throw new Error('Failed to update product category');
        }
        revalidatePath(`/vendor/${vendorId}/products/categories`);
        return await response.json();
    }
    catch (error) {
        console.error('Error updating product category:', error);
        throw error;
    }
}
export const deleteVendorProductCategory = async (vendorId: string, categoryId: string, token: string) => {
    try {
        console.log('vendorId', vendorId);
        console.log('categoryId', categoryId);

        const response = await fetch(`${BASE_API_URL}/v1/categories/${vendorId}/${categoryId}`, {
            method: 'DELETE',
            headers: {
                // Authorization: `Bearer ${token}`,
            },
        });
        if (response.status !== 200) {
            console.error('Failed to delete product category');
        }
        console.log('delete successful');
        revalidatePath(`/vendor/${vendorId}/products/categories`);
        return await response.json();
    }
    catch (error) {
        console.error('Error deleting product category:', error);
        throw error;
    }
}
export const createProduct = async (productData: FormData, vendorId: string, token: string) => {
    try {
        const companyDomain = await getCompanyDomain();

        const response = await fetch(`${BASE_API_URL}/v1/products/${vendorId}`, {
            method: 'POST',
            headers: {
                // Authorization: `Bearer ${token}`,
                'company-domain': companyDomain,
            },
            body: productData
        });
        if (!response.ok) {
            console.error('Failed to create product');
            return { status: response.status, statusText: response.statusText };
        }
        revalidatePath(`/vendor/${vendorId}/products`);
        return await response.json();
    } catch (error) {
        console.error('Error creating product:', error);
        return { status: 500, statusText: 'Internal Server Error' };
    }
}
export const updateProduct = async (formData: FormData, vendorId: string, productId: string, token: string) => {
    try {
        const companyDomain = await getCompanyDomain();
        const response = await fetch(`${BASE_API_URL}/v1/products/${productId}`, {
            method: "PATCH",
            body: formData,
            headers: {
                'company-domain': companyDomain,
            },
        });
        if (!response.ok) {
            console.error('Failed to create product');
            return { status: response.status, statusText: response.statusText };
        }
        revalidatePath(`/vendor/${vendorId}/products`);
        return await response.json();
    } catch (error) {
        console.error('Error creating product:', error);
        return { status: 500, statusText: 'Internal Server Error' + error };
    }
}
export const updateProductVariantStatus = async (productVariantId: string, vendorId: string, nextStatus: string, token: string) => {
    try {
        const companyDomain = await getCompanyDomain();
        console.log("nextStatus", nextStatus);
        const response = await fetch(`${BASE_API_URL}/v1/product-variant/update-status/${productVariantId}`, {
            method: "PATCH",
            body: JSON.stringify({ status: nextStatus }),
            headers: {
                'Content-Type': 'application/json',
                'company-domain': companyDomain,
            },
        });
        if (!response.ok) {
            console.error('Failed to create product');
            return { status: response.status, statusText: response.statusText };
        }

        revalidatePath(`/vendor/${vendorId}/products`);
        revalidatePath(`/vendor/${vendorId}/products/${productVariantId}/productVariants`);
        console.log('Product variant status updated');
        return await response.json();
    } catch (error) {
        console.error('Error creating product:', error);
        return { status: 500, statusText: 'Internal Server Error' + error };
    }
}
export const fetchVendorProducts = async (token: string) => {
    try {
        const companyDomain = await getCompanyDomain();
        const response = await fetch(`${BASE_API_URL}/v1/products/all`, {
            method: 'GET',
            cache: 'force-cache',
            next: { revalidate: 3600 },
            headers: {
                'company-domain': companyDomain,
                // Authorization: `Bearer ${token}`,
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
export const fetchVendorActiveProducts = async (token: string) => {
    const cleanToken = token.replace(/['"]+/g, '');
    console.log("token", token)
    try {
        const companyDomain = await getCompanyDomain();
        const response = await fetch(`${BASE_API_URL}/v1/products/active`, {
            method: 'GET',
            cache: 'no-cache',
            headers: {
                'Authorization': `Bearer ${cleanToken}`,
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
export const fetchVendorOneProducts = async (id: string, token: string) => {
    try {
        const companyDomain = await getCompanyDomain();
        const response = await fetch(`${BASE_API_URL}/v1/products/${id}/details`, {
            method: 'GET',
            cache: 'no-cache',
            // next: { revalidate: 3600 },
            headers: {
                // Authorization: `Bearer ${token}`,
                'company-domain': companyDomain,
            },
        });
        if (response.status !== 200) {
            console.error('Failed to fetch products');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        return { status: 500, statusText: 'Internal Server Error' + error };
    }
}
export const deleteProduct = async (productId: string, vendorId: string, token: string) => {
    try {
        const companyDomain = await getCompanyDomain();
        const response = await fetch(`${BASE_API_URL}/v1/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'company-domain': companyDomain,
                // Authorization: `Bearer ${token}`,    
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
        return { status: 500, statusText: 'Internal Server Error' + error };
    }
}

export const createProductVariant = async (variantData: FormData, vendorId: string, productId: string, token: string) => {
    try {
        const companyDomain = await getCompanyDomain();

        const response = await fetch(`${BASE_API_URL}/v1/product-variant`, {
            method: "POST",
            body: variantData,
            headers: {
                'company-domain': companyDomain,
            }
        });
        if (!response.ok) throw new Error("Failed to create variant");
        const res = await response.json();
        revalidatePath(`/vendor/${vendorId}/products/variants`);
        revalidatePath(`/vendor/${vendorId}/products/${productId}/productVariants`);
        revalidatePath(`/vendor/${vendorId}/products`);
        return res;
    } catch (error) {
        console.error("Error creating product variant:", error);
        return { status: 500, statusText: 'Internal Server Error' + error };
    }

}
export const createInventoryRecord = async (
    productVariantId: string,
    warehouseId: string,
    stockQuantity: number
    , token: string) => {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(`${BASE_API_URL}/v1/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'company-domain': companyDomain },
        body: JSON.stringify({ productVariantId, warehouseId, stockQuantity }),
    });
    return response.json();
};
export const updateProductVariant = async (
    formData: FormData,
    vendorId: string,
    productId: string,
    variantId: string
    , token: string) => {
    try {
        const response = await fetch(`${BASE_API_URL}/v1/product-variant/${variantId}`, {
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
export const fetchProductVariants = async (productId: string, token: string) => {
    try {
        const companyDomain = await getCompanyDomain();
        const response = await fetch(`${BASE_API_URL}/v1/product-variant/${productId}`, {
            method: 'GET',
            cache: 'force-cache',
            next: { revalidate: 3600 },
            headers: {
                'company-domain': companyDomain,
                // Authorization: `Bearer ${token}`,
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
export const deleteProductVariant = async (productId: string, variantId: string, vendorId: string, token: string) => {
    try {
        const companyDomain = await getCompanyDomain();
        const response = await fetch(`${BASE_API_URL}/v1/product-variant/${variantId}`, {
            method: 'DELETE',
            headers: {
                'company-domain': companyDomain,
                // Authorization: `Bearer ${token}`,    
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
export const fetchVariant = async (variantId: string, token: string) => {
    try {
        const companyDomain = await getCompanyDomain();
        const response = await fetch(`${BASE_API_URL}/v1/product-variant/variant/${variantId}`, {
            method: 'GET',
            headers: {
                'company-domain': companyDomain,
                // Authorization: `Bearer ${token}`,
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
export const fetchVendorPendingOrders = async (token: string) => {
    try {
        const companyDomain = await getCompanyDomain();
        const response = await fetch(`${BASE_API_URL}/v1/orders/pending`, {
            method: 'GET',
            headers: {
                'company-domain': companyDomain,
                // Authorization: `Bearer ${token}`,
            },
        });
        if (response.status !== 200) {
            console.error('Failed to fetch pending orders');
            return [];
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching pending orders:', error);
        return [];
    }
}
export const fetchVendorOrderList = async (offset: number = 0, limit: number = 10, token: string, status?: OrderStatus | undefined, sortBy?: string,) => {
    try {
        const companyDomain = await getCompanyDomain();
        const response = await fetch(`${BASE_API_URL}/v1/orders?offset=${offset}&limit=${limit}&status=${status || undefined}&sortBy=${sortBy || undefined}`, {
            method: 'GET',
            cache: 'no-cache',
            headers: {
                'company-domain': companyDomain,
                Authorization: `Bearer ${token}`,
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
export const fetchVendorOrderDetails = async (orderId: string, token: string) => {
    try {
        const companyDomain = await getCompanyDomain();
        const response = await fetch(`${BASE_API_URL}/v1/orders/${orderId}/details`, {
            method: 'GET',
            cache: 'no-cache',
            headers: {
                'company-domain': companyDomain,
                // Authorization: `Bearer ${token}`,
            },
        });
        if (response.status !== 200) {
            console.error('Failed to fetch order details', response);
            return {};
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching order details:', error);
        return {};
    }
}
export const fetchUpdateOrderStatus = async (orderId: string, status: string, token: string) => {
    try {
        const companyDomain = await getCompanyDomain();
        const response = await fetch(`${BASE_API_URL}/v1/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: {
                'company-domain': companyDomain,
                // Authorization: `Bearer ${token}`,
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
export const fetchAddTrackingUrl = async (orderId: string, trackingUrl: string, token: string) => {
    console.log(orderId, trackingUrl)
    try {
        const companyDomain = await getCompanyDomain();
        const response = await fetch(`${BASE_API_URL}/v1/shipping`, {
            method: 'POST',
            headers: {
                'company-domain': companyDomain,
                // Authorization: `Bearer ${token}`,    
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
export const fetchUpdateTrackingUrl = async (orderId: string, trackingUrl: string, token: string) => {
    console.log(orderId, trackingUrl)
    try {
        const companyDomain = await getCompanyDomain();
        const response = await fetch(`${BASE_API_URL}/v1/shipping/${orderId}`, {
            method: 'PATCH',
            headers: {
                'company-domain': companyDomain,
                // Authorization: `Bearer ${token}`,    
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
export const fetchCreateWarehouseLocation = async (warehouseAddress: any, token: string) => {
    console.log(warehouseAddress)
    try {
        const companyDomain = await getCompanyDomain();
        const response = await fetch(`${BASE_API_URL}/v1/warehouse`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'company-domain': companyDomain,
                // Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(warehouseAddress)
        });
        revalidatePath(`/vendor`);
        return await response.json();
    } catch (error) {
        console.error('Error creating warehouse location:', error);
        return { message: 'Error creating warehouse location', success: false };
    }
}
export const fetchUpdateWarehouseLocation = async (locationId: string, warehouseData: any, token: string) => {
    try {
        const companyDomain = await getCompanyDomain();
        const response = await fetch(`${BASE_API_URL}/v1/warehouse/${locationId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'company-domain': companyDomain,
                // Authorization: `Bearer ${token}`,
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
export const fetchVendorWarehouseLocations = async (token: string) => {
    try {
        const companyDomain = await getCompanyDomain();
        const response = await fetch(`${BASE_API_URL}/v1/warehouse`, {
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
export const fetchVendorWarehouse = async (token: string) => {
    try {
        const companyDomain = await getCompanyDomain();
        const response = await fetch(`${BASE_API_URL}/v1/warehouse/options`, {
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

export const fetchDeleteWarehouseLocation = async (locationId: string, token: string) => {
    try {
        const companyDomain = await getCompanyDomain();
        const response = await fetch(`${BASE_API_URL}/v1/warehouse/${locationId}`, {
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

export const fetchUpdateOrderItem = async (itemId: string, formData: any, token: string) => {
    try {
        const companyDomain = await getCompanyDomain();
        const response = await fetch(`${BASE_API_URL}/v1/order-items/${itemId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'company-domain': companyDomain,
            },
            body: JSON.stringify(formData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating order item:', error);
        return { message: 'Error updating order item', success: false };
    }
}

export const fetchGetVendorReturnRequests = async (token: string) => {
    try {
        const domain = await getCompanyDomain();
        const response = await fetch(`${BASE_API_URL}/v1/returns/vendor`, {
            method: 'GET',
            cache: 'no-store',
            headers: {
                'company-domain': domain,
                // Authorization: `Bearer ${token}`,    
            }
        });
        return await response.json();
    } catch (error) {
        throw error;
    }
};
export const fetchGetVendorReturnById = async (returnId: string, token: string) => {
    try {
        const domain = await getCompanyDomain();
        const response = await fetch(`${BASE_API_URL}/v1/returns/vendor/${returnId}`, {
            headers: {
                'company-domain': domain,
                // Authorization: `Bearer ${token}`,    
            }
        });
        return await response.json();
    } catch (error) {
        throw error;
    }
};
export const FetchUpdateReturnStatus = async (returnId: string, updates: { status: ReturnStatus, store_owner_note?: string, tracking_id?: string }, token: string) => {
    try {
        const domain = await getCompanyDomain();
        const response = await fetch(`${BASE_API_URL}/v1/returns/${returnId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'company-domain': domain,
                // Authorization: `Bearer ${token}`,   
            },
            body: JSON.stringify(updates),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update return status');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};

export const fetchGetCompanyRefunds = async (token: string) => {
    try {
        const domain = await getCompanyDomain();
        const response = await fetch(`${BASE_API_URL}/v1/refunds`, {
            headers: {
                'company-domain': domain,
                // Authorization: `Bearer ${token}`,    
            }
        });
        return await response.json();
    } catch (error) {
        throw error;
    }
};
export const fetchCompanyCustomers = async (offset: number, limit: number, status: string, sortBy: string, token: string) => {
    try {
        const domain = await getCompanyDomain();
        const response = await fetch(`${BASE_API_URL}/v1/company/customers?offset=${offset}&limit=${limit}&status=${status}&sortBy=${sortBy}`, {
            cache: 'no-store',
            // next: { revalidate: 3600 },
            headers: {
                'company-domain': domain,
                Authorization: `Bearer ${token}`,
            }
        });
        return await response.json();
    } catch (error) {
        throw error;
    }
};
export const FetchSuspendCustomer = async (customerId: string, token: string) => {
    try {
        const domain = await getCompanyDomain();
        const response = await fetch(`${BASE_API_URL}/v1/users/${customerId}/suspend`, {
            method: 'PATCH',
            headers: {
                'company-domain': domain,
                Authorization: `Bearer ${token}`,
            }
        });
 
        return await response.json();
    } catch (error) {
        throw error;
    }
};