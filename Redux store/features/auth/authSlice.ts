import { createSlice } from '@reduxjs/toolkit';
import type { RoleDefinition, UserProfile, UserRole } from '../../utils/Types';

const isClient = typeof window !== 'undefined';

export const MockUser: UserProfile = {
    "user_id": 1024,
    "company_id": 501,
    "user_role_id": 1,
    "name": "Alex Rivier",
    "email": "alex.rivier@soundsphere.com",
    "profileImgUrl": "https://i.pinimg.com/originals/74/a3/b6/74a3b6a8856b004dfff824ae9668fe9b.jpg",
    "phone": "+91 98765 43210",
    "user_status": "active",
    "created_at": "2025-11-15T10:30:00Z",

    "addresses": [
        {
            "address_id": 2045,
            "address_for": "home",
            "address_line1": "Flat 402, Melody Heights",
            "city": "Ahmedabad",
            "state": "Gujarat",
            "phone": "+91 98765 43210",
            "country": "India",
            "postal_code": "380001",
            "is_default": true
        },
        {
            "address_id": 2046,
            "address_for": "work",
            "address_line1": "Office 301, Sound Tower",
            "city": "Mumbai",
            "state": "Maharashtra",
            "phone": "+91 98765 43210",
            "country": "India",
            "postal_code": "400001",
            "is_default": false
        }
    ],

    "cart": {
        "cart_id": 8821,
        "created_at": "2026-02-10T14:20:00Z",
        "items": [
            {
                "cart_item_id": 1,
                "variant_id": 502,
                "quantity": 1
            },
            {
                "cart_item_id": 2,
                "variant_id": 305,
                "quantity": 2
            }
        ]
    },

    "wishlist": {
        "wishlist_id": 554,
        "items": [701, 705, 812]
    },

    "orders": [
        {
            "order_id": 9001,
            "products": [
                { "product_id": "sp-003", "quantity": 1 },
            ],
            "shippingTo": "Alex Rivier ",
            "order_status": "Delivered",
            "delivered_at": "2026-01-25T12:00:00Z",
            "total_amount": 19999.00,
            "address_id": 2045,
            "created_at": "2026-01-20T09:15:00Z"
        },
        {
            "order_id": 9552,
            "products": [
                { "product_id": "mc-004", "quantity": 1 }
            ],
            "shippingTo": "Alex Rivier ",
            "order_status": "Pending",
            "total_amount": 8490.00,
            "address_id": 2045,
            "created_at": "2026-02-05T16:45:00Z"
        },
        {
            "order_id": 9603,
            "products": [
                { "product_id": "hd-001", "quantity": 1 },
                { "product_id": "eb-006", "quantity": 2 }
            ],
            "shippingTo": "Alex Rivier",
            "order_status": "Shipped",
            "total_amount": 63988.00,
            "address_id": 2046,
            "created_at": "2026-03-01T10:30:00Z"
        },
        {
            "order_id": 9701,
            "products": [
                { "product_id": "sp-007", "quantity": 1 }
            ],
            "shippingTo": "Alex Rivier",
            "order_status": "Cancelled",
            "total_amount": 9999.00,
            "address_id": 2045,
            "created_at": "2026-02-20T14:00:00Z"
        }
    ]
}

const getUserFromLocalStorage = () => {
    if (!isClient) return null;
    try {
        const serializedUser = localStorage.getItem('user');
        if (serializedUser) {
            return JSON.parse(serializedUser);
        } else {
            return null;
        }
    }
    catch (e) {
        console.error("Could not load user from localStorage", e);
        return null;
    }
}

export interface AuthType {
    isAuthenticated: boolean;
    user: UserProfile | null;
    loading: boolean;
    error: string | null;
    token: string | null;
    role: Record<UserRole, RoleDefinition>;
}

const AUTH_TOKEN = 'authToken';

const initialState: AuthType = {
    isAuthenticated: isClient ? !!localStorage.getItem(AUTH_TOKEN) : false,
    user: getUserFromLocalStorage() || MockUser,
    loading: false,
    error: null,
    token: isClient ? localStorage.getItem(AUTH_TOKEN) : null,
    role: {} as Record<UserRole, RoleDefinition>,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart(state) {
            state.loading = true;
            state.error = null;
        },
        loginFailure(state, action) {
            state.loading = false;
            state.error = action.payload;
        },
        loginSuccess(state, action) {
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.role = action.payload.role;
            state.loading = false;
            state.error = null;
            if (isClient) {
                localStorage.setItem(AUTH_TOKEN, action.payload.token);
            }
        },
        logOut(state) {
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            state.loading = false;
            state.error = null;
            if (isClient) {
                localStorage.removeItem(AUTH_TOKEN);
                localStorage.removeItem('user');
                localStorage.removeItem('cart');
            }
        },

        // ========== USER PROFILE MANAGEMENT ==========
        updateUserProfile: (state, action) => {
            if (state.user) {
                Object.assign(state.user, action.payload);
            }
        },

        // ========== ADDRESS MANAGEMENT ==========
        createAddress: (state, action) => {
            if (state.user) {
                state.user.addresses.push(action.payload);
            }
        },

        updateAddress: (state, action) => {
            if (state.user) {
                const index = state.user.addresses.findIndex(
                    address => address.address_id === action.payload.address_id
                );
                if (index !== -1) {
                    state.user.addresses[index] = action.payload;
                }
            }
        },

        deleteAddress: (state, action) => {
            if (state.user) {
                state.user.addresses = state.user.addresses.filter(
                    address => address.address_id !== action.payload
                );
            }
        },

        setDefaultAddress: (state, action) => {
            if (state.user) {
                state.user.addresses.forEach(address => {
                    address.is_default = false;
                });
                const address = state.user.addresses.find(
                    addr => addr.address_id === action.payload
                );
                if (address) {
                    address.is_default = true;
                }
            }
        }
    }
});

export const {
    loginStart,
    loginFailure,
    loginSuccess,
    logOut,
    updateUserProfile,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
} = authSlice.actions;

export const authReducer = authSlice.reducer;