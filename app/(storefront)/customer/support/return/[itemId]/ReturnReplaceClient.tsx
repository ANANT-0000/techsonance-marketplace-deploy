"use client";

import { useEffect, useReducer } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle, UploadCloud, X, PackageSearch, ChevronDown } from "lucide-react";
import { fetchOrderItemDetails, fetchReturnReplaceItem } from "@/utils/customerApiClient";
import { formatCurrency } from "@/lib/utils";
import { toast, Toaster } from 'react-hot-toast';
import { useAppSelector } from "@/hooks/reduxHooks";
import { RootState } from "@/lib/store";
import { authToken } from "@/utils/authToken";

const RETURN_REASONS = [
    "Item is damaged or broken",
    "Item is defective or doesn't work",
    "Wrong item was sent",
    "Missing parts or accessories",
    "Product doesn't match description",
    "No longer needed",
    "Other"
];

const PROOF_REQUIRED_REASONS = [
    "Item is damaged or broken",
    "Item is defective or doesn't work"
];

export enum ReturnReplaceTypeEnum {
    RETURN = "return",
    REFUND = "refund",
    REPLACEMENT = "replacement"
}

export enum ReturnReplaceActionType {
  SET_TARGET_ITEM = 'SET_TARGET_ITEM',
  SET_REQUEST_TYPE = 'SET_REQUEST_TYPE',
  SET_REASON = 'SET_REASON',
  SET_COMMENTS = 'SET_COMMENTS',
  ADD_FILES = 'ADD_FILES',
  REMOVE_FILE = 'REMOVE_FILE',
  SET_SUBMITTING = 'SET_SUBMITTING',
  SET_ERROR = 'SET_ERROR',
}

export interface ReturnItemPayload {
  quantity: number;
  price: string | number;
  variant: {
      variant_name: string;
      images: { image_url: string }[];
  };
  [key: string]: any;
}

interface State {
    targetItem: ReturnItemPayload | null;
    requestType: ReturnReplaceTypeEnum;
    selectedReason: string;
    comments: string;
    proofFiles: File[];
    previewUrls: string[];
    isSubmitting: boolean;
    error: string;
}

type Action =
    | { type: ReturnReplaceActionType.SET_TARGET_ITEM; payload: ReturnItemPayload | null }
    | { type: ReturnReplaceActionType.SET_REQUEST_TYPE; payload: ReturnReplaceTypeEnum }
    | { type: ReturnReplaceActionType.SET_REASON; payload: string }
    | { type: ReturnReplaceActionType.SET_COMMENTS; payload: string }
    | { type: ReturnReplaceActionType.ADD_FILES; payload: { files: File[]; urls: string[] } }
    | { type: ReturnReplaceActionType.REMOVE_FILE; payload: number }
    | { type: ReturnReplaceActionType.SET_SUBMITTING; payload: boolean }
    | { type: ReturnReplaceActionType.SET_ERROR; payload: string };

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case ReturnReplaceActionType.SET_TARGET_ITEM: return { ...state, targetItem: action.payload };
        case ReturnReplaceActionType.SET_REQUEST_TYPE: return { ...state, requestType: action.payload };
        case ReturnReplaceActionType.SET_REASON: return { ...state, selectedReason: action.payload };
        case ReturnReplaceActionType.SET_COMMENTS: return { ...state, comments: action.payload };
        case ReturnReplaceActionType.ADD_FILES: return {
            ...state,
            proofFiles: action.payload.files,
            previewUrls: action.payload.urls
        };
        case ReturnReplaceActionType.REMOVE_FILE: return {
            ...state,
            proofFiles: state.proofFiles.filter((_, i) => i !== action.payload),
            previewUrls: state.previewUrls.filter((_, i) => i !== action.payload)
        };
        case ReturnReplaceActionType.SET_SUBMITTING: return { ...state, isSubmitting: action.payload };
        case ReturnReplaceActionType.SET_ERROR: return { ...state, error: action.payload };
        default: return state;
    }
}

