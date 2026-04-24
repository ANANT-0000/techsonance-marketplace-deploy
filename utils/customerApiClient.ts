// 'use server';
import { BASE_API_URL, CUSTOMER_BASE_URL } from "@/constants";
import { getCompanyDomain } from "@/lib/get-domain";

export const fetchCustomerProfile = async () => {
    try {
        const companyDomain = await getCompanyDomain();
        const response = await fetch(`${CUSTOMER_BASE_URL}/profile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "company-domain": companyDomain,
                // Authorization: `Bearer ${await authToken()}`,
            },
        });
        if (response.status !== 200) {
            console.log('Failed to fetch customer profile');
            console.log('Failed to fetch customer profile');
        }
        return await response.json();
    } catch (error) {
        console.log('Error fetching customer profile:', error);
        throw error;
    }
};
export const fetchCustomerWishlist = async (customerId: string,) => {
    try {
        const companyDomain = await getCompanyDomain();
        const response = await fetch(`${BASE_API_URL}wishlist/${customerId} `, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "company-domain": companyDomain,
                // Authorization: `Bearer ${await authToken()}`,
            },
        });
        console.log(response)
        if (response.status !== 200) {
            console.log('Failed to fetch wishlist');
        }
        return await response.json();
    } catch (error) {
        console.log('Error fetching wishlist:', error);

    }
}
export const fetchAddWishList = async (productId: string, customerId: string,) => {
    console.log("productId", productId);
    console.log("customerId", customerId);
    const companyDomain = await getCompanyDomain();

    try {
        const response = await fetch(`${BASE_API_URL}wishlist/${customerId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "company-domain": companyDomain,
                // Authorization: `Bearer ${await authToken()}`,
            },
            body: JSON.stringify({ productVariantId: productId }),
        });
        if (response.status !== 200) {
            console.log('Failed to update wishlist');
        }
        return await response.json();
    } catch (error) {
        console.log('Error updating wishlist:', error);
    }
};
export const fetchDeleteWishList = async (productId: string, customerId: string) => {
    const companyDomain = await getCompanyDomain();
    try {
        const response = await fetch(`${BASE_API_URL}wishlist/${customerId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                "company-domain": companyDomain,
                // Authorization: `Bearer ${await authToken()}`,    
            },
            body: JSON.stringify({ productVariantId: productId }),
        });
        console.log(response)
        if (response.status !== 200) {
            console.log('Failed to update wishlist');
        }
        return await response.json();
    } catch (error) {
        console.log('Error updating wishlist:', error);
    }
};
export const fetchAddToCart = async (productVariantId: string, quantity: number, customerId: string) => {
    const companyDomain = await getCompanyDomain();
    try {
        const response = await fetch(`${BASE_API_URL}cart/${customerId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "company-domain": companyDomain,
                // Authorization: `Bearer ${await authToken()}`,
            },
            body: JSON.stringify({ productVariantId, quantity }),
        });
        if (response.status !== 200) {
            console.log('Failed to add to cart');
        }
        return await response.json();
    } catch (error) {
        console.log('Error adding to cart:', error);
    }
};
export const fetchRemoveFromCart = async (customerId: string, cartId: string, cartItemId: string) => {
    console.log('8888888888888')
    console.log('customerId', customerId)
    console.log('cartId', cartId)
    console.log('cartItemId', cartItemId)

    try {
        const companyDomain = await getCompanyDomain();
        const response = await fetch(`${BASE_API_URL}cart/${customerId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                "company-domain": companyDomain,
                // Authorization: `Bearer ${await authToken()}`,    
            },
            body: JSON.stringify({ cartId, cartItemId }),
        });
        if (response.status !== 200) {
            console.log('Failed to remove from cart');
        }
        return await response.json();
    } catch (error) {
        console.log('Error removing from cart:', error);
    }
};
export const fetchGetCartList = async (customerId: string) => {
    const companyDomain = await getCompanyDomain();
    try {
        const response = await fetch(`${BASE_API_URL}cart/${customerId}`, {
            method: 'GET',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
                "company-domain": companyDomain,
                // Authorization: `Bearer ${await authToken()}`,    
            },
        });
        if (response.status !== 200) {
            console.log('Failed to fetch cart');
        }
        return await response.json();
    } catch (error) {
        console.log('Error fetching cart:', error);
    }
};
export const fetchUpdateCartQuantity = async (productVariantId: string, quantity: number, customerId: string) => {
    const companyDomain = await getCompanyDomain();
    try {
        const response = await fetch(`${BASE_API_URL}cart/${customerId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                "company-domain": companyDomain,
                // Authorization: `Bearer ${await authToken()}`,    
            },
            body: JSON.stringify({ productVariantId, quantity }),
        });
        if (response.status !== 200) {
            console.log('Failed to update cart quantity');
        }
        return await response.json();
    } catch (error) {
        console.log('Error updating cart quantity:', error);

    }
}

