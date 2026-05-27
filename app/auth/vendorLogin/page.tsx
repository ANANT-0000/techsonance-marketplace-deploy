'use client';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { loginSchema } from "@/utils/validation";
import { vendorLogin } from "@/utils/authApiClient";
import { RootState } from "@/lib/store";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Eye, EyeOff, ArrowRight, AlertCircle, Check, X, Clock, Store, TrendingUp, Users } from "lucide-react";
import { loginEnd, loginFailure, loginStart, loginSuccess } from "@/lib/features/auth/authSlice";

interface LoginFormData { email: string; password: string }
type UiState = 'idle' | 'loading' | 'success' | 'error';

const STEPS = [
  'Verifying business credentials',
  'Checking store permissions',
  'Loading your dashboard',
];

const StoreIllustration = () => (
  <svg width="100%" viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="10" y="30" width="280" height="155" rx="12" fill="rgba(255,255,255,0.08)" />
    <rect x="10" y="30" width="280" height="32" rx="12" fill="rgba(255,255,255,0.12)" />
    <rect x="10" y="50" width="280" height="12" fill="rgba(255,255,255,0.12)" />
    <circle cx="26" cy="46" r="6" fill="#f87171" />
    <circle cx="44" cy="46" r="6" fill="#fbbf24" />
    <circle cx="62" cy="46" r="6" fill="#34d399" />
    <rect x="24" y="72" width="60" height="8" rx="4" fill="rgba(255,255,255,0.2)" />
    <rect x="24" y="86" width="44" height="6" rx="3" fill="rgba(255,255,255,0.12)" />
    <rect x="24" y="100" width="52" height="6" rx="3" fill="rgba(255,255,255,0.12)" />
    <rect x="24" y="114" width="40" height="6" rx="3" fill="rgba(255,255,255,0.12)" />
    <rect x="104" y="68" width="172" height="84" rx="8" fill="rgba(255,255,255,0.06)" />
    <rect x="116" y="80" width="60" height="8" rx="4" fill="rgba(255,255,255,0.18)" />
    <rect x="116" y="96" width="148" height="5" rx="2.5" fill="rgba(255,255,255,0.1)" />
    <rect x="116" y="107" width="120" height="5" rx="2.5" fill="rgba(255,255,255,0.1)" />
    <rect x="116" y="118" width="135" height="5" rx="2.5" fill="rgba(255,255,255,0.1)" />
    <rect x="116" y="135" width="52" height="10" rx="5" fill="#6ee7b7" />
    <rect x="24" y="148" width="252" height="1" fill="rgba(255,255,255,0.08)" />
    <rect x="24" y="158" width="40" height="6" rx="3" fill="rgba(255,255,255,0.12)" />
    <rect x="72" y="158" width="40" height="6" rx="3" fill="rgba(255,255,255,0.12)" />
    <rect x="120" y="158" width="40" height="6" rx="3" fill="rgba(255,255,255,0.12)" />
    <rect x="234" y="155" width="52" height="12" rx="6" fill="rgba(255,255,255,0.15)" />
  </svg>
);

type StepStatus = 'pending' | 'active' | 'done' | 'failed';

const StepIcon = ({ status }: { status: StepStatus }) => {
  if (status === 'active') return <span className="block w-3.5 h-3.5 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />;
  if (status === 'done')   return <Check size={13} className="text-green-600" />;
  if (status === 'failed') return <X size={13} className="text-red-500" />;
  return <Clock size={13} className="text-gray-300" />;
};

const stepStyle: Record<StepStatus, string> = {
  pending: 'bg-gray-50 border-gray-100 text-gray-400',
  active:  'bg-blue-50 border-blue-100 text-blue-700',
  done:    'bg-green-50 border-green-100 text-green-700',
  failed:  'bg-red-50  border-red-100  text-red-600',
};

