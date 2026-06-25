// 'use server';
import { BASE_API_URL, CUSTOMER_BASE_URL } from "@/constants";
import { getCompanyDomain } from "@/lib/get-domain";
import { getCacheConfig } from "./cache";

export const fetchcustomer = async (token: string) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(`${CUSTOMER_BASE_URL}/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "company-domain": companyDomain,
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status !== 200) {
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};
export const fetchCustomerWishlist = async (
  customerId: string,
  token: string,
) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(`${BASE_API_URL}/v1/wishlist/${customerId} `, {
      method: "GET",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
        "company-domain": companyDomain,
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status !== 200) {
      return { success: false, data: [] };
    }
    return await response.json();
  } catch (error) {
    return { success: false, data: [] };
  }
};
export const fetchAddWishList = async (
  productId: string,
  customerId: string,
  token: string,
) => {
  const companyDomain = await getCompanyDomain();

  try {
    const response = await fetch(`${BASE_API_URL}/v1/wishlist/${customerId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "company-domain": companyDomain,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productVariantId: productId }),
    });
    if (response.status !== 200) {
    }
    return await response.json();
  } catch (error) {}
};
export const fetchDeleteWishList = async (
  productId: string,
  customerId: string,
  token: string,
) => {
  const companyDomain = await getCompanyDomain();
  try {
    const response = await fetch(`${BASE_API_URL}/v1/wishlist/${customerId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "company-domain": companyDomain,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productVariantId: productId }),
    });
    if (response.status !== 200) {
    }
    return await response.json();
  } catch (error) {}
};
export const fetchAddToCart = async (
  productVariantId: string,
  quantity: number,
  customerId: string,
  token: string,
) => {
  const companyDomain = await getCompanyDomain();
  try {
    const response = await fetch(`${BASE_API_URL}/v1/cart/${customerId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "company-domain": companyDomain,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productVariantId, quantity }),
    });
    if (response.status !== 200) {
    }
    return await response.json();
  } catch (error) {}
};
export const fetchRemoveFromCart = async (
  customerId: string,
  cartId: string,
  cartItemId: string,
  token: string,
) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(`${BASE_API_URL}/v1/cart/${customerId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "company-domain": companyDomain,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ cartId, cartItemId }),
    });
    if (response.status !== 200) {
    }
    return await response.json();
  } catch (error) {}
};
export const fetchGetCartList = async (customerId: string, token: string) => {
  const companyDomain = await getCompanyDomain();
  try {
    const response = await fetch(`${BASE_API_URL}/v1/cart/${customerId}`, {
      method: "GET",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
        "company-domain": companyDomain,
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status !== 200) {
    }
    return await response.json();
  } catch (error) {}
};
export const fetchUpdateCartQuantity = async (
  productVariantId: string,
  quantity: number,
  customerId: string,
  token: string,
) => {
  const companyDomain = await getCompanyDomain();
  try {
    const response = await fetch(`${BASE_API_URL}/v1/cart/${customerId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "company-domain": companyDomain,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productVariantId, quantity }),
    });
    if (response.status !== 200) {
    }
    return await response.json();
  } catch (error) {}
};

