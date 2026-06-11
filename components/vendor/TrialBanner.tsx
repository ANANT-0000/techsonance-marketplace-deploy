'use client';
import { useEffect, useState } from 'react';
import { Clock, AlertTriangle, Lock, X } from 'lucide-react';
import { BASE_API_URL } from '@/constants';
import { authToken } from '@/utils/authToken';
import { getCompanyDomain } from '@/lib/get-domain';
import { TRIAL_BANNER_TEXT, BannerUrgency } from '@/constants/vendorText';

interface SubscriptionStatus {
  show_banner: boolean;
  days_remaining: number | null;
  banner_urgency: BannerUrgency;
  in_grace_period: boolean;
  is_expired: boolean;
}

const CONFIG = {
  info: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', Icon: Clock },
  warning: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', Icon: AlertTriangle },
  danger: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200', Icon: Lock },
};

function getBannerMessage(status: SubscriptionStatus): string {
  if (status.in_grace_period) {
    return TRIAL_BANNER_TEXT.GRACE_PERIOD;
  }
  const d = status.days_remaining ?? 0;
  if (d <= 0) return TRIAL_BANNER_TEXT.ENDED;
  return TRIAL_BANNER_TEXT.ENDS_IN(d);
}

interface Props {
  vendorId: string;
}

export function TrialBanner({ vendorId }: Props) {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const getStatus = async () => {
    const token = authToken();
    if (!token) return;

    const domain = await getCompanyDomain();
    try {
      const res = await fetch(`${BASE_API_URL}/v1/subscription/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'company-domain': domain,
        },
      });
      const json = await res.json();
      setStatus(json.data ?? null);
    } catch {
      // silently skip — banner is non-critical
    }

  }
  useEffect(() => {
    getStatus();
  }, []);


  if (!status?.show_banner || dismissed) return null;

  const { bg, text, border, Icon } = CONFIG[status.banner_urgency];

  return (
    <div className={`flex items-center justify-between gap-3 px-4 py-2.5 text-sm border-b ${bg} ${text} ${border}`}>
      <div className="flex items-center gap-2">
        <Icon size={14} className="shrink-0" />
        <span>
          {getBannerMessage(status)}{' '}
          <a
            href={`/vendor/${vendorId}/settings/billing`}
            className="font-semibold underline underline-offset-2">
            {status.in_grace_period ? TRIAL_BANNER_TEXT.UPGRADE_RESTORE : TRIAL_BANNER_TEXT.UPGRADE_NOW} →
          </a>
        </span>
      </div>

      {/* Only allow dismissal on info urgency — warning/danger stay visible */}
      {status.banner_urgency === BannerUrgency.INFO && (
        <button
          onClick={() => setDismissed(true)}
          className="p-0.5 rounded opacity-60 hover:opacity-100 transition-opacity"
          aria-label={TRIAL_BANNER_TEXT.DISMISS}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}