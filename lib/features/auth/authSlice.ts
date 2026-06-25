import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User, UserRole, VendorUser } from "../../../utils/Types";
import {
  ACCESS_TOKEN_KEY,
  CART_KEY,
  IS_AUTHENTICATED_KEY,
  isClient,
  REFRESH_TOKEN_KEY,
  USER_STORAGE_KEY,
  WISHLIST_KEY,
} from "@/constants";

// Helper to get User
// const getUserFromLocalStorage = () => {
//   if (!isClient) return null;
//   try {
//     const serializedUser = localStorage.getItem(USER_STORAGE_KEY);
//     if (
//       serializedUser &&
//       serializedUser !== "undefined" &&
//       serializedUser !== "null"
//     ) {
//       return JSON.parse(serializedUser);
//     }
//     return null;
//   } catch (e) {
//     return null;
//   }
// };

// Helper to get Token
// const getAccessTokenFromLocalStorage = () => {
//   if (!isClient) return null;
//   return localStorage.getItem(ACCESS_TOKEN_KEY) || null;
// };

// const getRefreshTokenFromLocalStorage = () => {
//   if (!isClient) return null;
//   return localStorage.getItem(REFRESH_TOKEN_KEY) || null;
// };

export interface AuthType {
  isAuthenticated: boolean;
  user: Partial<User | VendorUser> | null;
  loading: boolean;
  error: string | null;
  access_token: string | null;
  refresh_token: string | null;
  role: UserRole;
  isLoginModalOpen: boolean;
  loginRedirectUrl: string | null;
}

const initialState: AuthType = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
  access_token: null,
  refresh_token: null,
  role: UserRole.CUSTOMER,
  isLoginModalOpen: false,
  loginRedirectUrl: null,
};

export const getPreloadedAuthState = (): { auth: AuthType } => {
  return {
    auth: initialState,
  };
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrateAuth(state) {
      if (isClient) {
        try {
          const isAuthRaw = localStorage.getItem(IS_AUTHENTICATED_KEY);
          const parsedAuth = isAuthRaw ? JSON.parse(isAuthRaw) : null;

          state.isAuthenticated = !!parsedAuth?.isAuthenticated;
          state.role = parsedAuth?.role || UserRole.CUSTOMER;

          const serializedUser = localStorage.getItem(USER_STORAGE_KEY);
          if (
            serializedUser &&
            serializedUser !== "undefined" &&
            serializedUser !== "null"
          ) {
            state.user = JSON.parse(serializedUser);
          } else {
            state.user = null;
          }

          state.access_token = localStorage.getItem(ACCESS_TOKEN_KEY) || null;
          state.refresh_token = localStorage.getItem(REFRESH_TOKEN_KEY) || null;
        } catch (e) {}
      }
    },
    openLoginModal(state, action: PayloadAction<string | null>) {
      state.isLoginModalOpen = true;
      state.loginRedirectUrl = action.payload || null;
    },
    closeLoginModal(state) {
      state.isLoginModalOpen = false;
      state.loginRedirectUrl = null;
      state.error = null;
    },
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
    loginSuccess(
      state,
      action: {
        payload: {
          user: Partial<User | VendorUser>;
          access_token: string;
          refresh_token: string;
          role: UserRole;
        };
      },
    ) {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.access_token = action.payload.access_token;
      state.refresh_token = action.payload.refresh_token;
      state.role = action.payload.role;
      state.loading = false;
      state.error = null;
      state.isLoginModalOpen = false;
      state.loginRedirectUrl = null;

      if (isClient) {
        // Keep everything uniformly in localStorage
        localStorage.setItem(
          IS_AUTHENTICATED_KEY,
          JSON.stringify({ isAuthenticated: true, role: action.payload.role }),
        );
        localStorage.setItem(
          USER_STORAGE_KEY,
          JSON.stringify(action.payload.user),
        );
        localStorage.setItem(ACCESS_TOKEN_KEY, action.payload.access_token); // Store token as a raw string
        localStorage.setItem(REFRESH_TOKEN_KEY, action.payload.refresh_token); // Store token as a raw string
      }
    },
    logOut(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.access_token = null;
      state.refresh_token = null;
      state.loading = false;
      state.error = null;

      if (isClient) {
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(CART_KEY);
        localStorage.removeItem(IS_AUTHENTICATED_KEY);
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(WISHLIST_KEY);
      }
    },

    updateUserProfile: (state, action) => {
      if (state.user) {
        Object.assign(state.user, action.payload);
      }
    },
  },
});

export const {
  hydrateAuth,
  openLoginModal,
  closeLoginModal,
  loginStart,
  loginEnd,
  loginFailure,
  loginSuccess,
  logOut,
  updateUserProfile,
} = authSlice.actions;

export const authReducer = authSlice.reducer;
