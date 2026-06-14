"use client";

import { useState } from "react";
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
  EyeOff,
  Eye,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { RootState } from "@/lib/store";
import { OtpVerificationModal } from "@/components/common/OtpVerificationModal";
import AxiosAPI from "@/lib/axios";
import { getCompanyDomain } from "@/lib/get-domain";
import { logOut } from "@/lib/features/auth/authSlice";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

// Dummy Session Data
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

export default function SecuritySettingsPage() {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  const dispatch = useAppDispatch();
  const router = useRouter();
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<any>({});
  const [isProcessing, setIsProcessing] = useState(false);
  // Confirmation Modal State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState<any>({});

  // OTP Modal State
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpActionTarget, setOtpActionTarget] = useState<
    "deactivate" | "delete"
  >("deactivate");
  // --- Actions ---

  const handleDeactivateClick = () => {
    setConfirmModalConfig({
      title: "Deactivate Account?",
      message:
        "Your profile, orders, and data will be hidden. You can reactivate your account at any time by logging back in. We will send a verification code to your email to confirm this action.",
      actionType: "suspend",
      confirmText: "Send Verification Code",
      onConfirm: async () => {
        setIsProcessing(true);
        const res = await AxiosAPI.post(`/v1/users/${user?.id}/deactivate`);

        setIsProcessing(false);
        setIsConfirmModalOpen(false);

        // 2. Open OTP Modal
        setOtpActionTarget("deactivate");
        setIsOtpModalOpen(true);
      },
    });
    setIsConfirmModalOpen(true);
  };

  // --- Phase 2: Verify OTP and Execute Action ---
  const handleVerifyOtp = async (otpCode: string) => {
    setIsProcessing(true);
    try {
      const res = await AxiosAPI.patch(
        `/v1/users/${user?.id}/deactivate/confirm`,
        { otp: otpCode },
      );
      if (res.data.status == 200) {
        dispatch(logOut());
        router.push("/");
        setIsOtpModalOpen(false);
      } else {
        toast.error("Invalid OTP");
        setTimeout(() => {
          setIsOtpModalOpen(false);
        }, 2000);
      }
    } catch (error) {
      toast.error("Invalid OTP");
      setTimeout(() => {
        setIsOtpModalOpen(false);
      }, 2000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResendOtp = async () => {
    const res = await AxiosAPI.post(`/v1/users/${user?.id}/deactivate`);
  };

  const handleDeleteClick = () => {
    setConfirmModalConfig({
      title: "Permanently Delete Account?",
      message:
        "Warning: This action is irreversible. All your data, order history, and preferences will be permanently erased.",
      actionType: "danger",
      confirmText: "Delete Forever",
      onConfirm: async () => {
        setIsProcessing(true);
        // Simulate API call
        await new Promise((res) => setTimeout(res, 1500));
        setIsProcessing(false);
        setIsConfirmModalOpen(false);
        // Redirect to logout/home
      },
    });
    setIsConfirmModalOpen(true);
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-12">
      <Toaster />
      <div className="flex items-start gap-3 my-4 sm:hidden shrink-0">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex flex-col gap-0 shrink">
          <h1 className="font-bold text-theme-h5 text-gray-900">Login & Security</h1>
          <p className="text-theme-body-sm text-gray-500 text-wrap">
            Manage your password, active sessions, and secure your account.
          </p>
        </div>
      </div>
      {/* Header */}
      <div className="mb-8 hidden lg:block">
        <h1 className="text-theme-h4 font-bold text-gray-900">Login & Security</h1>
        <p className="text-theme-body-sm text-gray-500 mt-1">
          Manage your password, active sessions, and secure your account.
        </p>
      </div>
      {/* --- SECTION 1: Password Management --- */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3 justify-between">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <Key size={20} />
          </div>
          <div className="flex-1">
            <h2 className="text-theme-h6 font-bold text-gray-800">Change Password</h2>
            <p className="text-theme-body-sm text-gray-500">
              Ensure your account is using a long, random password to stay
              secure.
            </p>
          </div>
          <Link
            href={`/customer/${user?.id}/changePassword`}
            className="text-blue-600 hover:text-blue-700 font-medium text-theme-body-sm transition-colors flex items-center gap-1"
          >
            Change <ChevronRight size={16} />
          </Link>
        </div>
      </div>
      {/* --- SECTION 2: Two-Factor Authentication --- */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${is2FAEnabled ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"}`}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-theme-h6 font-bold text-gray-800">
                Two-Step Verification (2FA)
              </h2>
              <p className="text-theme-body-sm text-gray-500 mt-0.5">
                Add an extra layer of security to your account.
              </p>
            </div>
          </div>
          <div>
            {is2FAEnabled ? (
              <button
                onClick={() => setIs2FAEnabled(false)}
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-theme-body-sm px-5 py-2.5 rounded-xl transition-colors"
              >
                Manage 2FA
              </button>
            ) : (
              <button
                onClick={() => setIs2FAEnabled(true)}
                className="bg-gray-900 hover:bg-gray-800 text-white font-semibold text-theme-body-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm"
              >
                Enable 2FA
              </button>
            )}
          </div>
        </div>
        {is2FAEnabled && (
          <div className="bg-emerald-50/50 border-t border-emerald-100 p-4 px-6 flex items-center gap-2 text-theme-body-sm text-emerald-800">
            <ShieldCheck size={16} className="text-emerald-600" />
            Two-step verification is currently active using your Authenticator
            App.
          </div>
        )}
      </div>
      {/* --- SECTION 3: Active Sessions (Login History) --- */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <History size={20} />
            </div>
            <div>
              <h2 className="text-theme-h6 font-bold text-gray-800">
                Where You're Logged In
              </h2>
              <p className="text-theme-body-sm text-gray-500">
                We'll alert you if anyone logs into your account from a new
                device.
              </p>
            </div>
          </div>
          <button className="hidden sm:flex text-theme-body-sm font-semibold text-blue-600 hover:text-blue-700 items-center gap-1.5">
            <LogOut size={16} /> Log out all devices
          </button>
        </div>
        <div className="divide-y divide-gray-100">
          {activeSessions.map((session) => (
            <div
              key={session.id}
              className="p-6 flex items-start justify-between hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="mt-1 text-gray-400">
                  <session.icon size={24} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-theme-body-sm flex items-center gap-2">
                    {session.device}
                    {session.isCurrent && (
                      <span className="bg-emerald-100 text-emerald-700 text-theme-tiny uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
                        This Device
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-theme-caption text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {session.location}
                    </span>
                    <span>•</span>
                    <span>{session.time}</span>
                  </div>
                </div>
              </div>
              {!session.isCurrent && (
                <button className="text-theme-body-sm font-medium text-gray-500 hover:text-red-600 transition-colors">
                  Log out
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-100 sm:hidden">
          <button className="w-full justify-center flex text-theme-body-sm font-semibold text-blue-600 hover:text-blue-700 items-center gap-1.5">
            <LogOut size={16} /> Log out all devices
          </button>
        </div>
      </div>
      {/* --- SECTION 4: Danger Zone --- */}
      <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-red-100 bg-red-50/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 text-red-600 rounded-xl">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2 className="text-theme-h6 font-bold text-red-800">Danger Zone</h2>
              <p className="text-theme-body-sm text-red-600/80">
                Account deactivation and deletion settings.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100">
          <div>
            <h3 className="font-semibold text-gray-800">Deactivate Account</h3>
            <p className="text-theme-body-sm text-gray-500 mt-0.5 max-w-md">
              Temporarily hide your profile and data. You can recover your
              account by logging in again.
            </p>
          </div>
          <button
            onClick={handleDeactivateClick}
            className="border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-theme-body-sm px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
          >
            Deactivate Account
          </button>
        </div>

        <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-semibold text-gray-800">Delete Account</h3>
            <p className="text-theme-body-sm text-gray-500 mt-0.5 max-w-md">
              Permanently delete your account and all associated data. This
              cannot be undone.
            </p>
          </div>
          <button
            onClick={handleDeleteClick}
            className="bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-theme-body-sm px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <Trash2 size={16} /> Delete Account
          </button>
        </div>
      </div>
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmModalConfig.onConfirm}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        actionType={confirmModalConfig.actionType}
        confirmText={confirmModalConfig.confirmText}
        isLoading={isProcessing}
      />
      {/* Phase 2: OTP Entry Modal */}
      <OtpVerificationModal
        isOpen={isOtpModalOpen}
        onClose={() => !isProcessing && setIsOtpModalOpen(false)}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
        emailMasked={user?.email || ""}
        isLoading={isProcessing}
        actionType={otpActionTarget}
      />
    </div>
  );
}