export default function VendorLoginPage() {
  const router = useRouter();
  const { error } = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();

  const [uiState, setUiState]       = useState<UiState>('idle');
  const [steps, setSteps]           = useState<StepStatus[]>(['pending','pending','pending']);
  const [showPass, setShowPass]     = useState(false);
  const [redirectPct, setRedirectPct] = useState(100);
  const [countdown, setCountdown]   = useState(3);

  const { reset, register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<LoginFormData>({ resolver: zodResolver(loginSchema), defaultValues: { email:'', password:'' } });

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('auth') : null;
    const auth = stored ? JSON.parse(stored) : null;
    if (auth?.isAuthenticated && auth?.user?.user_role === 'vendor')
      router.replace(`/vendor/${auth.user.vendor_id}`);
  }, []);

  const setStep = (i: number, s: StepStatus) =>
    setSteps(prev => prev.map((v, idx) => idx === i ? s : v));

  const startRedirect = (vendorId: string | undefined) => {
    if (!vendorId) return;
    let elapsed = 0;
    const total = 3000, tick = 50;
    const t = setInterval(() => {
      elapsed += tick;
      setRedirectPct(Math.max(0, 100 - (elapsed / total) * 100));
      setCountdown(Math.ceil((total - elapsed) / 1000));
      if (elapsed >= total) { clearInterval(t); router.push(`/vendor/${vendorId}`); }
    }, tick);
  };

  const onSubmit = async (data: LoginFormData) => {
    dispatch(loginStart());
    setUiState('loading');
    setSteps(['active','pending','pending']);

    const result = await vendorLogin(data, dispatch);

    if (result?.status === 200 && result?.user) {
      setStep(0,'done'); setStep(1,'active');
      await new Promise(r => setTimeout(r, 650));
      setStep(1,'done'); setStep(2,'active');
      await new Promise(r => setTimeout(r, 650));
      setStep(2,'done');
      await new Promise(r => setTimeout(r, 350));
      reset();
      dispatch(loginSuccess(result.user));
      dispatch(loginEnd());
      setUiState('success');
      startRedirect(result.user?.user?.vendor_id ?? '');
    } else {
      setStep(0,'failed');
      dispatch(loginFailure(result?.message || 'Login failed'));
      setUiState('error');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 font-sans">
      <div className="w-full grid grid-cols-2 bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200" style={{minHeight: '620px'}}>

        {/* ── LEFT PANEL — illustration ── */}
        <div className="bg-[#1a56db] p-10 flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-3 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-300 block" />
              <span className="text-xs text-white font-medium tracking-wide">Vendor Portal</span>
            </div>
            <h2 className="text-3xl font-bold text-white leading-snug mb-3">
              Grow your business<br />with us
            </h2>
            <p className="text-sm text-white/65 leading-relaxed max-w-[260px]">
              Manage products, track orders, and reach thousands of customers — all in one place.
            </p>

            {/* stat pills */}
            <div className="flex gap-3 mt-7">
              {[
                { icon: <Users size={14}/>, num: '12k+', label: 'Active vendors' },
                { icon: <TrendingUp size={14}/>, num: '98%', label: 'Uptime SLA' },
              ].map(s => (
                <div key={s.label} className="bg-white/10 rounded-xl p-3.5 flex-1">
                  <div className="text-white/50 mb-1">{s.icon}</div>
                  <div className="text-xl font-bold text-white">{s.num}</div>
                  <div className="text-[11px] text-white/55 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* dashboard illustration */}
            <div className="mt-8">
              <StoreIllustration />
            </div>
          </div>

          <div className="text-[11px] text-white/35 mt-6">
            © 2025 Techsonance Marketplace. All rights reserved.
          </div>
        </div>

        {/* ── RIGHT PANEL — form / states ── */}
        <div className="flex flex-col justify-center px-12 py-10">

          {/* IDLE */}
          {uiState === 'idle' && (
            <div>
              <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 mb-5">Vendor login</p>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
              <p className="text-sm text-gray-500 mb-7">Enter your details to access your store dashboard.</p>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 tracking-wide">Business email address</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"><Store size={15}/></span>
                    <input
                      type="text"
                      placeholder="you@business.com"
                      autoComplete="username"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition placeholder:text-gray-300"
                      {...register('email')}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-gray-600 tracking-wide">Password</label>
                    <a href="#" className="text-xs text-blue-600 hover:underline">Forgot password?</a>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"><Eye size={15} style={{display:'none'}}/></span>
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                      {/* lock icon via unicode to keep it simple */}
                      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                    </span>
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••••"
                      autoComplete="current-password"
                      className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition placeholder:text-gray-300"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(p => !p)}
                      aria-label={showPass ? 'Hide password' : 'Show password'}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    >
                      {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                  </div>
                  {errors.password
                    ? <p className="text-red-500 text-xs mt-1 max-w-xs">{errors.password.message}</p>
                    : <p className="text-gray-400 text-xs mt-1">Must be at least 8 characters.</p>}
                </div>

                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
                    <AlertCircle size={15} className="flex-shrink-0"/> {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-1 bg-[#1a56db] hover:bg-[#1648c0] active:scale-[.98] disabled:opacity-60 text-white font-semibold text-sm rounded-xl py-3.5 transition flex items-center justify-center gap-2"
                >
                  {isSubmitting
                    ? <><span className="block w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin"/>Logging in…</>
                    : <><ArrowRight size={16}/>Log in to Dashboard</>}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-5">
                Don't have a business account?{' '}
                <Link href="/auth/vendorRegister" className="text-blue-600 font-semibold hover:underline">Create one</Link>
              </p>
            </div>
          )}

          {/* LOADING */}
          {uiState === 'loading' && (
            <div className="flex flex-col items-center text-center">
              <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 mb-1">Signing you in</p>
              <p className="text-xs text-gray-400 mb-6">This will only take a moment</p>
              <div className="w-full flex flex-col gap-2.5">
                {STEPS.map((label, i) => (
                  <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${stepStyle[steps[i]]}`}>
                    <div className="w-6 h-6 rounded-full bg-white border border-gray-100 flex items-center justify-center flex-shrink-0">
                      <StepIcon status={steps[i]}/>
                    </div>
                    {label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUCCESS */}
          {uiState === 'success' && (
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-5">
                <Check size={28} className="text-green-600"/>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">You're in!</h2>
              <p className="text-sm text-gray-500 mb-6">Store verified. Taking you to your dashboard…</p>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden mb-2">
                <div className="h-1.5 bg-[#1a56db] rounded-full transition-all duration-75" style={{width:`${redirectPct}%`}}/>
              </div>
              <p className="text-xs text-gray-400">Redirecting in {Math.max(0, countdown)}s</p>
            </div>
          )}

          {/* ERROR */}
          {uiState === 'error' && (
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-5">
                <X size={28} className="text-red-500"/>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Login failed</h2>
              <p className="text-sm text-gray-500 mb-6">{error || 'Invalid credentials. Please try again.'}</p>
              <button
                onClick={() => { setUiState('idle'); setSteps(['pending','pending','pending']); }}
                className="bg-[#1a56db] hover:bg-[#1648c0] text-white font-semibold text-sm rounded-xl px-8 py-3 transition"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}