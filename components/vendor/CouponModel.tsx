import AxiosAPI from '@/lib/axios';
import { authToken } from '@/utils/authToken';
import { Coupon, PromotionType, PromotionRuleType } from '@/utils/Types';
import { couponSchema } from '@/utils/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, X, Plus, Trash2, Tag, ChevronDown } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';
import { COUPON_MODEL_TEXT } from '@/constants/vendorText';

// ─── API Methods ─────────────────────────────────────────────────────────────

const createNewCoupon = async (data: any, userId: string, token: string) =>
  AxiosAPI.post(`/v1/coupon/${userId}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

const updateExistingCoupon = async (
  id: string,
  data: any,
  userId: string,
  token: string
) =>
  AxiosAPI.patch(`/v1/coupon/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

const fetchCouponDetails = async (id: string, token: string) =>
  AxiosAPI.get(`/v1/coupon/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

const fetchAllProductOptions = async (token: string) =>
  AxiosAPI.get(`/v1/products/options`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// ─── Types ────────────────────────────────────────────────────────────────────

interface RuleRow {
  rule_type: PromotionRuleType;
  amount?: number;
  qty?: number;
  segment_id?: string;
  product_id?: string;
  registered_within_days?: number;
  days_of_week?: number[];
  max?: number;
  negate: boolean;
}

interface CouponModelProps {
  isModalOpen: boolean;
  setIsModalOpen: (val: boolean) => void;
  id?: string | null;
  onSuccess?: () => void;
  userId?: string;
  setCoupons: React.Dispatch<React.SetStateAction<Coupon[]>>;
}

// ─── Rule config builder ──────────────────────────────────────────────────────

function buildRuleConfig(row: RuleRow): Record<string, unknown> {
  switch (row.rule_type) {
    case PromotionRuleType.MIN_CART_VALUE:
      return { amount: Number(row.amount ?? 0) };
    case PromotionRuleType.MIN_QTY:
      return { qty: Number(row.qty ?? 1) };
    case PromotionRuleType.CUSTOMER_SEGMENT:
      return { segment_id: row.segment_id ?? '' };
    case PromotionRuleType.FIRST_ORDER_ONLY:
      return {};
    case PromotionRuleType.PRODUCT_IN_CART:
      return { product_id: row.product_id ?? '' };
    case PromotionRuleType.NEW_CUSTOMER:
      return { registered_within_days: Number(row.registered_within_days ?? 30) };
    case PromotionRuleType.DATE_RANGE:
      return { days_of_week: (row.days_of_week ?? []).map(Number) };
    case PromotionRuleType.MAX_USES_PER_USER:
      return { max: Number(row.max ?? 1) };
    default:
      return {};
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const RULE_TYPE_LABELS: Record<PromotionRuleType, string> = {
  [PromotionRuleType.MIN_CART_VALUE]: COUPON_MODEL_TEXT.RULE_LABELS.MIN_CART,
  [PromotionRuleType.MIN_QTY]: COUPON_MODEL_TEXT.RULE_LABELS.MIN_QTY,
  [PromotionRuleType.CUSTOMER_SEGMENT]: COUPON_MODEL_TEXT.RULE_LABELS.SEGMENT,
  [PromotionRuleType.FIRST_ORDER_ONLY]: COUPON_MODEL_TEXT.RULE_LABELS.FIRST_ORDER,
  [PromotionRuleType.PRODUCT_IN_CART]: COUPON_MODEL_TEXT.RULE_LABELS.PRODUCT,
  [PromotionRuleType.NEW_CUSTOMER]: COUPON_MODEL_TEXT.RULE_LABELS.NEW_CUST,
  [PromotionRuleType.DATE_RANGE]: COUPON_MODEL_TEXT.RULE_LABELS.DATE_RANGE,
  [PromotionRuleType.MAX_USES_PER_USER]: COUPON_MODEL_TEXT.RULE_LABELS.MAX_USES,
};

function hydrateRule(raw: {
  rule_type: PromotionRuleType;
  rule_config: any;
  negate: boolean;
}): RuleRow {
  const cfg = raw.rule_config ?? {};
  return {
    rule_type: raw.rule_type,
    negate: raw.negate ?? false,
    amount: cfg.amount,
    qty: cfg.qty,
    segment_id: cfg.segment_id,
    product_id: cfg.product_id,
    registered_within_days: cfg.registered_within_days,
    days_of_week: cfg.days_of_week ?? [],
    max: cfg.max,
  };
}

// ─── Shared field styles ──────────────────────────────────────────────────────

const fieldBase =
  'w-full border border-gray-200 rounded-xl p-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all placeholder:text-gray-400';
const fieldError = 'border-red-400 focus:ring-red-100 focus:border-red-400';
const labelBase = 'block text-xs font-semibold text-gray-600 mb-1.5';
const sectionTitle = 'text-sm font-bold text-gray-800';

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  children,
  accent,
}: {
  title: string;
  children: React.ReactNode;
  accent?: 'indigo' | 'default';
}) {
  return (
    <div
      className={`rounded-2xl border p-5 space-y-4 ${
        accent === 'indigo'
          ? 'bg-indigo-50/50 border-indigo-100'
          : 'bg-gray-50 border-gray-100'
      }`}
    >
      <p className={sectionTitle}>{title}</p>
      {children}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export const CouponModel = ({
  setIsModalOpen,
  isModalOpen,
  id,
  onSuccess,
  userId,
  setCoupons,
}: CouponModelProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const token = authToken();
  const isEditMode = !!id;
  const [productOptions, setProductOptions] = useState<
    { id: string; name: string }[]
  >([]);
  const [rules, setRules] = useState<RuleRow[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      discount_type: PromotionType.PERCENTAGE,
      code: '',
      description: '',
      value: 0,
      valid_from: new Date().toISOString().split('T')[0],
      valid_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      min_order_amount: '',
      max_discount_amount: '',
      max_uses: null,
      max_uses_per_user: 1,
      is_auto_applied: false,
      is_active: true,
      applicable_product_ids: [] as string[],
    },
  });

  // ── Load data on open ──
  useEffect(() => {
    const loadProductOptions = async () => {
      try {
        const res = await fetchAllProductOptions(token as string);
        setProductOptions(res.data.data ?? []);
      } catch {
        toast.error(COUPON_MODEL_TEXT.TOASTS.ERR_LOAD_PRODUCTS);
      }
    };

    if (!isModalOpen) return;
    loadProductOptions();

    if (id) {
      (async () => {
        try {
          const res = await fetchCouponDetails(id, token as string);
          const c = res.data.data;
          const minCartRule = c.rules?.find(
  (r: any) => r.rule_type === PromotionRuleType.MIN_CART_VALUE
);
          reset({
            discount_type: c.discount_type || PromotionType.PERCENTAGE,
            code: c.code || '',
            description: c.description || '',
            value: Number(c.discount_value || 0),
            valid_from: c.valid_from
              ? new Date(c.valid_from).toISOString().split('T')[0]
              : '',
            valid_to: c.valid_to
              ? new Date(c.valid_to).toISOString().split('T')[0]
              : '',
            min_order_amount: minCartRule
    ? String(minCartRule.rule_config?.amount ?? '')
    : '',
            max_discount_amount: c.max_discount_amount
              ? String(c.max_discount_amount)
              : '',
            max_uses: c.max_uses ? Number(c.max_uses) : null,
            max_uses_per_user: c.max_uses_per_user
              ? Number(c.max_uses_per_user)
              : null,
            is_auto_applied: c.is_auto_applied ?? false,
            is_active: c.is_active ?? true,
            applicable_product_ids: [],
          });
          if (Array.isArray(c.rules)) {
            setRules(c.rules.map(hydrateRule));
          }
        } catch {
          toast.error(COUPON_MODEL_TEXT.TOASTS.ERR_LOAD_COUPON);
        }
      })();
    } else {
      reset({
        discount_type: PromotionType.PERCENTAGE,
        code: '',
        description: '',
        value: 0,
        valid_from: new Date().toISOString().split('T')[0],
        valid_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        min_order_amount: '',
        max_discount_amount: '',
        max_uses: null,
        max_uses_per_user: 1,
        is_auto_applied: false,
        is_active: true,
        applicable_product_ids: [],
      });
      setRules([]);
    }
  }, [id, isModalOpen]);

  // ── Close on outside click ──
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target as Node)
      ) {
        setIsModalOpen(false);
        reset();
        setRules([]);
      }
    };
    if (isModalOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isModalOpen]);

  // ── Rule helpers ──
  const addRule = () =>
    setRules((prev) => [
      ...prev,
      { rule_type: PromotionRuleType.MIN_CART_VALUE, negate: false, amount: 0 },
    ]);

  const removeRule = (idx: number) =>
    setRules((prev) => prev.filter((_, i) => i !== idx));

  const updateRule = (idx: number, patch: Partial<RuleRow>) =>
    setRules((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, ...patch } : r))
    );

  const toggleDay = (idx: number, day: number) => {
    const current = rules[idx].days_of_week ?? [];
    const updated = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day];
    updateRule(idx, { days_of_week: updated });
  };

  // ── Submit ──
  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const rulesFromState = rules.map((row) => ({
        rule_type: row.rule_type,
        rule_config: buildRuleConfig(row),
        negate: row.negate,
      }));

      const minOrderAmount = Number(data.min_order_amount);
      const rulesPayload =
        minOrderAmount > 0  
          ? [
              {
                rule_type: PromotionRuleType.MIN_CART_VALUE,
                rule_config: { amount: minOrderAmount },
                negate: false,
              },
              ...rulesFromState,
            ]
          : rulesFromState;

      const payload = {
        code: data.code.toUpperCase(),
        description: data.description || '',
        discount_type:data.discount_type as PromotionType ,
        discount_value: String(data.value),
        max_discount_amount: data.max_discount_amount
          ? String(data.max_discount_amount)
          : undefined,
        max_uses: data.max_uses ? Number(data.max_uses) : undefined,
        max_uses_per_user: data.max_uses_per_user
          ? Number(data.max_uses_per_user)
          : 1,
        is_auto_applied: !!data.is_auto_applied,
        is_active: !!data.is_active,
        valid_from: new Date(data.valid_from).toISOString(),
        valid_to: new Date(data.valid_to).toISOString(),
        applicable_product_ids: data.applicable_product_ids || [],
        rules: rulesPayload,
      };

      if (isEditMode) {
        const response = await updateExistingCoupon(
          id as string,
          payload,
          userId as string,
          token as string
        );
        if (response.status === 200) {
          setCoupons((prev) =>
            prev.map((c) => (c.id === id ? response.data.data : c))
          );
        }
        toast.success(COUPON_MODEL_TEXT.TOASTS.SUCCESS_UPDATE);
      } else {
        const response = await createNewCoupon(
          payload,
          userId as string,
          token as string
        );
        toast.success(COUPON_MODEL_TEXT.TOASTS.SUCCESS_CREATE);
        setIsModalOpen(false);
setRules([]);
if (onSuccess) onSuccess();
reset();
      }
      setIsModalOpen(false);
      setRules([]);
      if (onSuccess) onSuccess();
      reset();
    } catch (error) {
      toast.error(isEditMode ? COUPON_MODEL_TEXT.TOASTS.ERR_UPDATE : COUPON_MODEL_TEXT.TOASTS.ERR_CREATE);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isModalOpen) return null;

  const discountType = watch('discount_type');
  const applicableProductIds = watch('applicable_product_ids') ?? [];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* ── Modal header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
              <Tag size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800">
                {isEditMode ? COUPON_MODEL_TEXT.HEADER.EDIT : COUPON_MODEL_TEXT.HEADER.NEW}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {isEditMode
                  ? COUPON_MODEL_TEXT.HEADER.EDIT_DESC
                  : COUPON_MODEL_TEXT.HEADER.NEW_DESC}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsModalOpen(false);
              setRules([]);
              reset();
            }}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 space-y-5 max-h-[80vh] overflow-y-auto"
        >
          {/* ── Basic info ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelBase}>
                {COUPON_MODEL_TEXT.BASIC_INFO.CODE} <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                disabled={isEditMode}
                {...register('code', {
                  onChange: (e) =>
                    (e.target.value = e.target.value.toUpperCase()),
                })}
                className={`${fieldBase} uppercase font-mono tracking-widest ${
                  errors.code ? fieldError : ''
                } ${isEditMode ? 'bg-gray-50 cursor-not-allowed text-gray-500' : ''}`}
                placeholder={COUPON_MODEL_TEXT.BASIC_INFO.CODE_PH}
              />
              {errors.code && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.code.message?.toString()}
                </p>
              )}
            </div>

            <div>
              <label className={labelBase}>
                {COUPON_MODEL_TEXT.BASIC_INFO.DESC} <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                {...register('description')}
                className={`${fieldBase} ${errors.description ? fieldError : ''}`}
                placeholder={COUPON_MODEL_TEXT.BASIC_INFO.DESC_PH}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.description.message?.toString()}
                </p>
              )}
            </div>
          </div>

          {/* ── Discount type & value ── */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelBase}>
                {COUPON_MODEL_TEXT.BASIC_INFO.TYPE} <span className="text-red-400">*</span>
              </label>
              <select
                {...register('discount_type')}
                className={fieldBase}
              >
                <option value={PromotionType.PERCENTAGE}>{COUPON_MODEL_TEXT.DISCOUNT_TYPES.PERCENTAGE}</option>
                <option value={PromotionType.FIXED_AMOUNT}>{COUPON_MODEL_TEXT.DISCOUNT_TYPES.FIXED}</option>
                <option value={PromotionType.TIERED_DISCOUNT}>{COUPON_MODEL_TEXT.DISCOUNT_TYPES.TIERED}</option>
                <option value={PromotionType.FREE_SHIPPING}>{COUPON_MODEL_TEXT.DISCOUNT_TYPES.SHIPPING}</option>
                <option value={PromotionType.BOGO}>{COUPON_MODEL_TEXT.DISCOUNT_TYPES.BOGO}</option>
              </select>
            </div>

            <div>
              <label className={labelBase}>
                {COUPON_MODEL_TEXT.BASIC_INFO.VALUE} <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                {...register('value', { valueAsNumber: true })}
                className={`${fieldBase} ${errors.value ? fieldError : ''}`}
                placeholder="0.00"
              />
              {errors.value && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.value.message?.toString()}
                </p>
              )}
            </div>
          </div>

          {/* ── Validity dates ── */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelBase}>
                {COUPON_MODEL_TEXT.BASIC_INFO.VALID_FROM} <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                {...register('valid_from')}
                className={`${fieldBase} ${errors.valid_from ? fieldError : ''}`}
              />
              {errors.valid_from && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.valid_from.message?.toString()}
                </p>
              )}
            </div>
            <div>
              <label className={labelBase}>
                {COUPON_MODEL_TEXT.BASIC_INFO.VALID_TO} <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                {...register('valid_to')}
                className={`${fieldBase} ${errors.valid_to ? fieldError : ''}`}
              />
              {errors.valid_to && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.valid_to.message?.toString()}
                </p>
              )}
            </div>
          </div>

          {/* ── Advanced limits ── */}
          <Section title={COUPON_MODEL_TEXT.ADVANCED.TITLE}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelBase}>{COUPON_MODEL_TEXT.ADVANCED.MAX_AMT}</label>
                <input
                  type="number"
                  {...register('max_discount_amount')}
                  className={fieldBase}
                  placeholder={COUPON_MODEL_TEXT.ADVANCED.MAX_AMT_PH}
                />
              </div>
              <div>
                <label className={labelBase}>{COUPON_MODEL_TEXT.ADVANCED.TOTAL_USES}</label>
                <input
                  type="number"
                  {...register('max_uses', { valueAsNumber: true })}
                  className={fieldBase}
                  placeholder={COUPON_MODEL_TEXT.ADVANCED.TOTAL_USES_PH}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelBase}>{COUPON_MODEL_TEXT.ADVANCED.USES_PER_USER}</label>
                <input
                  type="number"
                  {...register('max_uses_per_user', { valueAsNumber: true })}
                  className={fieldBase}
                  placeholder={COUPON_MODEL_TEXT.ADVANCED.USES_PER_USER_PH}
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    {...register('is_auto_applied')}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 rounded-full bg-gray-200 peer-checked:bg-blue-500 transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {COUPON_MODEL_TEXT.ADVANCED.AUTO_APPLY}
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    {...register('is_active')}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 rounded-full bg-gray-200 peer-checked:bg-emerald-500 transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
                </div>
                <span className="text-sm font-medium text-gray-700">{COUPON_MODEL_TEXT.ADVANCED.ACTIVE}</span>
              </label>
            </div>

            {/* Applicable products */}
            <div>
              <label className={labelBase}>
                {COUPON_MODEL_TEXT.ADVANCED.PRODUCTS}
              </label>
              <select
                className={fieldBase}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  if (!selectedId) return;
                  const currentIds =
                    (watch('applicable_product_ids') as string[]) ?? [];
                  if (!currentIds.includes(selectedId)) {
                    setValue(
                      'applicable_product_ids',
                      [...currentIds, selectedId],
                      { shouldDirty: true }
                    );
                  }
                  e.target.value = '';
                }}
              >
                <option value="">{COUPON_MODEL_TEXT.ADVANCED.PRODUCTS_SELECT}</option>
                {productOptions.map((opt) => {
                  const MAX = 40;
                  const display =
                    opt.name.length > MAX
                      ? `${opt.name.substring(0, MAX)}…`
                      : opt.name;
                  return (
                    <option key={opt.id} value={opt.id} title={opt.name}>
                      {display}
                    </option>
                  );
                })}
              </select>

              <div className="flex flex-wrap gap-2 mt-2.5">
                {applicableProductIds.map((pid: string) => {
                  const product = productOptions.find((p) => p.id === pid);
                  if (!product) return null;
                  return (
                    <span
                      key={pid}
                      className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-indigo-100"
                    >
                      <span
                        className="truncate max-w-[140px]"
                        title={product.name}
                      >
                        {product.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const currentIds =
                            (watch('applicable_product_ids') as string[]) ?? [];
                          setValue(
                            'applicable_product_ids',
                            currentIds.filter((c) => c !== pid),
                            { shouldDirty: true }
                          );
                        }}
                        className="text-indigo-400 hover:text-red-500 transition-colors"
                      >
                        <X size={13} />
                      </button>
                    </span>
                  );
                })}
                {applicableProductIds.length === 0 && (
                  <p className="text-xs text-gray-400 italic">
                    {COUPON_MODEL_TEXT.ADVANCED.NO_PRODUCTS}
                  </p>
                )}
              </div>
            </div>
          </Section>

          {/* ── Promotion rules ── */}
          <Section title={COUPON_MODEL_TEXT.RULES.TITLE} accent="indigo">
            <div className="flex items-center justify-between -mt-1">
              <p className="text-xs text-gray-500">
                {COUPON_MODEL_TEXT.RULES.DESC}
              </p>
              <button
                type="button"
                onClick={addRule}
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-white border border-indigo-200 rounded-lg px-3 py-1.5 transition-colors hover:bg-indigo-50"
              >
                <Plus size={13} />
                {COUPON_MODEL_TEXT.RULES.ADD}
              </button>
            </div>

            {rules.length === 0 && (
              <p className="text-xs text-gray-400 italic text-center py-3">
                {COUPON_MODEL_TEXT.RULES.EMPTY}
              </p>
            )}

            <div className="space-y-3">
              {rules.map((rule, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-indigo-100 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    {/* Rule type */}
                    <div className="flex-1">
                      <label className={labelBase}>{COUPON_MODEL_TEXT.RULES.TYPE_LBL}</label>
                      <select
                        className={fieldBase}
                        value={rule.rule_type}
                        onChange={(e) =>
                          updateRule(idx, {
                            rule_type: e.target.value as PromotionRuleType,
                            amount: undefined,
                            qty: undefined,
                            segment_id: undefined,
                            product_id: undefined,
                            registered_within_days: undefined,
                            days_of_week: [],
                            max: undefined,
                          })
                        }
                      >
                        {Object.values(PromotionRuleType).map((t) => (
                          <option key={t} value={t}>
                            {RULE_TYPE_LABELS[t]}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Negate toggle */}
                    <div className="flex flex-col items-center gap-1 pt-4">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                        {COUPON_MODEL_TEXT.RULES.NEGATE}
                      </span>
                      <label className="relative cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rule.negate}
                          onChange={(e) =>
                            updateRule(idx, { negate: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4 rounded-full bg-gray-200 peer-checked:bg-indigo-500 transition-colors" />
                        <div className="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
                      </label>
                    </div>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => removeRule(idx)}
                      className="mt-4 p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Rule config fields */}
                  {rule.rule_type === PromotionRuleType.MIN_CART_VALUE && (
                    <div>
                      <label className={labelBase}>{COUPON_MODEL_TEXT.RULES.MIN_CART_AMT}</label>
                      <input
                        type="number"
                        value={rule.amount ?? ''}
                        onChange={(e) =>
                          updateRule(idx, { amount: Number(e.target.value) })
                        }
                        className={fieldBase}
                        placeholder={COUPON_MODEL_TEXT.RULES.MIN_CART_AMT_PH}
                      />
                    </div>
                  )}

                  {rule.rule_type === PromotionRuleType.MIN_QTY && (
                    <div>
                      <label className={labelBase}>{COUPON_MODEL_TEXT.RULES.MIN_QTY}</label>
                      <input
                        type="number"
                        value={rule.qty ?? ''}
                        onChange={(e) =>
                          updateRule(idx, { qty: Number(e.target.value) })
                        }
                        className={fieldBase}
                        placeholder={COUPON_MODEL_TEXT.RULES.MIN_QTY_PH}
                      />
                    </div>
                  )}

                  {rule.rule_type === PromotionRuleType.CUSTOMER_SEGMENT && (
                    <div>
                      <label className={labelBase}>{COUPON_MODEL_TEXT.RULES.SEGMENT}</label>
                      <input
                        type="text"
                        value={rule.segment_id ?? ''}
                        onChange={(e) =>
                          updateRule(idx, { segment_id: e.target.value })
                        }
                        className={fieldBase}
                        placeholder={COUPON_MODEL_TEXT.RULES.SEGMENT_PH}
                      />
                    </div>
                  )}

                  {rule.rule_type === PromotionRuleType.FIRST_ORDER_ONLY && (
                    <p className="text-xs text-indigo-600 font-medium bg-indigo-50 rounded-xl px-3 py-2.5 border border-indigo-100">
                      {COUPON_MODEL_TEXT.RULES.FIRST_ORDER_HINT}
                    </p>
                  )}

                  {rule.rule_type === PromotionRuleType.PRODUCT_IN_CART && (
                    <div>
                      <label className={labelBase}>{COUPON_MODEL_TEXT.RULES.PRODUCT_ID}</label>
                      <select
                        className={fieldBase}
                        value={rule.product_id ?? ''}
                        onChange={(e) =>
                          updateRule(idx, { product_id: e.target.value })
                        }
                      >
                        <option value="">{COUPON_MODEL_TEXT.RULES.PRODUCT_ID_PH}</option>
                        {productOptions.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.name.length > 50
                              ? `${opt.name.substring(0, 50)}…`
                              : opt.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {rule.rule_type === PromotionRuleType.NEW_CUSTOMER && (
                    <div>
                      <label className={labelBase}>{COUPON_MODEL_TEXT.RULES.DAYS_AGO}</label>
                      <input
                        type="number"
                        value={rule.registered_within_days ?? ''}
                        onChange={(e) =>
                          updateRule(idx, {
                            registered_within_days: Number(e.target.value),
                          })
                        }
                        className={fieldBase}
                        placeholder={COUPON_MODEL_TEXT.RULES.DAYS_AGO_PH}
                      />
                    </div>
                  )}

                  {rule.rule_type === PromotionRuleType.DATE_RANGE && (
                    <div>
                      <label className={labelBase}>{COUPON_MODEL_TEXT.RULES.DAYS_OF_WEEK}</label>
                      <div className="flex gap-1.5 flex-wrap">
                        {DAYS.map((day, dayIdx) => {
                          const active = (rule.days_of_week ?? []).includes(dayIdx);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => toggleDay(idx, dayIdx)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                                active
                                  ? 'bg-indigo-600 text-white border-indigo-600'
                                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {rule.rule_type === PromotionRuleType.MAX_USES_PER_USER && (
                    <div>
                      <label className={labelBase}>
                        {COUPON_MODEL_TEXT.RULES.MAX_USES}
                      </label>
                      <input
                        type="number"
                        value={rule.max ?? ''}
                        onChange={(e) =>
                          updateRule(idx, { max: Number(e.target.value) })
                        }
                        className={fieldBase}
                        placeholder={COUPON_MODEL_TEXT.RULES.MAX_USES_PH}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>

          {/* ── Submit ── */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-100 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {COUPON_MODEL_TEXT.RULES.FOOTER_SAVING}
              </>
            ) : isEditMode ? (
              COUPON_MODEL_TEXT.RULES.FOOTER_UPDATE
            ) : (
              COUPON_MODEL_TEXT.RULES.FOOTER_CREATE
            )}
          </button>
        </form>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 600,
          },
        }}
      />
    </div>
  );
};