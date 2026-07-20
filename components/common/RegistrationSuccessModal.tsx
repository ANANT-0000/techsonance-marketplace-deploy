import { CheckCircle2, Mail, Clock, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { REGISTRATION_SUCCESS_MODAL_TEXT } from "@/constants/commonText";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { logOut } from "@/lib/features/auth/authSlice";
import { VEDNOR_LOGIN_PATH, VEDNOR_REGISTER_PATH } from "@/constants";

interface RegistrationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegistrationSuccessModal = ({
  isOpen,
  onClose,
}: RegistrationSuccessModalProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="h-1.5 bg-gradient-to-r from-blue-500 to-emerald-400 w-full" />
        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-5 ring-4 ring-emerald-100">
            <CheckCircle2 className="w-11 h-11 text-emerald-500" />
          </div>
          <h2 className="text-theme-h4 font-bold text-gray-900 mb-2">
            {REGISTRATION_SUCCESS_MODAL_TEXT.TITLE}
          </h2>
          <p className="text-gray-500 text-theme-body-sm mb-7 text-balance">
            {REGISTRATION_SUCCESS_MODAL_TEXT.DESCRIPTION}
          </p>
          <div className="w-full space-y-3 mb-6">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-left">
              <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-theme-xxs font-semibold text-gray-400 uppercase tracking-wider">
                  {REGISTRATION_SUCCESS_MODAL_TEXT.ESTIMATED_REVIEW}
                </p>
                <p className="text-theme-body-sm font-semibold text-gray-700">
                  {REGISTRATION_SUCCESS_MODAL_TEXT.DAYS}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-left">
              <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                <Mail className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-theme-xxs font-semibold text-gray-400 uppercase tracking-wider">
                  {REGISTRATION_SUCCESS_MODAL_TEXT.CREDENTIALS_DELIVERY}
                </p>
                <p className="text-theme-body-sm font-semibold text-gray-700">
                  {REGISTRATION_SUCCESS_MODAL_TEXT.SENT_TO_EMAIL}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              if (isAuthenticated) {
                dispatch(logOut());
              }
              onClose();
              router.push(VEDNOR_LOGIN_PATH);
            }}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-2xl transition-colors text-theme-body-sm"
          >
            {REGISTRATION_SUCCESS_MODAL_TEXT.GO_TO_LOGIN}{" "}
            <ArrowRight size={16} />
          </button>
          <p className="text-theme-caption text-gray-400 mt-4">
            {REGISTRATION_SUCCESS_MODAL_TEXT.NEED_HELP}{" "}
            <a
              href={`mailto:${REGISTRATION_SUCCESS_MODAL_TEXT.SUPPORT_EMAIL}`}
              className="underline"
            >
              {REGISTRATION_SUCCESS_MODAL_TEXT.SUPPORT_EMAIL}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
