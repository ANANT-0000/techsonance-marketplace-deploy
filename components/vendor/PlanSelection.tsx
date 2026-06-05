'use client';
import { useEffect, useState } from 'react';
import { Check, Minus, Rocket, Zap, Building } from 'lucide-react';
import { BASE_API_URL } from '@/constants';
import { PLAN_FEATURES } from '@/constants/dynamicFields';

interface Plan {
  id: string;
  plan_name: string;
  display_name: string;
  price_monthly: string;
  trial_days: number;
  capabilities: Record<string, unknown>;
}

interface Props {
  selectedPlanId: string;
  onChange: (planId: string) => void;
}

const PLAN_META: Record<string, {
  badge: string;
  badgeVariant: 'info' | 'success' | 'warning';
  icon: React.ReactNode;
  featured: boolean;
  ctaLabel: string;
}> = {
  starter: { badge: 'Free to start', badgeVariant: 'success', icon: <Zap size={14} />, featured: false, ctaLabel: 'Start free trial' },
  pro: { badge: 'Most popular', badgeVariant: 'info', icon: <Rocket size={14} />, featured: true, ctaLabel: 'Start free trial' },
  enterprise: { badge: 'Contact sales', badgeVariant: 'warning', icon: <Building size={14} />, featured: false, ctaLabel: 'Contact sales' },
};

const BADGE_STYLES: Record<string, string> = {
  info: 'bg-blue-50 text-blue-800',
  success: 'bg-green-50 text-green-800',
  warning: 'bg-amber-50 text-amber-800',
};

export default function PlanSelectionStep({ selectedPlanId, onChange }: Props) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const getPlans = async () => {

    await fetch(`${BASE_API_URL}/v1/subscription/plans`)
      .then(r => r.json())
      .then(r => setPlans(r.data ?? []))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }
  useEffect(() => {
    getPlans();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-72 bg-gray-100 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        All plans start with a {plans[0]?.trial_days ?? 14}-day free trial.
        No credit card required.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {plans.map(plan => {
          const meta = PLAN_META[plan.plan_name] ?? PLAN_META.starter;
          const features = PLAN_FEATURES[plan.plan_name] ?? [];
          const selected = selectedPlanId === plan.id;

          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => onChange(plan.id)}
              className={[
                'text-left rounded-xl p-5 border transition-all',
                selected || meta.featured
                  ? 'border-2 border-blue-500'
                  : 'border border-gray-200 hover:border-gray-300',
                selected ? 'ring-2 ring-blue-100' : '',
              ].join(' ')}
            >
              <span className={`text-xs font-semibold px-2 py-1 rounded-md ${BADGE_STYLES[meta.badgeVariant]}`}>
                {meta.badge}
              </span>

              <div className="flex items-center gap-2 mt-3 mb-1">
                {meta.icon}
                <span className="font-semibold text-gray-900">{plan.display_name}</span>
              </div>

              <p className="text-2xl font-semibold text-gray-900 mt-2">
                {Number(plan.price_monthly) === 0
                  ? 'Free'
                  : `₹${Number(plan.price_monthly).toLocaleString()}`}
                {Number(plan.price_monthly) > 0 && (
                  <span className="text-sm font-normal text-gray-400"> / mo after trial</span>
                )}
              </p>

              <div className="border-t border-gray-100 mt-3 pt-3 space-y-1.5">
                {features.map(f => (
                  <div key={f.label} className={`flex items-center gap-2 text-sm ${f.included ? 'text-gray-700' : 'text-gray-400'}`}>
                    {f.included
                      ? <Check size={13} className="text-green-600 shrink-0" />
                      : <Minus size={13} className="shrink-0" />}
                    {f.label}
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 text-center">
        You won't be charged during your {plans[0]?.trial_days ?? 14}-day trial. Cancel anytime.
      </p>
    </div>
  );
}