export const fetchGetUserAddresses = async (
  customerId: string,
  token: string,
) => {
  const companyDomain = await getCompanyDomain();
  try {
    const response = await fetch(
      `${BASE_API_URL}/v1/address/customer/${customerId}`,
      {
        method: "GET",
        cache: "no-cache",
        headers: {
          "Content-Type": "application/json",
          "company-domain": companyDomain,
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (response.status !== 200) {
      return { success: false, status: response.status, data: [] };
    }
    return await response.json();
  } catch (error) {
    return { success: false, status: 500, data: [] };
  }
};

export const fetchGetAddressById = async (
  customerId: string,
  addressId: string,
  token: string,
) => {};

export const fetchSetDefaultAddress = async (
  customerId: string,
  addressId: string,
  token: string,
) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(
      `${BASE_API_URL}/v1/address/customer/${customerId}/${addressId}/default`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "company-domain": companyDomain,
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (response.status !== 200) {
      return;
    }
    return await response.json();
  } catch (error) {}
};

export const checkAddressExistence = async (
  customerId: string,
  token: string,
) => {
  try {
    const response = await fetch(
      `${BASE_API_URL}/v1/address/customer/${customerId}/addresses-exist`,
      {
        method: "GET",
        cache: "no-cache",
        headers: {
          "Content-Type": "application/json",
          "company-domain": await getCompanyDomain(),
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const responseData = await response.json();
    if (response.ok) {
      return responseData.data;
    }
    return {
      count: 0,
      hasAddresses: false,
    };
  } catch (error) {
    return false;
  }
};

export const fetchInitiatePayment = async (
  customerId: string,
  paymentData: any,
  token: string,
) => {
  const companyDomain = await getCompanyDomain();
  try {
    const response = await fetch(
      `${BASE_API_URL}/v1/checkout/${customerId}/initiate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "company-domain": companyDomain,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(paymentData),
      },
    );

    if (!response.ok) {
      return { success: false };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false };
  }
};

export const fetchUserOrderHistory = async (
  customerId: string,
  token: string,
) => {
  const companyDomain = await getCompanyDomain();
  try {
    const response = await fetch(
      `${BASE_API_URL}/v1/orders-items/user/${customerId}`,
      {
        method: "GET",
        cache: "no-cache",
        headers: {
          "Content-Type": "application/json",
          "company-domain": companyDomain,
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (response.status !== 200) {
    }
    return await response.json();
  } catch (error) {}
};
export const fetchOrderDetails = async (orderId: string, token: string) => {
  const companyDomain = await getCompanyDomain();
  try {
    const response = await fetch(`${BASE_API_URL}/v1/orders/${orderId}`, {
      method: "GET",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
        "company-domain": companyDomain,
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status !== 200) {
    }
    return await response.json();
  } catch (error) {}
};
export const fetchOrderItemDetails = async (
  orderItemId: string,
  token: string,
) => {
  const companyDomain = await getCompanyDomain();
  try {
    const response = await fetch(
      `${BASE_API_URL}/v1/order-items/${orderItemId}`,
      {
        method: "GET",
        cache: "no-cache",
        headers: {
          "Content-Type": "application/json",
          "company-domain": companyDomain,
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (response.status !== 200) {
    }
    return await response.json();
  } catch (error) {}
};

export const fetchCancelOrderItem = async (
  userId: string,
  itemId: string,
  reason: string,
  token: string,
) => {
  const domain = await getCompanyDomain();
  const response = await fetch(
    `${BASE_API_URL}/v1/order-items/${itemId}/cancel`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "company-domain": domain,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId,
        cancelReason: reason,
        cancelled_by: "customer",
      }),
    },
  );
  return response.json();
};
export const fetchReturnReplaceItem = async (
  userId: string,
  formData: FormData,
  token: string,
) => {
  const domain = await getCompanyDomain();
  try {
    const response = await fetch(`${BASE_API_URL}/v1/returns/user/${userId}`, {
      method: "POST",
      headers: {
        "company-domain": domain,
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data?.message ?? "Request failed" };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
};

export const fetchUserReturns = async (userId: string, token: string) => {
  const domain = await getCompanyDomain();
  try {
    const response = await fetch(`${BASE_API_URL}/v1/returns/user/${userId}`, {
      method: "GET",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
        "company-domain": domain,
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status !== 200) {
    }
    return await response.json();
  } catch (error) {}
};
export const fetchSubmitReview = async (
  reviewData: FormData,
  userId: string,
  token: string,
) => {
  const companyDomain = await getCompanyDomain();
  try {
    const response = await fetch(
      `${BASE_API_URL}/v1/product-review/${userId}`,
      {
        method: "POST",
        headers: {
          "company-domain": companyDomain,
          Authorization: `Bearer ${token}`,
        },
        body: reviewData,
      },
    );
    if (response.status !== 200 && response.status !== 201) {
    }
    return await response.json();
  } catch (error) {}
};
export const fetchReviews = async (productId: string) => {
  try {
    const response = await fetch(
      `${BASE_API_URL}/v1/product-review/product/${productId}`,
      {
        method: "GET",
        ...getCacheConfig(300),
        headers: {
          "Content-Type": "application/json",
          "company-domain": await getCompanyDomain(),
        },
      },
    );
    if (response.status !== 200) {
      return {
        data: [],
      };
    }
    return await response.json();
  } catch (error) {
    return {
      data: [],
    };
  }
};
export const fetchExistingReviews = async (
  variantId: string,
  userId: string,
  token: string,
) => {
  try {
    const response = await fetch(
      `${BASE_API_URL}/v1/product-review/existing/${variantId}/${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "company-domain": await getCompanyDomain(),
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (response.status !== 200) {
      return {
        data: [],
      };
    }
    return await response.json();
  } catch (error) {
    return {
      data: [],
    };
  }
};
