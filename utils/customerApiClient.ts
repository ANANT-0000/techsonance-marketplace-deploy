// 'use server';
import { BASE_API_URL, CUSTOMER_BASE_URL } from "@/constants";
import { getCompanyDomain } from "@/lib/get-domain";

export const fetchCustomerProfile = async (token: string) => {
    try {
        const companyDomain = await getCompanyDomain();
        const response = await fetch(`${CUSTOMER_BASE_URL}/profile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "company-domain": companyDomain,
                Authorization: `Bearer ${token}`,
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
export const fetchCustomerWishlist = async (customerId: string, token: string) => {
    try {
        const companyDomain = await getCompanyDomain();
        const response = await fetch(`${BASE_API_URL}/v1/wishlist/${customerId} `, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "company-domain": companyDomain,
                Authorization: `Bearer ${token}`,
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
export const fetchAddWishList = async (productId: string, customerId: string, token: string) => {
    console.log("productId", productId);
    console.log("customerId", customerId);
    const companyDomain = await getCompanyDomain();

    try {
        const response = await fetch(`${BASE_API_URL}/v1/wishlist/${customerId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "company-domain": companyDomain,
                Authorization: `Bearer ${token}`,
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
export const fetchDeleteWishList = async (productId: string, customerId: string, token: string) => {
    const companyDomain = await getCompanyDomain();
    try {
        const response = await fetch(`${BASE_API_URL}/v1/wishlist/${customerId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                "company-domain": companyDomain,
                Authorization: `Bearer ${token}`,
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
export const fetchAddToCart = async (productVariantId: string, quantity: number, customerId: string, token: string) => {
    const companyDomain = await getCompanyDomain();
    try {
        const response = await fetch(`${BASE_API_URL}/v1/cart/${customerId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "company-domain": companyDomain,
                Authorization: `Bearer ${token}`,
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
export const fetchRemoveFromCart = async (customerId: string, cartId: string, cartItemId: string, token: string) => {
    console.log('8888888888888')
    console.log('customerId', customerId)
    console.log('cartId', cartId)
    console.log('cartItemId', cartItemId)

    try {
        const companyDomain = await getCompanyDomain();
        const response = await fetch(`${BASE_API_URL}/v1/cart/${customerId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                "company-domain": companyDomain,
                Authorization: `Bearer ${token}`,    
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
export const fetchGetCartList = async (customerId: string, token: string) => {
    const companyDomain = await getCompanyDomain();
    try {
        const response = await fetch(`${BASE_API_URL}/v1/cart/${customerId}`, {
            method: 'GET',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
                "company-domain": companyDomain,
                Authorization: `Bearer ${token}`,    
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
export const fetchUpdateCartQuantity = async (productVariantId: string, quantity: number, customerId: string,token: string) => {
    const companyDomain = await getCompanyDomain();
    try {
        const response = await fetch(`${BASE_API_URL}/v1/cart/${customerId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                "company-domain": companyDomain,
                Authorization: `Bearer ${token}`,    
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

export const fetchGetUserAddresses = async (customerId: string, token: string   ) => {
    const companyDomain = await getCompanyDomain();
    try {
        const response = await fetch(`${BASE_API_URL}/v1/address/customer/${customerId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "company-domain": companyDomain,
                Authorization: `Bearer ${token}`,    
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


export const fetchGetAddressById = async (customerId: string, addressId: string, token: string  ) => { }

export const fetchSetDefaultAddress = async (customerId: string, addressId: string, token: string) => {
    try {
        const companyDomain = await getCompanyDomain();
        const response = await fetch(`${BASE_API_URL}/v1/address/customer/${customerId}/${addressId}/default`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                "company-domain": companyDomain, 
                Authorization: `Bearer ${token}`,
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

export const checkAddressExistence = async (customerId: string, token: string) => {
    try {
        const response = await fetch(`${BASE_API_URL}/v1/address/customer/${customerId}/addresses-exist`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "company-domain": await getCompanyDomain(),
                Authorization: `Bearer ${token}`,
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


export const fetchInitiatePayment = async (customerId: string, paymentData: any, token: string) => {
    const companyDomain = await getCompanyDomain();
    try {
        const response = await fetch(`${BASE_API_URL}/v1/checkout/${customerId}/initiate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "company-domain": companyDomain,
                Authorization: `Bearer ${token}`,
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

export const fetchUserOrderHistory = async (customerId: string, token: string) => {
    const companyDomain = await getCompanyDomain();
    try {
        const response = await fetch(`${BASE_API_URL}/v1/orders/user/${customerId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "company-domain": companyDomain,
                Authorization: `Bearer ${token}`,
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
export const fetchOrderDetails = async (orderId: string, token: string) => {
    const companyDomain = await getCompanyDomain();
    try {
        const response = await fetch(`${BASE_API_URL}/v1/orders/${orderId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "company-domain": companyDomain,
                Authorization: `Bearer ${token}`,
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
export const fetchOrderItemDetails = async (orderItemId: string, token: string) => {
    const companyDomain = await getCompanyDomain();
    try {
        const response = await fetch(`${BASE_API_URL}/v1/order-items/${orderItemId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "company-domain": companyDomain,
                Authorization: `Bearer ${token}`,
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
    token: string
) => {
    const domain = await getCompanyDomain();
    const response = await fetch(
        `${BASE_API_URL}/v1/order-items/${itemId}/cancel`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'company-domain': domain,
                Authorization: `Bearer ${token}`,
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
export const fetchReturnReplaceItem = async (userId: string, formData: FormData, token: string) => {
    const domain = await getCompanyDomain();
    try {
        const response = await fetch(
            `${BASE_API_URL}/v1/returns/user/${userId}`,
            {
                method: 'POST',
                headers: {
                    'company-domain': domain,
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            },
        );
        console.log('fetch status:', response.status, response.statusText);

        const data = await response.json();
        console.log('fetch response body:', data);

        if (!response.ok) {
            console.log('Server error:', data?.message ?? data);
            return { success: false, error: data?.message ?? 'Request failed' };
        }

        return { success: true, data };

    } catch (error) {
        console.log('Network/parse error:', error);
        return { success: false, error };
    }
};

export const fetchUserReturns = async (userId: string, token: string) => {
    const domain = await getCompanyDomain();
    try {
        const response = await fetch(`${BASE_API_URL}/v1/returns/user/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "company-domain": domain,
                Authorization: `Bearer ${token}`,
            },
        });
        console.log("User Returns Response:", response);
        if (response.status !== 200) {
            console.log('Failed to fetch user returns');
        }
        return await response.json();
    } catch (error) {
        console.log('Error fetching user returns:', error);
    }
};