export default function ReturnReplaceClient() {
    const { orderId, itemId } = useParams<{ orderId: string; itemId: string }>();
    const router = useRouter();
    const { user } = useAppSelector((state: RootState) => state.auth);

    const [state, dispatch] = useReducer(reducer, {
        targetItem: null,
        requestType: ReturnReplaceTypeEnum.RETURN,
        selectedReason: "",
        comments: "",
        proofFiles: [],
        previewUrls: [],
        isSubmitting: false,
        error: ""
    });

    const token = authToken();
    useEffect(() => {
        if (!itemId || !token) return;
        const getOrder = async () => {
            const res = await fetchOrderItemDetails(itemId, token);
            if (res?.data) {
                dispatch({ type: ReturnReplaceActionType.SET_TARGET_ITEM, payload: res.data });
            }
        };
        getOrder();
    }, [orderId, itemId, token]);

    useEffect(() => {
        return () => {
            state.previewUrls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [state.previewUrls]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const combined = [...state.proofFiles, ...newFiles].slice(0, 3);
            const urls = combined.map((f) => URL.createObjectURL(f));
            dispatch({ type: ReturnReplaceActionType.ADD_FILES, payload: { files: combined, urls } });
        }
    };

    const removeFile = (indexToRemove: number) => {
        URL.revokeObjectURL(state.previewUrls[indexToRemove]);
        dispatch({ type: ReturnReplaceActionType.REMOVE_FILE, payload: indexToRemove });
    };

    const isProofRequired = PROOF_REQUIRED_REASONS.includes(state.selectedReason);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch({ type: ReturnReplaceActionType.SET_ERROR, payload: "" });

        if (!state.selectedReason) {
            dispatch({ type: ReturnReplaceActionType.SET_ERROR, payload: "Please select a reason for the request." });
            return;
        }

        if (isProofRequired && state.proofFiles.length === 0) {
            dispatch({ type: ReturnReplaceActionType.SET_ERROR, payload: "Please upload at least one photo showing the defect/damage." });
            return;
        }

        if (!user?.id || !token) {
            dispatch({ type: ReturnReplaceActionType.SET_ERROR, payload: "User ID is required. Please log in and try again." });
            return;
        }

        dispatch({ type: ReturnReplaceActionType.SET_SUBMITTING, payload: true });
        try {
            const formData = new FormData();
            formData.append("order_item_id", itemId);
            formData.append("type", state.requestType);
            formData.append("reason", state.selectedReason);
            formData.append("customer_note", state.comments);
            state.proofFiles.forEach((file) => formData.append("evidence_images", file));

            const response = await fetchReturnReplaceItem(user.id, formData, token);
            if (response.success) {
                toast.success(
                    `${state.requestType === ReturnReplaceTypeEnum.RETURN ? 'Return' : 'Replacement'} requested successfully!`
                );
                setTimeout(() => router.back(), 1500);
            } else {
                dispatch({ type: ReturnReplaceActionType.SET_ERROR, payload: "Failed to submit request. Please try again." });
            }
        } catch (err: any) {
            const message = err?.message || "An error occurred. Please try again.";
            dispatch({ type: ReturnReplaceActionType.SET_ERROR, payload: message });
            toast.error(message);
        } finally {
            dispatch({ type: ReturnReplaceActionType.SET_SUBMITTING, payload: false });
        }
    };

    if (!state.targetItem) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#f8fafc]">
            <PackageSearch className="w-10 h-10 text-theme-primary animate-pulse mb-4" />
            <p className="text-gray-500 font-medium tracking-wide">Loading item details...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] py-8 sm:py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex items-center gap-4 mb-6 sm:mb-8">
                    <div>
                        <h1 className="text-theme-h4 sm:text-theme-h3 font-extrabold text-gray-900 tracking-tight">Initiate a Request</h1>
                        {orderId && <p className="text-theme-body-sm font-medium text-gray-500 mt-1">Order #{orderId}</p>}
                    </div>
                </div>

                {/* Target Item Details */}
                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200 mb-6 flex items-start sm:items-center gap-4 sm:gap-5 transition-all">
                    <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
                        <img
                            src={state.targetItem.variant.images[0]?.image_url ?? "https://placehold.co/400x400/f8fafc/94a3b8?text=Product"}
                            alt={state.targetItem.variant.variant_name}
                            className="w-full h-full object-cover mix-blend-multiply"
                        />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <p className="font-bold text-gray-900 text-theme-body-sm sm:text-theme-h6 line-clamp-2 leading-snug">
                            {state.targetItem.variant.variant_name}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-y-1 gap-x-4 mt-2">
                            <p className="text-gray-500 text-theme-caption sm:text-theme-body-sm font-medium">Qty: {state.targetItem.quantity}</p>
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 hidden sm:block"></span>
                            <p className="font-bold text-gray-900 text-theme-body-sm sm:text-theme-h6">₹{formatCurrency(Number(state.targetItem.price))}</p>
                        </div>
                    </div>
                </div>

                {/* Form Wrapper */}
                <form onSubmit={handleSubmit} className="bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-gray-200 space-y-8 sm:space-y-10">

                    {state.error && (
                        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-start gap-3 text-theme-body-sm font-medium">
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <p>{state.error}</p>
                        </div>
                    )}

                    {/* Step 1: Type */}
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-theme-body sm:text-theme-h5 font-bold text-gray-900">1. Select Request Type</h2>
                            <p className="text-theme-caption sm:text-theme-body-sm text-gray-500 mt-1">Choose how you would like us to resolve this.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[ReturnReplaceTypeEnum.REPLACEMENT, ReturnReplaceTypeEnum.RETURN].map((type) => {
                                const isSelected = state.requestType === type;
                                return (
                                    <div
                                        key={type}
                                        onClick={() => dispatch({ type: ReturnReplaceActionType.SET_REQUEST_TYPE, payload: type as ReturnReplaceTypeEnum })}
                                        className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${isSelected
                                            ? 'border-theme-primary/90 bg-white shadow-sm'
                                            : 'border-gray-200 hover:border-theme-primary/90 hover:bg-theme-primary/5'
                                            }`}
                                    >
                                        <div className="absolute top-5 right-5">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? "border-theme-primary bg-theme-primary" : "border-gray-300"
                                                }`}>
                                                {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                            </div>
                                        </div>

                                        <p className={`font-bold text-theme-body sm:text-theme-h6 mb-1 pr-8 ${isSelected ? 'text-theme-primary-foreground' : 'text-theme-primary-foreground/80'}`}>
                                            {type === ReturnReplaceTypeEnum.REPLACEMENT ? 'Replace Item' : 'Return Item'}
                                        </p>
                                        <p className="text-theme-caption sm:text-theme-body-sm font-medium text-gray-500">
                                            {type === ReturnReplaceTypeEnum.REPLACEMENT
                                                ? 'Get an exact replacement for this item'
                                                : 'Get a refund to your original payment method'}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Step 2: Reason */}
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-theme-body sm:text-theme-h5 font-bold text-gray-900">2. Reason for Request</h2>
                            <p className="text-theme-caption sm:text-theme-body-sm text-gray-500 mt-1">Help us understand what went wrong.</p>
                        </div>
                        <div className="relative">
                            <select
                                value={state.selectedReason}
                                onChange={(e) => dispatch({ type: ReturnReplaceActionType.SET_REASON, payload: e.target.value })}
                                className="w-full text-theme-body-sm sm:text-theme-body px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-theme-primary/90 focus:border-theme-primary-foreground/90 outline-none transition-all appearance-none font-medium text-gray-700 cursor-pointer"
                            >
                                <option value="" disabled>Select a reason...</option>
                                {RETURN_REASONS.map(reason => (
                                    <option key={reason} value={reason}>{reason}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                <ChevronDown className="w-4 h-4" />
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Step 3: Proof */}
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-theme-body sm:text-theme-h5 font-bold text-gray-900 flex items-center gap-2">
                                3. Upload Evidence
                                {isProofRequired && <span className="text-theme-tiny font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded uppercase tracking-wide">Required</span>}
                            </h2>
                            <p className="text-theme-caption sm:text-theme-body-sm text-gray-500 mt-1">
                                {isProofRequired
                                    ? "Clear photos are required for damaged or defective items."
                                    : "Optionally provide photos to support your request."}
                            </p>
                        </div>

                        <div className="flex gap-3 sm:gap-4 flex-wrap mt-4">
                            {state.proofFiles.map((_, index) => (
                                <div key={index} className="relative w-20 h-20 sm:w-28 sm:h-28 border border-gray-200 rounded-xl overflow-hidden group shadow-sm">
                                    <img src={state.previewUrls[index]} alt="proof" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            className="bg-white text-gray-900 rounded-full p-1.5 hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {state.proofFiles.length < 3 && (
                                <label className="w-20 h-20 sm:w-28 sm:h-28 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-theme-primary-foreground cursor-pointer hover:border-theme-primary hover:bg-theme-primary/10 hover:text-theme-primary-foreground/90 transition-all">
                                    <UploadCloud size={24} className="mb-1 sm:mb-2" />
                                    <span className="text-theme-tiny sm:text-theme-caption font-semibold">Upload Photo</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Step 4: Comments */}
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-theme-body sm:text-theme-h5 font-bold text-gray-900">4. Additional Comments</h2>
                            <p className="text-theme-caption sm:text-theme-body-sm text-gray-500 mt-1">Provide any other details that might help us.</p>
                        </div>
                        <textarea
                            rows={4}
                            value={state.comments}
                            onChange={(e) => dispatch({ type: ReturnReplaceActionType.SET_COMMENTS, payload: e.target.value })}
                            placeholder="Please describe the issue in detail..."
                            className="w-full p-4 text-theme-body-sm sm:text-theme-body bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-theme-primary/90 focus:border-theme-primary/90 outline-none resize-none transition-all"
                        />
                    </div>

                    {/* Submit Area */}
                    <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 justify-end pt-6 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={state.isSubmitting}
                            className={`w-full sm:w-auto px-8 py-3 text-theme-primary-foreground rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${state.isSubmitting
                                ? "bg-theme-primary cursor-not-allowed"
                                : "bg-theme-primary hover:bg-theme-primary active:scale-[0.98] shadow-theme-primary/20"
                                }`}
                        >
                            {state.isSubmitting ? (
                                <><span className="animate-pulse">Submitting Request...</span></>
                            ) : (
                                "Submit Request"
                            )}
                        </button>
                    </div>
                </form>
            </div>
            <Toaster position="top-center" />
        </div>
    );
}