"use client";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import {
  assignPolicyToCategory,
  fetchCreateAssignedProductPolicyOverride,
  fetchProductPolicies,
  fetchVendorProductsOptions,
  fetchVendorsProductsCategory,
} from "@/utils/vendorApiClient";
import { authToken } from "@/utils/authToken";
import { UiText } from "@/constants/ui-text";

interface PolicyOption {
  id: string;
  policy_name: string;
}
interface CategoryOption {
  id: string;
  name: string;
}
interface ProductOption {
  id: string;
  name: string;
}

export enum PolicyAssignTargetType {
  CATEGORY = "category",
  PRODUCT = "product",
}

interface AssignPolicySchema {
  target_type: PolicyAssignTargetType;
  policy_id: string;
  target_id: string;
  priority?: number;
  overrides_category?: boolean;
}

interface AssignPolicyPageProps {
  labels?: typeof UiText;
}

export default function AssignPolicyPage({
  labels = UiText,
}: AssignPolicyPageProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<AssignPolicySchema>({
    defaultValues: {
      target_type: PolicyAssignTargetType.CATEGORY,
      priority: 1,
      overrides_category: true,
    },
  });

  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMsg] = useState<string | null>(null);

  const [policies, setPolicies] = useState<PolicyOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const targetType = watch("target_type");
  const token = authToken();

  useEffect(() => {
    Promise.all([
      fetchProductPolicies(token!),
      fetchVendorsProductsCategory(token!),
      fetchVendorProductsOptions(token!),
    ])
      .then(([policiesResult, categoriesResult, productsResult]) => {
        setPolicies(policiesResult?.data ?? []);
        setCategories(categoriesResult?.data ?? []);
        setProducts(productsResult?.data ?? []);
        setLoadingOptions(false);
      })
      .catch(() => {
        setGlobalError(labels.ASSIGN.LOAD_ERROR);
        setLoadingOptions(false);
      });
  }, [token, labels.ASSIGN.LOAD_ERROR]);

  const onSubmit = async (data: AssignPolicySchema) => {
    setGlobalError(null);
    try {
      const result =
        data.target_type === PolicyAssignTargetType.CATEGORY
          ? await assignPolicyToCategory(
              {
                category_id: data.target_id,
                policy_id: data.policy_id,
                priority: data.priority ?? 1,
              },
              token!,
            )
          : await fetchCreateAssignedProductPolicyOverride(
              {
                product_id: data.target_id,
                policy_id: data.policy_id,
                overrides_category: data.overrides_category ?? true,
              },
              token!,
            );

      if (result?.error || result?.statusCode >= 400) {
        setGlobalError(result?.message ?? labels.ASSIGN.ASSIGN_ERROR);
        return;
      }
      router.push("/vendor/configDocuments");
    } catch {
      setGlobalError(labels.ASSIGN.ASSIGN_ERROR);
    }
  };

  return (
    <>
      <main className="px-1 py-4 w-full max-w-3xl mx-auto">
        <header className="my-6">
          <h1 className="font-bold text-theme-h4 text-gray-800">
            {labels.ASSIGN.TITLE}
          </h1>
          <p className="text-theme-body-sm text-gray-500 mt-1">
            {labels.ASSIGN.SUBTITLE}
          </p>
        </header>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full flex flex-col gap-6"
        >
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            {globalError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-theme-body-sm border border-red-200">
                {globalError}
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-theme-body-sm border border-green-200">
                {successMsg}
              </div>
            )}

            <div className="flex flex-col gap-5">
              {/* Target Type */}
              <div className="flex flex-col gap-2">
                <label className="text-theme-body-sm font-semibold text-gray-600">
                  {labels.ASSIGN.WHERE_APPLY}
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-200 rounded-xl hover:bg-blue-50 transition w-full">
                    <input
                      type="radio"
                      value={PolicyAssignTargetType.CATEGORY}
                      className="w-4 h-4 accent-blue-600"
                      {...register("target_type")}
                    />

                    <span className="font-medium text-gray-700">
                      {labels.ASSIGN.CATEGORY_DEFAULT}
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-200 rounded-xl hover:bg-blue-50 transition w-full">
                    <input
                      type="radio"
                      value={PolicyAssignTargetType.PRODUCT}
                      className="w-4 h-4 accent-blue-600"
                      {...register("target_type")}
                    />

                    <span className="font-medium text-gray-700">
                      {labels.ASSIGN.PRODUCT_OVERRIDE}
                    </span>
                  </label>
                </div>
              </div>

              {/* Policy Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-theme-body-sm font-semibold text-gray-600">
                  {labels.ASSIGN.SELECT_POLICY}
                </label>
                <select
                  className="border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={loadingOptions}
                  {...register("policy_id", {
                    required: labels.ASSIGN.SELECT_POLICY_REQUIRED,
                  })}
                >
                  <option value="">
                    {loadingOptions
                      ? labels.LOADING_POLICIES
                      : labels.ASSIGN.CHOOSE_POLICY}
                  </option>
                  {policies.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.policy_name}
                    </option>
                  ))}
                </select>
                {errors.policy_id && (
                  <p className="text-theme-caption text-red-500">
                    {errors.policy_id.message}
                  </p>
                )}
              </div>

              {/* Dynamic Target (Category or Product) */}
              <div className="flex flex-col gap-2">
                <label className="text-theme-body-sm font-semibold text-gray-600">
                  {targetType === PolicyAssignTargetType.CATEGORY
                    ? labels.ASSIGN.SELECT_CATEGORY
                    : labels.ASSIGN.SELECT_PRODUCT}
                </label>
                <select
                  className="border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={loadingOptions}
                  {...register("target_id", {
                    required: labels.ASSIGN.SELECT_TARGET_REQUIRED,
                  })}
                >
                  <option value="">
                    {loadingOptions
                      ? labels.ASSIGN.LOADING
                      : targetType === PolicyAssignTargetType.CATEGORY
                        ? labels.ASSIGN.CHOOSE_CATEGORY_PLACEHOLDER
                        : labels.ASSIGN.CHOOSE_PRODUCT_PLACEHOLDER}
                  </option>
                  {(targetType === PolicyAssignTargetType.CATEGORY
                    ? categories
                    : products
                  ).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                {errors.target_id && (
                  <p className="text-theme-caption text-red-500">
                    {errors.target_id.message}
                  </p>
                )}
              </div>

              {/* Priority (categories only) */}
              {targetType === PolicyAssignTargetType.CATEGORY && (
                <div className="flex flex-col gap-2">
                  <label className="text-theme-body-sm font-semibold text-gray-600">
                    {labels.ASSIGN.PRIORITY_LEVEL}{" "}
                    <span className="text-gray-400 font-normal">
                      {labels.ASSIGN.PRIORITY_DESC}
                    </span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    {...register("priority", { valueAsNumber: true })}
                  />
                </div>
              )}
            </div>
          </section>

          <div className="w-full flex justify-end gap-4">
            <Link
              href="/vendor/configDocuments"
              className="py-2.5 px-6 rounded-xl border border-gray-300 font-medium text-gray-700 hover:bg-gray-50"
            >
              {labels.CANCEL}
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || loadingOptions}
              className="py-2.5 px-6 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 shadow-sm disabled:opacity-60"
            >
              {isSubmitting
                ? labels.ASSIGN.ASSIGNING
                : labels.ASSIGN.ASSIGN_POLICY}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
