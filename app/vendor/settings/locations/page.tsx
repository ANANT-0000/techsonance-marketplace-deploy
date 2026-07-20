"use client";
import { getClientCompanyId } from "@/utils/getCompanyId";

import { useEffect, useReducer } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Plus, Save, Building, Trash2, Edit } from "lucide-react";
import { authToken } from "@/utils/authToken";
import { motion, AnimatePresence } from "motion/react";

import { LOCATIONS_TEXT } from "@/constants/vendorText";
import { LocationFormField } from "@/utils/Types";
import { LOCATION_FORM_FIELDS } from "@/constants";
import {
  fetchCreateCompanyLocation,
  fetchDeleteCompanyLocation,
  fetchGetCompanyLocations,
  fetchUpdateCompanyLocation,
} from "@/utils/vendorApiClient";
import { VEDNOR_LOGIN_PATH, VEDNOR_REGISTER_PATH } from "@/constants";

interface AddressType {
  id: string;
  name: string;
  number: string;
  address_type: string;
  address_line_1: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  landmark: string;
  is_default: boolean;
}

// ─── Dynamic Field Schema ────────────────────────────────────────────────────

export const INITIAL_LOCATION_FORM = {
  address_type: "Registered Office",
  name: "",
  number: "",
  address_line_1: "",
  street: "",
  city: "",
  state: "",
  postal_code: "",
  country: "India",
  landmark: "",
  is_default: false as boolean,
};

type LocationFormData = typeof INITIAL_LOCATION_FORM;

// ─── Render Helpers ──────────────────────────────────────────────────────────

const inputBase =
  "w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 mt-1.5 focus:border-blue-400 focus:bg-white focus:outline-none transition-colors text-theme-body-sm";

function renderField(
  field: LocationFormField,
  formData: LocationFormData,
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void,
) {
  const value = formData[field.name as keyof LocationFormData];

  switch (field.type) {
    case "select":
      return (
        <select
          name={field.name}
          value={value as string}
          onChange={handleChange}
          required={field.required}
          className={inputBase}
        >
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );

    case "checkbox":
      return (
        <div className="flex items-center gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100 mt-1.5">
          <input
            id={field.name}
            type="checkbox"
            name={field.name}
            checked={value as boolean}
            onChange={handleChange}
            className="w-5 h-5 text-blue-500 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
          />

          <label
            htmlFor={field.name}
            className="text-theme-body-sm font-medium text-gray-800 cursor-pointer"
          >
            {field.checkboxLabel}
          </label>
        </div>
      );

    default:
      return (
        <input
          type="text"
          name={field.name}
          value={value as string}
          onChange={handleChange}
          required={field.required}
          placeholder={field.placeholder}
          inputMode={field.inputMode}
          className={`${inputBase} ${field.className ?? ""}`}
        />
      );
  }
}

// ─── useReducer Action Types & State ─────────────────────────────────────────
enum LocationsActionType {
  SET_ADDRESSES = "SET_ADDRESSES",
  SET_LOADING = "SET_LOADING",
  SET_SHOW_MODAL = "SET_SHOW_MODAL",
  SET_SAVING = "SET_SAVING",
  SET_FORM_DATA = "SET_FORM_DATA",
  SET_EDITING_ID = "SET_EDITING_ID",
  RESET_FORM = "RESET_FORM",
}

interface LocationsState {
  addresses: AddressType[];
  loading: boolean;
  showModal: boolean;
  saving: boolean;
  formData: LocationFormData;
  editingId: string | null;
}

const initialState: LocationsState = {
  addresses: [],
  loading: true,
  showModal: false,
  saving: false,
  formData: INITIAL_LOCATION_FORM,
  editingId: null,
};

type LocationsAction =
  | { type: LocationsActionType.SET_ADDRESSES; payload: AddressType[] }
  | { type: LocationsActionType.SET_LOADING; payload: boolean }
  | { type: LocationsActionType.SET_SHOW_MODAL; payload: boolean }
  | { type: LocationsActionType.SET_SAVING; payload: boolean }
  | { type: LocationsActionType.SET_FORM_DATA; payload: LocationFormData }
  | { type: LocationsActionType.SET_EDITING_ID; payload: string | null }
  | { type: LocationsActionType.RESET_FORM };

