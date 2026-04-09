import { BASE_API_URL, CUSTOMER_BASE_URL } from "@/constants";

export const fetchCustomerProfile = async () => {
    try {
        const response = await fetch(`${CUSTOMER_BASE_URL}/profile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',

                // Authorization: `Bearer ${await authToken()}`,
            },
        });
        if (response.status !== 200) {
            console.error('Failed to fetch customer profile');
            console.error('Failed to fetch customer profile');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching customer profile:', error);
        throw error;
    }
};
export const fetchCustomerWishlist = async (customerId: string, companyDomain: string) => {
    try {
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
            console.error('Failed to fetch wishlist');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching wishlist:', error);

    }
}
export const fetchAddWishList = async (productId: string, customerId: string, companyDomain: string) => {
    console.log("productId", productId);
    console.log("customerId", customerId);

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
            console.error('Failed to update wishlist');
        }
        return await response.json();
    } catch (error) {
        console.error('Error updating wishlist:', error);
    }
};
export const fetchDeleteWishList = async (productId: string, customerId: string, companyDomain: string) => {
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
            console.error('Failed to update wishlist');
        }
        return await response.json();
    } catch (error) {
        console.error('Error updating wishlist:', error);
    }
};
export const fetchAddToCart = async (productVariantId: string, quantity: number, customerId: string, companyDomain: string) => {
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
            console.error('Failed to add to cart');
        }
        return await response.json();
    } catch (error) {
        console.error('Error adding to cart:', error);
    }
};
export const fetchRemoveFromCart = async (customerId: string, cartId: string, cartItemId: string, companyDomain: string) => {
    console.log('8888888888888')
    console.log('customerId', customerId)
    console.log('cartId', cartId)
    console.log('cartItemId', cartItemId)

    try {
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
            console.error('Failed to remove from cart');
        }
        return await response.json();
    } catch (error) {
        console.error('Error removing from cart:', error);
    }
};
export const fetchGetCartList = async (customerId: string, companyDomain: string) => {
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
            console.error('Failed to fetch cart');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching cart:', error);
    }
};
export const fetchUpdateCartQuantity = async (productVariantId: string, quantity: number, customerId: string, companyDomain: string) => {
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
            console.error('Failed to update cart quantity');
        }
        return await response.json();
    } catch (error) {
        console.error('Error updating cart quantity:', error);

    }
}