export const fetchGetUserAddresses = async (customerId: string,) => {
    const companyDomain = await getCompanyDomain();
    try {
        const response = await fetch(`${BASE_API_URL}address/customer/${customerId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // "company-domain": companyDomain,
                // Authorization: `Bearer ${await authToken()}`,    
            },
        });
        if (response.status !== 200) {
            console.log('Failed to fetch addresses');
            return [];
        }
        return await response.json();
    } catch (error) {
        console.log('Error fetching addresses:', error);
    }
};
export const fetchCreateUserAddress = async (customerId: string, addressData: any) => {
    try {
        const response = await fetch(`${BASE_API_URL}address/customer/${customerId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // "company-domain": companyDomain,
                // Authorization: `Bearer ${await authToken()}`,
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
        const response = await fetch(`${BASE_API_URL}address/customer/${customerId}/${addressId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                // "company-domain": companyDomain,
                // Authorization: `Bearer ${await authToken()}`,
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
        const response = await fetch(`${BASE_API_URL}address/customer/${customerId}/${addressId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                // "company-domain": companyDomain,
                // Authorization: `Bearer ${await authToken()}`,
            },
        });
        if (response.status !== 200) {
            console.log('Failed to delete address');
            return;
        }
        return await response.json();
    }
    catch (error) {
        console.log('Error deleting address:', error);
    }
}
export const fetchGetAddressById = async (customerId: string, addressId: string) => { }

export const fetchSetDefaultAddress = async (customerId: string, addressId: string) => {
    try {
        const response = await fetch(`${BASE_API_URL}address/customer/${customerId}/${addressId}/default`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                // "company-domain": companyDomain, 
                // Authorization: `Bearer ${await authToken()}`,
            },
        });
        if (response.status !== 200) {
            console.log('Failed to set default address');
            return;
        }
        return await response.json();
    }
    catch (error) {
        console.log('Error setting default address:', error);
    }
}

export const checkAddressExistence = async (customerId: string) => {
    try {
        const response = await fetch(`${BASE_API_URL}address/customer/${customerId}/addresses-exist`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const responseData = await response.json();
        console.log('Address existence check response:', responseData);
        if (response.ok) {
            return responseData.data;
        }
        return {
            count: 0,
            hasAddresses: false
        }
    } catch (error) {
        console.log('Error checking address:', error);
        return false;
    }
}


export const fetchInitiatePayment = async (customerId: string, paymentData: any) => {
    const companyDomain = await getCompanyDomain();
    try {
        const response = await fetch(`${BASE_API_URL}checkout/${customerId}/initiate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "company-domain": companyDomain,
                // Authorization: `Bearer ${await authToken()}`,
            },
            body: JSON.stringify(paymentData),
        });

        if (!response.ok) {
            console.log('Failed to initiate payment');
            return { success: false };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.log('Error initiating payment:', error);
        return { success: false };
    }
};

export const fetchUserOrderHistory = async (customerId: string) => {
    const companyDomain = await getCompanyDomain();
    try {
        const response = await fetch(`${BASE_API_URL}orders/user/${customerId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "company-domain": companyDomain,
                // Authorization: `Bearer ${await authToken()}`,
            },
        }
        );
        console.log("Order History Response:", response);
        if (response.status !== 200) {
            console.log('Failed to fetch order history');
        }
        return await response.json();
    } catch (error) {
        console.log('Error fetching order history:', error);
    }
};
export const fetchOrderDetails = async (orderId: string) => {
    const companyDomain = await getCompanyDomain();
    try {
        const response = await fetch(`${BASE_API_URL}orders/${orderId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "company-domain": companyDomain,
                // Authorization: `Bearer ${await authToken()}`,
            },
        });
        console.log("Order Details Response:", response);
        if (response.status !== 200) {
            console.log('Failed to fetch order details');
        }
        return await response.json();

    } catch (error) {
        console.log('Error fetching order details:', error);
    }
}
export const fetchOrderItemDetails = async (orderItemId: string) => {
    const companyDomain = await getCompanyDomain();
    try {
        const response = await fetch(`${BASE_API_URL}order-items/${orderItemId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "company-domain": companyDomain,
                // Authorization: `Bearer ${await authToken()}`,
            },
        });
        console.log("Order Item Details Response:", response);
        if (response.status !== 200) {
            console.log('Failed to fetch order item details');
        }
        return await response.json();

    } catch (error) {
        console.log('Error fetching order item details:', error);
    }
}

export const fetchCancelOrderItem = async (
    userId: string,
    itemId: string,
    reason: string,
) => {
    const domain = await getCompanyDomain();
    const response = await fetch(
        `${BASE_API_URL}order-items/${itemId}/cancel`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'company-domain': domain,
            },
            body: JSON.stringify({
                userId,
                cancelReason: reason,
                cancelled_by: 'customer',
            }),
        },
    );
    return response.json();
};
export const fetchReturnReplaceItem = async (formData: FormData) => {
    const domain = await getCompanyDomain();
    try {
        const response = await fetch(
            `${BASE_API_URL}order-items/return-replace`,
            {
                method: 'POST',
                headers: {
                    // 'Content-Type': 'multipart/form-data', // Let the browser set this with the correct boundary
                    'company-domain': domain,
                },
                body: formData,
            },
        );
        if (!response.ok) {
            console.log('Failed to submit return/replace request');
            return { success: false };
        }
        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.log('Error submitting return/replace request:', error);
        return { success: false };
    }
};