function locationsReducer(
  state: LocationsState,
  action: LocationsAction,
): LocationsState {
  switch (action.type) {
    case LocationsActionType.SET_ADDRESSES:
      return { ...state, addresses: action.payload };
    case LocationsActionType.SET_LOADING:
      return { ...state, loading: action.payload };
    case LocationsActionType.SET_SHOW_MODAL:
      return { ...state, showModal: action.payload };
    case LocationsActionType.SET_SAVING:
      return { ...state, saving: action.payload };
    case LocationsActionType.SET_FORM_DATA:
      return { ...state, formData: action.payload as LocationFormData };
    case LocationsActionType.SET_EDITING_ID:
      return { ...state, editingId: action.payload as string | null };
    case LocationsActionType.RESET_FORM:
      return { ...state, formData: INITIAL_LOCATION_FORM, editingId: null };
    default:
      return state;
  }
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function VendorAddressesPage() {
  const companyId = getClientCompanyId();

  const router = useRouter();
  const [state, dispatch] = useReducer(locationsReducer, initialState);
  const { addresses, loading, showModal, saving, formData, editingId } = state;

  const token = authToken();

  useEffect(() => {
    if (!token) {
      router.push(VEDNOR_LOGIN_PATH);
      return;
    }
    fetchAddresses();
  }, [token]);

  const fetchAddresses = async () => {
    if (!token || !companyId) {
      return;
    }
    dispatch({ type: LocationsActionType.SET_LOADING, payload: true });
    try {
      const res = await fetchGetCompanyLocations(token, companyId);
      dispatch({
        type: LocationsActionType.SET_ADDRESSES,
        payload: res.data || [],
      });
    } catch (err) {
    } finally {
      dispatch({ type: LocationsActionType.SET_LOADING, payload: false });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const target = e.target as HTMLInputElement;
    const value = target.type === "checkbox" ? target.checked : target.value;
    dispatch({
      type: LocationsActionType.SET_FORM_DATA,
      payload: { ...formData, [target.name as keyof LocationFormData]: value },
    });
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!token || !companyId) {
      return;
    }
    dispatch({ type: LocationsActionType.SET_SAVING, payload: true });
    try {
      if (state.editingId) {
        await fetchUpdateCompanyLocation(
          state.editingId,
          formData,
          token || "",
          companyId,
        );
      } else {
        await fetchCreateCompanyLocation(formData, token || "", companyId);
      }
      dispatch({ type: LocationsActionType.SET_SHOW_MODAL, payload: false });
      dispatch({ type: LocationsActionType.RESET_FORM });
      fetchAddresses();
    } catch (error) {
      alert(LOCATIONS_TEXT.FAILED_SAVE);
    } finally {
      dispatch({ type: LocationsActionType.SET_SAVING, payload: false });
    }
  };

  const handleEdit = (address: AddressType) => {
    dispatch({ type: LocationsActionType.SET_EDITING_ID, payload: address.id });
    dispatch({
      type: LocationsActionType.SET_FORM_DATA,
      payload: {
        address_type: address.address_type || "Registered Office",
        name: address.name || "",
        number: address.number || "",
        address_line_1: address.address_line_1 || "",
        street: address.street || "",
        city: address.city || "",
        state: address.state || "",
        landmark: address.landmark || "",
        postal_code: address.postal_code || "",
        country: address.country || "",
        is_default: address.is_default || false,
      },
    });
    dispatch({ type: LocationsActionType.SET_SHOW_MODAL, payload: true });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    if (!token || !companyId) {
      return;
    }
    dispatch({ type: LocationsActionType.SET_LOADING, payload: true });
    try {
      await fetchDeleteCompanyLocation(id, token, companyId);
      fetchAddresses();
    } catch (err) {
      alert("Failed to delete location.");
      dispatch({ type: LocationsActionType.SET_LOADING, payload: false });
    }
  };

  const closeModal = () => {
    dispatch({ type: LocationsActionType.SET_SHOW_MODAL, payload: false });
    dispatch({ type: LocationsActionType.RESET_FORM });
  };

  return (
    <main className="w-full mx-auto mt-6 px-2 py-4 relative max-h-screen min-h-screen overflow-y-scroll">
      {/* Header */}
      <header className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-3 text-gray-700">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <MapPin size={24} />
          </div>
          <div>
            <h1 className="text-theme-h4 font-bold text-gray-800">
              {LOCATIONS_TEXT.TITLE}
            </h1>
            <p className="text-gray-500 text-theme-body-sm mt-0.5">
              {LOCATIONS_TEXT.SUBTITLE}
            </p>
          </div>
        </div>
        <button
          onClick={() =>
            dispatch({
              type: LocationsActionType.SET_SHOW_MODAL,
              payload: true,
            })
          }
          className="flex items-center gap-2 font-semibold text-theme-body-sm bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-xl px-5 py-2.5 transition-colors shadow-sm"
        >
          <Plus size={16} /> {LOCATIONS_TEXT.ADD_NEW_ADDRESS}
        </button>
      </header>

      {/* Address List */}
      <AnimatePresence mode="popLayout">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-16 text-center text-gray-400"
          >
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-theme-body-sm">{LOCATIONS_TEXT.LOADING}</p>
          </motion.div>
        ) : addresses.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="border border-dashed border-gray-300 rounded-2xl py-16 text-center bg-gray-50/50"
          >
            <Building size={40} className="mx-auto mb-3 text-gray-300" />
            <h3 className="text-gray-800 font-semibold mb-1">
              {LOCATIONS_TEXT.NO_ADDRESSES}
            </h3>
            <p className="text-theme-body-sm text-gray-500 mb-4">
              {LOCATIONS_TEXT.NO_ADDRESSES_DESC}
            </p>
            <button
              onClick={() =>
                dispatch({
                  type: LocationsActionType.SET_SHOW_MODAL,
                  payload: true,
                })
              }
              className="text-theme-body-sm font-semibold text-blue-600 hover:underline"
            >
              {LOCATIONS_TEXT.ADD_FIRST_ADDRESS}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            <AnimatePresence>
              {addresses &&
                addresses.map((address) => (
                  <motion.div
                    key={address.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-theme-caption font-semibold">
                          {address.address_type}
                        </span>
                        {address.is_default && (
                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md text-theme-tiny uppercase font-bold tracking-wide border border-blue-100">
                            {LOCATIONS_TEXT.DEFAULT_BADGE}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-800 mb-1 line-clamp-1">
                        {address.address_line_1}
                      </h3>

                      <p className="text-theme-body-sm text-gray-600">
                        {address.city}, {address.state} {address.postal_code}
                      </p>
                      <p className="text-theme-body-sm text-gray-500 mt-1">
                        {address.country}
                      </p>
                    </div>

                    <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleEdit(address)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(address.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Address Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
            onClick={(e) => e.target === e.currentTarget && closeModal()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10 rounded-t-2xl">
                <h2 className="text-theme-h5 font-bold text-gray-800 flex items-center gap-2">
                  <Building className="text-blue-500" size={20} />{" "}
                  {editingId
                    ? "Edit Location"
                    : LOCATIONS_TEXT.ADD_TITLE || "Add New Location"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-theme-h4 font-light leading-none"
                  aria-label="Close modal"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {LOCATION_FORM_FIELDS.map((field) => {
                    const isCheckbox = field.type === "checkbox";
                    const colClass =
                      field.colSpan === "full" || isCheckbox
                        ? "md:col-span-2"
                        : "";

                    return (
                      <div key={field.name} className={colClass}>
                        {/* Don't render a standalone label for checkboxes — it's inline */}
                        {!isCheckbox && (
                          <label className="text-theme-body-sm font-semibold text-gray-700">
                            {field.label}
                            {field.required && (
                              <span className="text-red-500 ml-0.5">*</span>
                            )}
                          </label>
                        )}
                        {renderField(field, formData, handleChange)}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    {LOCATIONS_TEXT.CANCEL}
                  </button>
                  <button
                    disabled={saving}
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-70"
                  >
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save size={18} />
                    )}
                    {saving
                      ? LOCATIONS_TEXT.SAVING
                      : LOCATIONS_TEXT.SAVE_ADDRESS}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
