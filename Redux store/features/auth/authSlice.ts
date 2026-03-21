import { createSlice } from '@reduxjs/toolkit';
import { RoleDefinition, UserProfile, UserRole } from '../../../utils/Types';
import { MockUser } from '@/utils/customer/constants';

const isClient = typeof window !== 'undefined';


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
    role: UserRole;
}

const AUTH_TOKEN = 'authToken';

const initialState: AuthType = {
    isAuthenticated: isClient ? !!localStorage.getItem(AUTH_TOKEN) : false,
    user: getUserFromLocalStorage() || MockUser, // Load user from localStorage or use mock data for development    
    loading: false,
    error: null,
    token: isClient ? localStorage.getItem(AUTH_TOKEN) : null,
    role: UserRole.Customer,
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
        loginSuccess(state, action: { payload: { user: UserProfile, token: string, role: UserRole } }) {
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