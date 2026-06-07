'use client';
import { useEffect, useReducer } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, MapPinPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { AddressCard } from "@/components/customer/AddressCard";
import { AddressModal } from "@/components/customer/AddressModel";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { RootState } from "@/lib/store";
import { fetchGetUserAddresses, fetchSetDefaultAddress } from "@/utils/customerApiClient";
import { AddressOperationEnum, Address } from "@/utils/Types";
import { fetchDeleteUserAddress } from "@/utils/customerApiClient-SA";
import { authToken } from "@/utils/authToken";
import { ActionType, ConfirmationModal } from "@/components/common/ConfirmationModal";
import { Button } from "@/components/ui/button";

// [Reducer code remains 100% UNTOUCHED as requested]
interface State {
    isModalOpen: boolean;
    modalMode: AddressOperationEnum;
    selectedId: string | undefined;
    addressList: Address[];
    confirmModalConfig: {
        title: string;
        message: string;
        actionType: ActionType;
        confirmText: string;
        onConfirm: () => void;
    };
    isProcessing: boolean;
    isConfirmModalOpen: boolean;
}

type Action =
    | { type: "OPEN_MODAL"; payload: { mode: AddressOperationEnum; id?: string } }
    | { type: "CLOSE_MODAL" }
    | { type: "SET_ADDRESS_LIST"; payload: Address[] }
    | { type: "SET_CONFIRM_MODAL"; payload: State['confirmModalConfig'] }
    | { type: "SET_CONFIRM_MODAL_OPEN"; payload: boolean }
    | { type: "SET_PROCESSING"; payload: boolean };

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "OPEN_MODAL":
            return { ...state, isModalOpen: true, modalMode: action.payload.mode, selectedId: action.payload.id };
        case "CLOSE_MODAL":
            return { ...state, isModalOpen: false, selectedId: undefined };
        case "SET_ADDRESS_LIST":
            return { ...state, addressList: action.payload };
        case "SET_CONFIRM_MODAL":
            return { ...state, confirmModalConfig: action.payload, isConfirmModalOpen: true };
        case "SET_CONFIRM_MODAL_OPEN":
            return { ...state, isConfirmModalOpen: action.payload };
        case "SET_PROCESSING":
            return { ...state, isProcessing: action.payload };
        default:
            return state;
    }
}

export default function AddressesClient() {
    const user = useAppSelector((state: RootState) => state.auth.user);
    const dispatchRedux = useAppDispatch();
    const router = useRouter();

    const [state, dispatch] = useReducer(reducer, {
        isModalOpen: false,
        modalMode: AddressOperationEnum.ADD,
        selectedId: undefined,
        addressList: [],
        confirmModalConfig: {
            title: "",
            message: "",
            actionType: "danger" as ActionType,
            confirmText: "",
            onConfirm: () => { }
        },
        isProcessing: false,
        isConfirmModalOpen: false
    });

    const token = authToken();

    useEffect(() => {
        const fetchAddresses = async () => {
            if (user?.id && token) {
                const response = await fetchGetUserAddresses(user.id, token);
                dispatch({ type: "SET_ADDRESS_LIST", payload: response.data || [] });
            }
        }
        fetchAddresses();
    }, [user, state.addressList.length, state.isModalOpen, token]);

    const openAdd = () => {
        dispatch({ type: "OPEN_MODAL", payload: { mode: AddressOperationEnum.ADD } });
    };

    const openEdit = (id: string) => {
        dispatch({ type: "OPEN_MODAL", payload: { mode: AddressOperationEnum.EDIT, id } });
    };

    const handleDelete = async (userId: string, id: string) => {
        if (!token) return;
        dispatch({
            type: "SET_CONFIRM_MODAL",
            payload: {
                title: "Delete Address?",
                message: "This action cannot be undone. Are you sure you want to delete this address?",
                actionType: "danger",
                confirmText: "Yes, Delete",
                onConfirm: async () => {
                    dispatch({ type: "SET_PROCESSING", payload: true });
                    await fetchDeleteUserAddress(userId, id, token);
                    dispatch({ type: "SET_ADDRESS_LIST", payload: state.addressList.filter(addr => addr.id !== id) });
                    dispatch({ type: "SET_PROCESSING", payload: false });
                    dispatch({ type: "SET_CONFIRM_MODAL_OPEN", payload: false });
                }
            }
        });
    };

    const handleSetDefault = async (userId: string, id: string) => {
        if (token) {
            await fetchSetDefaultAddress(userId, id, token);
            dispatch({
                type: "SET_ADDRESS_LIST",
                payload: state.addressList.map(addr => ({ ...addr, is_default: addr.id === id }))
            });
        }
    };

    return (
        <section className="w-full max-w-[1200px] mx-auto py-4 md:py-8 lg:px-8 px-4 pb-24 font-sans">
            {/* Desktop Header */}
            <div className="hidden sm:block mb-8">
                <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Saved Addresses</h1>
                <p className="text-base text-muted-foreground mt-2">Manage your shipping and billing locations for faster checkout.</p>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
                <AnimatePresence mode="popLayout">
                    {state.addressList && state.addressList.map((address) => (
                        <AddressCard
                            key={address.id}
                            address={address}
                            onEdit={openEdit}
                            onDelete={handleDelete}
                            onSetDefault={handleSetDefault}
                        />
                    ))}

                    {/* The Add New Address Card (matches mockup) */}
                    <motion.button
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={openAdd}
                        className="flex flex-col items-center justify-center h-full min-h-[260px] rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50 hover:bg-gray-100/80 transition-colors text-center p-6 group cursor-pointer"
                    >
                        <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <MapPinPlus size={24} strokeWidth={2} />
                        </div>
                        <h3 className="font-bold text-foreground text-lg">Add New Address</h3>
                        <p className="text-muted-foreground text-sm mt-1">Add a new shipping destination</p>
                    </motion.button>
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {state.isModalOpen && user?.id && (
                    <AddressModal
                        user={user}
                        addressId={state.selectedId}
                        addressList={state.addressList}
                        operation={state.modalMode}
                        onClose={() => dispatch({ type: "CLOSE_MODAL" })}
                    />
                )}
            </AnimatePresence>
            
            <ConfirmationModal
                isOpen={state.confirmModalConfig.actionType === "danger" && state.isConfirmModalOpen}
                title={state.confirmModalConfig.title}
                message={state.confirmModalConfig.message}
                onConfirm={state.confirmModalConfig.onConfirm}
                onClose={() => dispatch({ type: "SET_CONFIRM_MODAL_OPEN", payload: false })}
                cancelText="Cancel"
                actionType="danger"
                confirmText={state.confirmModalConfig.confirmText}
                isLoading={state.isProcessing}
            />
        </section>
    );
}