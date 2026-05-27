
import { BASE_API_URL } from "@/constants/constants";
import { authToken } from "@/utils/authToken";
import { useEffect, useState } from "react";
import { en } from "zod/v4/locales";

enum SubscriptionStatusEnum {
    TRIAL = 'trial',
    ACTIVE = 'active',
    EXPIRED = 'expired',
    CANCELLED = 'cancelled',
    GRACE_PERIOD = 'grace_period'
}
export interface SubscriptionStatus {
  id: string;
  company_id: string;
  status: SubscriptionStatusEnum;
  plan_name: string;
  plan_display_name: string;
  capabilities: Record<string, unknown>;
  days_remaining: number | null;
  trial_ends_at: Date | null;
  is_trial: boolean;
  is_expired: boolean;
  is_active: boolean;
  in_grace_period: boolean;
  show_banner: boolean; // true when trial has ≤ 10 days left
  banner_urgency: 'info' | 'warning' | 'danger';
}
export function TrialBanner({ vendorId }: { vendorId: string }) {
  const [sub, setSub] = useState< SubscriptionStatus|null>(null);

  useEffect(() => {
    const token = authToken();
    if (!token) return;
    fetch(`${BASE_API_URL}/v1/subscription/status`, {
      headers: { Authorization: `Bearer ${token}`, 'company-domain': window.location.hostname },
    })
    .then(r => r.json())
    .then(r => setSub(r.data));
  }, []);

  if (!sub?.show_banner) return null; // renders nothing when not needed

  const urgency =sub.days_remaining && (sub.days_remaining <= 3 ? 'red' : sub.days_remaining <= 7 ? 'amber' : 'blue');

  return (
    <div className={`w-full text-sm font-medium text-center py-2 px-4
      ${urgency === 'red' ? 'bg-red-50 text-red-700 border-b border-red-200' :
        urgency === 'amber' ? 'bg-amber-50 text-amber-700 border-b border-amber-200' :
        'bg-blue-50 text-blue-700 border-b border-blue-200'}`}>
      {sub.days_remaining === 0
        ? `Your trial has expired. `
        : `Trial ends in ${sub.days_remaining} day${sub.days_remaining !== 1 ? 's' : ''}. `}
      <a href={`/vendor/${vendorId}/settings/billing`} className="underline font-semibold">
        Upgrade now →
      </a>
    </div>
  );
}