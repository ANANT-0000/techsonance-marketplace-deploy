import { createSlice } from '@reduxjs/toolkit';
import { UserRole, User, VendorUser } from '../../../utils/Types';
import { ACCESS_TOKEN_KEY, CART_KEY, IS_AUTHENTICATED_KEY, isClient, USER_STORAGE_KEY, WISHLIST_KEY } from '@/constants';


const getUserFromLocalStorage = () => {
    if (!isClient) return null;
    try {
        const serializedUser = localStorage.getItem(USER_STORAGE_KEY);
        if (serializedUser !== undefined && serializedUser !== null) {
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
    user: Partial<User | VendorUser> | null;
    loading: boolean;
    error: string | null;
    token: string | null;
    role: UserRole;
    // addresses: any[] | null;
}


const initialState: AuthType = {
    isAuthenticated: false,
    user: getUserFromLocalStorage(),
    loading: false,
    error: null,
    token: null,
    role: UserRole.Customer,
    // addresses: null,
};
export const getPreloadedAuthState = (): { auth: AuthType } => {
    if (!isClient) {
        return {
            auth: {
                isAuthenticated: false,
                user: null,
                loading: false,
                error: null,
                token: null,
                role: UserRole.Customer,
            }
        };
    }
    const isAuthRaw = localStorage.getItem(IS_AUTHENTICATED_KEY);
    const parsedAuth = isAuthRaw ? JSON.parse(isAuthRaw) : null;
    return {
        auth: {
            isAuthenticated: !!parsedAuth?.isAuthenticated,
            user: getUserFromLocalStorage(),
            loading: false,
            error: null,
            token: null,
            role: parsedAuth?.role || UserRole.Customer,
            // addresses: null,
        }
    };
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart(state) {
            state.loading = true;
            state.error = null;
        },
        loginEnd(state) {
            state.loading = false;
        },
        loginFailure(state, action) {
            state.loading = false;
            state.error = action.payload;
        },
        loginSuccess(state, action: { payload: { user: any, token: string, role: UserRole } }) {
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.role = action.payload.role;
            state.loading = false;
            state.error = null;
            console.log("state.user", state.user);
            if (isClient) {
                localStorage.setItem(IS_AUTHENTICATED_KEY, JSON.stringify({ isAuthenticated: true, role: action.payload.role }));
                localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(action.payload.user));
                sessionStorage.setItem(ACCESS_TOKEN_KEY, JSON.stringify({
                    token: action.payload.token,
                    expiresAt: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
                }));
            }
        },
        logOut(state) {

            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            state.loading = false;
            state.error = null;
            if (isClient) {
                localStorage.removeItem(USER_STORAGE_KEY);
                localStorage.removeItem(CART_KEY);
                localStorage.removeItem(IS_AUTHENTICATED_KEY);
                localStorage.removeItem(WISHLIST_KEY);
                sessionStorage.removeItem(ACCESS_TOKEN_KEY);
            }
        },

        // ========== USER PROFILE MANAGEMENT ==========
        updateUserProfile: (state, action) => {
            if (state.user) {
                Object.assign(state.user, action.payload);
            }
        },

        // ========== ADDRESS MANAGEMENT ==========
        //     createAddress: (state, action) => {
        //         if (state.user) {
        //             state.addresses.push(action.payload);
        //         }
        //     },

        //     updateAddress: (state, action) => {
        //         if (state.user) {
        //             const index = state.addresses.findIndex(
        //                 address => address.address_id === action.payload.address_id
        //             );
        //             if (index !== -1) {
        //                 state.addresses[index] = action.payload;
        //             }
        //         }
        //     },

        //     deleteAddress: (state, action) => {
        //         if (state.user) {
        //             state.user.addresses = state.user.addresses.filter(
        //                 address => address.address_id !== action.payload
        //             );
        //         }
        //     },

        //     setDefaultAddress: (state, action) => {
        //         if (state.user) {
        //             state.user.addresses.forEach(address => {
        //                 address.is_default = false;
        //             });
        //             const address = state.user.addresses.find(
        //                 addr => addr.address_id === action.payload
        //             );
        //             if (address) {
        //                 address.is_default = true;
        //             }
        //         }
        //     }
    }
});

export const {
    loginStart,
    loginEnd,
    loginFailure,
    loginSuccess,
    logOut,
    updateUserProfile,
    // createAddress,
    // updateAddress,
    // deleteAddress,
    // setDefaultAddress
} = authSlice.actions;

export const authReducer = authSlice.reducer;