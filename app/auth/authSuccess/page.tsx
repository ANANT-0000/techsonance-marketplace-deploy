"use client";
import { useEffect, useReducer, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { jwtDecode } from "jwt-decode";
import { loginSuccess } from "@/lib/features/auth/authSlice";
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  User,
  UserRole,
} from "@/constants";
import { AccountReactivation } from "@/components/customer/AccountReactivationModel";
import { AUTH_SUCCESS_TEXT } from "@/constants/authText";

export enum LoginStatusEnum {
  PROCESSING = "processing",
  SUCCESS = "success",
  ERROR = "error",
}

export enum ActionType {
  SET_STATUS = 'SET_STATUS',
  SET_ERROR_MESSAGE = 'SET_ERROR_MESSAGE',
  SET_IS_REACTIVATION_OPEN = 'SET_IS_REACTIVATION_OPEN',
  SET_USER_EMAIL = 'SET_USER_EMAIL',
}

type Action =
  | { type: ActionType.SET_STATUS; payload: LoginStatusEnum }
  | { type: ActionType.SET_ERROR_MESSAGE; payload: string }
  | { type: ActionType.SET_IS_REACTIVATION_OPEN; payload: boolean }
  | { type: ActionType.SET_USER_EMAIL; payload: string };

interface State {
  status: LoginStatusEnum;
  errorMessage: string;
  isReactivationOpen: boolean;
  userEmail: string;
}

const initialState: State = {
  status: LoginStatusEnum.PROCESSING,
  errorMessage: "",
  isReactivationOpen: false,
  userEmail: "",
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case ActionType.SET_STATUS: return { ...state, status: action.payload };
    case ActionType.SET_ERROR_MESSAGE: return { ...state, errorMessage: action.payload };
    case ActionType.SET_IS_REACTIVATION_OPEN: return { ...state, isReactivationOpen: action.payload };
    case ActionType.SET_USER_EMAIL: return { ...state, userEmail: action.payload };
    default: return state;
  }
}

function AuthSuccessHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  
  const [state, dispatchState] = useReducer(reducer, initialState);

  useEffect(() => {
    const handleAuthSuccess = async () => {
      try {
        const accessToken = searchParams.get("access_token");
        const refreshToken = searchParams.get("refresh_token");
        const message = searchParams.get("message");
        const status = searchParams.get("status");
        const email = searchParams.get("email");
        
        dispatchState({ type: ActionType.SET_USER_EMAIL, payload: email ? email : "" });
        
        if (!accessToken) {
          if (status == "423") {
            dispatchState({ type: ActionType.SET_IS_REACTIVATION_OPEN, payload: true });
            dispatchState({ type: ActionType.SET_ERROR_MESSAGE, payload: message ? message : AUTH_SUCCESS_TEXT.ERR_NO_TOKEN });
            return;
          }
          dispatchState({ type: ActionType.SET_STATUS, payload: status ? LoginStatusEnum[status as keyof typeof LoginStatusEnum] : LoginStatusEnum.ERROR });
          dispatchState({ type: ActionType.SET_ERROR_MESSAGE, payload: message ? message : AUTH_SUCCESS_TEXT.ERR_NO_TOKEN });
          setTimeout(() => router.push("/auth/customerLogin"), 2000);
          return;
        }

        try {
          const payload: {
            user: Partial<User>;
            role: Partial<UserRole>;
          } = jwtDecode(accessToken);
          localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
          if (refreshToken) {
            localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
          }

          dispatch(
            loginSuccess({
              access_token: accessToken,
              refresh_token: refreshToken ?? "",
              user: {
                id: payload.user.id,
                profile_picture_url: payload.user.profile_picture_url,
                first_name: payload.user.first_name,
                last_name: payload.user.last_name,
                email: payload.user.email,
                country_code: payload.user.country_code,
                phone_number: payload.user.phone_number,
                user_status: payload.user.user_status,
                company_id: payload.user.company_id,
                role_id: payload.user.role_id,
              },
              role: payload.role,
            }),
          );

          dispatchState({ type: ActionType.SET_STATUS, payload: LoginStatusEnum.SUCCESS });

          setTimeout(() => {
            const oauthRedirect = sessionStorage.getItem("oauth_redirect");
            if (oauthRedirect) {
              sessionStorage.removeItem("oauth_redirect");
              router.push(oauthRedirect);
            } else {
              router.push("/");
            }
          }, 1000);
        } catch (decodeError) {
          dispatchState({ type: ActionType.SET_STATUS, payload: LoginStatusEnum.ERROR });
          dispatchState({ type: ActionType.SET_ERROR_MESSAGE, payload: AUTH_SUCCESS_TEXT.ERR_INVALID_TOKEN });
          setTimeout(() => router.push("/auth/customerLogin"), 2000);
        }
      } catch (error) {
        dispatchState({ type: ActionType.SET_STATUS, payload: LoginStatusEnum.ERROR });
        dispatchState({ type: ActionType.SET_ERROR_MESSAGE, payload: AUTH_SUCCESS_TEXT.ERR_AUTH_FAILED });
        setTimeout(() => router.push("/auth/customerLogin"), 2000);
      }
    };

    handleAuthSuccess();
  }, [searchParams, router, dispatch]);

  const handleReactivationSuccess = () => {
    dispatchState({ type: ActionType.SET_IS_REACTIVATION_OPEN, payload: false });
    router.push("/auth/customerLogin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white p-8 rounded-2xl shadow-2xl  w-full mx-4">
        {state.status === LoginStatusEnum.PROCESSING && (
          <div className="text-center animate-in fade-in duration-300">
            <div className="mb-6">
              <svg
                className="animate-spin h-16 w-16 text-blue-600 mx-auto"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <h2 className="text-theme-h4 font-bold text-gray-800 mb-2">
              {AUTH_SUCCESS_TEXT.TITLE_PROCESSING}
            </h2>
            <p className="text-slate-600">
              {AUTH_SUCCESS_TEXT.DESC_PROCESSING}
            </p>
          </div>
        )}

        {state.status === LoginStatusEnum.SUCCESS && (
          <div className="text-center animate-in fade-in zoom-in duration-300">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-theme-h4 font-bold text-gray-800 mb-2">{AUTH_SUCCESS_TEXT.TITLE_SUCCESS}</h2>
            <p className="text-slate-600">
              {AUTH_SUCCESS_TEXT.DESC_SUCCESS}
            </p>
          </div>
        )}

        {state.status === LoginStatusEnum.ERROR && (
          <div className="text-center animate-in fade-in zoom-in duration-300">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-theme-h4 font-bold text-gray-800 mb-2">
              {AUTH_SUCCESS_TEXT.TITLE_ERROR}
            </h2>
            <p className="text-slate-600 mb-4">
              {state.errorMessage || AUTH_SUCCESS_TEXT.DESC_ERROR_FALLBACK}
            </p>
            <p className="text-theme-body-sm text-slate-500">
              {AUTH_SUCCESS_TEXT.DESC_REDIRECTING}
            </p>
          </div>
        )}
      </div>
      <AccountReactivation
        isOpen={state.isReactivationOpen}
        onClose={() => dispatchState({ type: ActionType.SET_IS_REACTIVATION_OPEN, payload: false })}
        onSuccess={handleReactivationSuccess}
        emailMasked={state.userEmail}
      />
    </div>
  );
}

export default function AuthSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
          <svg
            className="animate-spin h-16 w-16 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      }
    >
      <AuthSuccessHandler />
    </Suspense>
  );
}
