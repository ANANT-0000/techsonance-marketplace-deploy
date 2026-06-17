"use client";

import { useReducer } from "react";
import {
  Key,
  ShieldCheck,
  Smartphone,
  History,
  Monitor,
  MapPin,
  LogOut,
  AlertTriangle,
  Trash2,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { RootState } from "@/lib/store";
import { OtpVerificationModal } from "@/components/common/OtpVerificationModal";
import AxiosAPI from "@/lib/axios";
import { logOut } from "@/lib/features/auth/authSlice";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { SETTINGS_PAGE_TEXT } from "@/constants/customerText";

// Session Data
const activeSessions = [
  {
    id: 1,
    device: "MacBook Pro - Chrome",
    location: "Ahmedabad, India",
    ip: "192.168.1.1",
    time: "Active now",
    isCurrent: true,
    icon: Monitor,
  },
  {
    id: 2,
    device: "iPhone 14 Pro - Safari",
    location: "Ahmedabad, India",
    ip: "192.168.1.45",
    time: "2 hours ago",
    isCurrent: false,
    icon: Smartphone,
  },
  {
    id: 3,
    device: "Windows PC - Edge",
    location: "Mumbai, India",
    ip: "103.45.67.89",
    time: "May 1, 2026",
    isCurrent: false,
    icon: Monitor,
  },
];

export enum SettingsActionType {
  SET_2FA_ENABLED = "SET_2FA_ENABLED",
  SET_CONFIRM_MODAL_OPEN = "SET_CONFIRM_MODAL_OPEN",
  SET_CONFIRM_MODAL_CONFIG = "SET_CONFIRM_MODAL_CONFIG",
  SET_PROCESSING = "SET_PROCESSING",
  SET_OTP_MODAL_OPEN = "SET_OTP_MODAL_OPEN",
  SET_OTP_ACTION_TARGET = "SET_OTP_ACTION_TARGET",
}

interface SettingsState {
  is2FAEnabled: boolean;
  isConfirmModalOpen: boolean;
  confirmModalConfig: any;
  isProcessing: boolean;
  isOtpModalOpen: boolean;
  otpActionTarget: "deactivate" | "delete";
}

type SettingsAction =
  | { type: SettingsActionType.SET_2FA_ENABLED; payload: boolean }
  | { type: SettingsActionType.SET_CONFIRM_MODAL_OPEN; payload: boolean }
  | { type: SettingsActionType.SET_CONFIRM_MODAL_CONFIG; payload: any }
  | { type: SettingsActionType.SET_PROCESSING; payload: boolean }
  | { type: SettingsActionType.SET_OTP_MODAL_OPEN; payload: boolean }
  | { type: SettingsActionType.SET_OTP_ACTION_TARGET; payload: "deactivate" | "delete" };

const settingsReducer = (state: SettingsState, action: SettingsAction): SettingsState => {
  switch (action.type) {
    case SettingsActionType.SET_2FA_ENABLED:
      return { ...state, is2FAEnabled: action.payload };
    case SettingsActionType.SET_CONFIRM_MODAL_OPEN:
      return { ...state, isConfirmModalOpen: action.payload };
    case SettingsActionType.SET_CONFIRM_MODAL_CONFIG:
      return { ...state, confirmModalConfig: action.payload };
    case SettingsActionType.SET_PROCESSING:
      return { ...state, isProcessing: action.payload };
    case SettingsActionType.SET_OTP_MODAL_OPEN:
      return { ...state, isOtpModalOpen: action.payload };
    case SettingsActionType.SET_OTP_ACTION_TARGET:
      return { ...state, otpActionTarget: action.payload };
    default:
      return state;
  }
};

export default function SecuritySettingsPage() {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const [state, dispatchSettings] = useReducer(settingsReducer, {
    is2FAEnabled: true,
    isConfirmModalOpen: false,
    confirmModalConfig: {},
    isProcessing: false,
    isOtpModalOpen: false,
    otpActionTarget: "deactivate",
  });

  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleDeactivateClick = () => {
    dispatchSettings({
      type: SettingsActionType.SET_CONFIRM_MODAL_CONFIG,
      payload: {
        title: SETTINGS_PAGE_TEXT.DEACTIVATE_CONFIRM_TITLE,
        message: SETTINGS_PAGE_TEXT.DEACTIVATE_CONFIRM_MSG,
        actionType: "suspend",
        confirmText: SETTINGS_PAGE_TEXT.DEACTIVATE_CONFIRM_ACTION,
        onConfirm: async () => {
          dispatchSettings({ type: SettingsActionType.SET_PROCESSING, payload: true });
          await AxiosAPI.post(`/v1/users/${user?.id}/deactivate`);
          dispatchSettings({ type: SettingsActionType.SET_PROCESSING, payload: false });
          dispatchSettings({ type: SettingsActionType.SET_CONFIRM_MODAL_OPEN, payload: false });

          // Open OTP Modal
          dispatchSettings({ type: SettingsActionType.SET_OTP_ACTION_TARGET, payload: "deactivate" });
          dispatchSettings({ type: SettingsActionType.SET_OTP_MODAL_OPEN, payload: true });
        },
      },
    });
    dispatchSettings({ type: SettingsActionType.SET_CONFIRM_MODAL_OPEN, payload: true });
  };

  const handleVerifyOtp = async (otpCode: string) => {
    dispatchSettings({ type: SettingsActionType.SET_PROCESSING, payload: true });
    try {
      const res = await AxiosAPI.patch(
        `/v1/users/${user?.id}/deactivate/confirm`,
        { otp: otpCode },
      );
      if (res.data.status === 200) {
        dispatch(logOut());
        router.push("/");
        dispatchSettings({ type: SettingsActionType.SET_OTP_MODAL_OPEN, payload: false });
      } else {
        toast.error(SETTINGS_PAGE_TEXT.INVALID_OTP);
        setTimeout(() => {
          dispatchSettings({ type: SettingsActionType.SET_OTP_MODAL_OPEN, payload: false });
        }, 2000);
      }
    } catch (error) {
      toast.error(SETTINGS_PAGE_TEXT.INVALID_OTP);
      setTimeout(() => {
        dispatchSettings({ type: SettingsActionType.SET_OTP_MODAL_OPEN, payload: false });
      }, 2000);
    } finally {
      dispatchSettings({ type: SettingsActionType.SET_PROCESSING, payload: false });
    }
  };

  const handleResendOtp = async () => {
    await AxiosAPI.post(`/v1/users/${user?.id}/deactivate`);
  };

  const handleDeleteClick = () => {
    dispatchSettings({
      type: SettingsActionType.SET_CONFIRM_MODAL_CONFIG,
      payload: {
        title: SETTINGS_PAGE_TEXT.DELETE_CONFIRM_TITLE,
        message: SETTINGS_PAGE_TEXT.DELETE_CONFIRM_MSG,
        actionType: "danger",
        confirmText: SETTINGS_PAGE_TEXT.DELETE_CONFIRM_ACTION,
        onConfirm: async () => {
          dispatchSettings({ type: SettingsActionType.SET_PROCESSING, payload: true });
          await new Promise((res) => setTimeout(res, 1500));
          dispatchSettings({ type: SettingsActionType.SET_PROCESSING, payload: false });
          dispatchSettings({ type: SettingsActionType.SET_CONFIRM_MODAL_OPEN, payload: false });
        },
      },
    });
    dispatchSettings({ type: SettingsActionType.SET_CONFIRM_MODAL_OPEN, payload: true });
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-12 font-sans text-left px-4 lg:px-8">
      <Toaster />
      
      {/* Mobile Header */}
      <div className="flex items-start gap-3 my-4 sm:hidden shrink-0">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          aria-label="Go back"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex flex-col gap-0 shrink">
          <h1 className="font-bold text-base text-foreground tracking-tight">{SETTINGS_PAGE_TEXT.TITLE}</h1>
          <p className="text-xs text-muted-foreground text-wrap">
            {SETTINGS_PAGE_TEXT.SUBTITLE}
          </p>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="mb-8 hidden sm:block">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">{SETTINGS_PAGE_TEXT.TITLE}</h1>
        <p className="text-xs text-muted-foreground mt-1">
          {SETTINGS_PAGE_TEXT.SUBTITLE}
        </p>
      </div>

      {/* --- SECTION 1: Password Management --- */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b border-border flex items-center gap-4 justify-between">
          <div className="p-2.5 bg-secondary text-primary rounded-xl shrink-0">
            <Key size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xs sm:text-sm font-bold text-foreground">{SETTINGS_PAGE_TEXT.CHANGE_PASSWORD_TITLE}</h2>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {SETTINGS_PAGE_TEXT.CHANGE_PASSWORD_DESC}
            </p>
          </div>
          <Link
            href={`/customer/${user?.id}/changePassword`}
            className="text-primary hover:text-primary/80 font-bold text-xs transition-all flex items-center gap-1 shrink-0"
          >
            {SETTINGS_PAGE_TEXT.CHANGE_PASSWORD_ACTION} <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      {/* --- SECTION 2: Two-Factor Authentication --- */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden mb-6 font-sans">
        <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`p-2.5 rounded-xl shrink-0 ${state.is2FAEnabled ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-secondary text-muted-foreground"}`}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-foreground">
                {SETTINGS_PAGE_TEXT.TWO_FA_TITLE}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {SETTINGS_PAGE_TEXT.TWO_FA_DESC}
              </p>
            </div>
          </div>
          <div>
            {state.is2FAEnabled ? (
              <button
                onClick={() => dispatchSettings({ type: SettingsActionType.SET_2FA_ENABLED, payload: false })}
                className="border border-border bg-transparent text-foreground hover:bg-secondary font-semibold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                {SETTINGS_PAGE_TEXT.TWO_FA_MANAGE}
              </button>
            ) : (
              <button
                onClick={() => dispatchSettings({ type: SettingsActionType.SET_2FA_ENABLED, payload: true })}
                className="bg-foreground hover:bg-foreground/90 text-background font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                {SETTINGS_PAGE_TEXT.TWO_FA_ENABLE}
              </button>
            )}
          </div>
        </div>
        {state.is2FAEnabled && (
          <div className="bg-emerald-50/20 border-t border-emerald-500/10 p-4 px-6 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400">
            <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
            <span>{SETTINGS_PAGE_TEXT.TWO_FA_ACTIVE}</span>
          </div>
        )}
      </div>

      {/* --- SECTION 3: Active Sessions (Login History) --- */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden mb-6 font-sans">
        <div className="p-6 border-b border-border flex justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-secondary text-primary rounded-xl shrink-0">
              <History size={20} />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-foreground">
                {SETTINGS_PAGE_TEXT.SESSIONS_TITLE}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {SETTINGS_PAGE_TEXT.SESSIONS_DESC}
              </p>
            </div>
          </div>
          <button className="hidden sm:flex text-xs font-bold text-primary hover:text-primary/80 items-center gap-1.5 cursor-pointer">
            <LogOut size={16} /> {SETTINGS_PAGE_TEXT.LOGOUT_ALL_DEVICES}
          </button>
        </div>
        
        <div className="divide-y divide-border">
          {activeSessions.map((session) => (
            <div
              key={session.id}
              className="p-6 flex items-start justify-between gap-4 hover:bg-secondary/20 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="mt-1 text-muted-foreground/80 shrink-0">
                  <session.icon size={24} />
                </div>
                <div>
                  <p className="font-bold text-foreground text-xs sm:text-sm flex items-center gap-2 flex-wrap">
                    {session.device}
                    {session.isCurrent && (
                      <span className="bg-emerald-100 text-emerald-700 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border border-emerald-200">
                        {SETTINGS_PAGE_TEXT.THIS_DEVICE}
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {session.location}
                    </span>
                    <span>•</span>
                    <span>{session.time}</span>
                  </div>
                </div>
              </div>
              {!session.isCurrent && (
                <button className="text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors cursor-pointer">
                  {SETTINGS_PAGE_TEXT.LOGOUT_DEVICE}
                </button>
              )}
            </div>
          ))}
        </div>
        
        <div className="p-4 bg-secondary/30 border-t border-border sm:hidden flex justify-center">
          <button className="w-full justify-center flex text-xs font-bold text-primary hover:text-primary/80 items-center gap-1.5 cursor-pointer">
            <LogOut size={16} /> {SETTINGS_PAGE_TEXT.LOGOUT_ALL_DEVICES}
          </button>
        </div>
      </div>

      {/* --- SECTION 4: Danger Zone --- */}
      <div className="bg-card rounded-2xl border border-destructive/20 shadow-sm overflow-hidden font-sans">
        <div className="p-6 border-b border-destructive/15 bg-destructive/10">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-destructive/20 text-destructive rounded-xl shrink-0 border border-destructive/10">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-destructive">{SETTINGS_PAGE_TEXT.DANGER_ZONE_TITLE}</h2>
              <p className="text-xs text-destructive/80 mt-0.5">
                {SETTINGS_PAGE_TEXT.DANGER_ZONE_DESC}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border">
          <div>
            <h3 className="font-bold text-foreground text-xs sm:text-sm">{SETTINGS_PAGE_TEXT.DEACTIVATE_TITLE}</h3>
            <p className="text-xs text-muted-foreground mt-1.5 max-w-md leading-relaxed">
              {SETTINGS_PAGE_TEXT.DEACTIVATE_DESC}
            </p>
          </div>
          <button
            onClick={handleDeactivateClick}
            className="border border-border text-foreground hover:bg-secondary/60 font-semibold text-xs px-5 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer"
          >
            {SETTINGS_PAGE_TEXT.DEACTIVATE_ACTION}
          </button>
        </div>

        <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-bold text-foreground text-xs sm:text-sm">{SETTINGS_PAGE_TEXT.DELETE_TITLE}</h3>
            <p className="text-xs text-muted-foreground mt-1.5 max-w-md leading-relaxed">
              {SETTINGS_PAGE_TEXT.DELETE_DESC}
            </p>
          </div>
          <button
            onClick={handleDeleteClick}
            className="bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 text-destructive font-semibold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer active:scale-95"
          >
            <Trash2 size={16} /> {SETTINGS_PAGE_TEXT.DELETE_ACTION}
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={state.isConfirmModalOpen}
        onClose={() => dispatchSettings({ type: SettingsActionType.SET_CONFIRM_MODAL_OPEN, payload: false })}
        onConfirm={state.confirmModalConfig.onConfirm}
        title={state.confirmModalConfig.title}
        message={state.confirmModalConfig.message}
        actionType={state.confirmModalConfig.actionType}
        confirmText={state.confirmModalConfig.confirmText}
        isLoading={state.isProcessing}
      />
      
      <OtpVerificationModal
        isOpen={state.isOtpModalOpen}
        onClose={() => !state.isProcessing && dispatchSettings({ type: SettingsActionType.SET_OTP_MODAL_OPEN, payload: false })}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
        emailMasked={user?.email || ""}
        isLoading={state.isProcessing}
        actionType={state.otpActionTarget}
      />
    </div>
  );
}
