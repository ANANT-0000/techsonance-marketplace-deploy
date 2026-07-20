"use client";
import { getClientCompanyId } from "@/utils/getCompanyId";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LocationFor, AddressSchema, AddressType } from "@/utils/validation";
import {
  fetchCreateWarehouseLocation,
  fetchDeleteWarehouseLocation,
  fetchUpdateWarehouseLocation,
  fetchVendorWarehouseLocations,
} from "@/utils/vendorApiClient";
import { motion, AnimatePresence } from "motion/react";
import { authToken } from "@/utils/authToken";
import { redirect } from "next/navigation";
import {
  MapPin,
  Building,
  Plus,
  Trash2,
  Edit,
  Package,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { Country, State, City } from "country-state-city";
import { FormInput } from "@/components/common/FormInput";
import { WAREHOUSE_ADDRESS_FIELDS } from "@/constants";
import { WAREHOUSE_LOCATIONS_TEXT } from "@/constants/vendorText";
import { VEDNOR_LOGIN_PATH, VEDNOR_REGISTER_PATH } from "@/constants";

interface Address {
  id: string;
  name: string;
  number: string;
  address_type: "warehouse" | string;
  address_line_1: string;

  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  landmark: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  company_id: string;
}

interface Warehouse {
  id: string;
  warehouse_name: string;
  address: Address;
}

export default function LocationsPage() {
  const companyId = getClientCompanyId();

  const [locationList, setLocationList] = useState<Warehouse[]>([]);
  const locationFormRef = useRef<HTMLFormElement>(null);
  const [closedLocationForm, setClosedLocationForm] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Warehouse | null>(
    null,
  );
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const token = authToken();
  const [fetchError, setFetchError] = useState<{
    message: string | null;
    success: boolean | null;
  }>({
    message: null,
    success: null,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(AddressSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      address_for: "warehouse",
      is_default: false,
      phone: "",
      address_line_1: "",

      city: "",
      state: "",
      street: "",
      postal_code: "",
      country: "",
      landmark: "",
    },
  });

  // 2. Watch Form Values for Cascading Logic
  const watchedCountry = watch("country");
  const watchedState = watch("state");

  // 3. Compute dynamic dropdown options using country-state-city
  // We map to .name so it stays compatible with your string[] inputs
  const availableCountries: string[] = Country.getAllCountries().map(
    (c) => c.name,
  );

  // We need the Country ISO code to look up states
  const selectedCountryObj = Country.getAllCountries().find(
    (c) => c.name === watchedCountry,
  );
  const availableStates: string[] = selectedCountryObj
    ? State.getStatesOfCountry(selectedCountryObj.isoCode).map((s) => s.name)
    : [];

  // We need both the Country ISO and State ISO to look up cities
  const selectedStateObj = selectedCountryObj
    ? State.getStatesOfCountry(selectedCountryObj.isoCode).find(
        (s) => s.name === watchedState,
      )
    : null;
  const availableCities: string[] =
    selectedCountryObj && selectedStateObj
      ? City.getCitiesOfState(
          selectedCountryObj.isoCode,
          selectedStateObj.isoCode,
        ).map((c) => c.name)
      : [];

  // 4. Cleanup Hooks: Reset child dropdowns if a parent changes
  useEffect(() => {
    if (!isEditing) {
      setValue("state", "");
      setValue("city", "");
    }
  }, [watchedCountry, setValue, isEditing]);

  useEffect(() => {
    if (!isEditing) {
      setValue("city", "");
    }
  }, [watchedState, setValue, isEditing]);

  const deleteLocation = async (id: string) => {
    if (!token || !companyId) {
      toast.error("Your session has expired. Please refresh or log in again.");
      return;
    }
    try {
      const response = await fetchDeleteWarehouseLocation(id, token, companyId);
      const updatedLocations = locationList.filter(
        (location) => location.id !== id,
      );
      setLocationList(updatedLocations);
      toast.success("Location deleted successfully.");
    } catch (error) {
      toast.error("We couldn't delete this location. Please try again.");
    }
  };

  const handleEditLocation = (location: Warehouse) => {
    setSelectedLocation(location);
    setIsEditing(true);
    setClosedLocationForm(true);
  };

  const onSubmit = async (data: AddressType, isEditing: boolean) => {
    if (!token || !companyId) {
      toast.error("Your session has expired. Please refresh or log in again.");
      return;
    }
    if (isEditing && selectedLocation) {
      await fetchUpdateWarehouseLocation(
        selectedLocation.id,
        data,
        token,
        companyId,
      )
        .then((res) => {
          setLocationList((prevList) =>
            prevList.map((loc) =>
              loc.id === selectedLocation.id
                ? {
                    ...loc,
                    warehouse_name: data.name,
                    address: {
                      ...loc.address,
                      ...data,
                      number: data.phone,
                      address_type: data.address_for,
                    },
                  }
                : loc,
            ),
          );
          toast.success("Location updated successfully.");
        })
        .catch((error) => {
          toast.error("We couldn't update this location. Please try again.");
        });
    } else {
      await fetchCreateWarehouseLocation(data, token, companyId)
        .then((res) => {
          setLocationList((prevList) => [
            ...prevList,
            {
              ...res,
              warehouse_name: data.name,
              address: {
                ...res.address,
                ...data,
                number: data.phone,
                address_type: data.address_for,
              },
            },
          ]);
          toast.success("Location added successfully.");
        })
        .catch((error) => {
          toast.error("We couldn't add your new location. Please try again.");
        });
    }
    setTimeout(() => {
      closeModal();
    }, 500);
  };

  const closeModal = () => {
    setClosedLocationForm(false);
    setIsEditing(false);
    setSelectedLocation(null);
  };

  useEffect(() => {
    if (!token || !companyId) {
      return;
    }
    const getWarehouseList = async () => {
      await fetchVendorWarehouseLocations(token, companyId)
        .then((response) => {
          if (response.success) {
            setLocationList(response.data);
          }
        })
        .catch((error) => {
          toast.error(
            "We couldn't load your warehouse locations right now. Please refresh the page.",
          );
        });
    };
    getWarehouseList();
  }, []);

  useEffect(() => {
    if (isEditing && selectedLocation) {
      reset({
        name: selectedLocation.warehouse_name,
        address_for: selectedLocation.address.address_type as LocationFor,
        is_default: selectedLocation.address.is_default || false,
        phone: selectedLocation.address.number || "",
        address_line_1: selectedLocation.address.address_line_1 || "",
        city: selectedLocation.address.city || "",
        state: selectedLocation.address.state || "",
        street: selectedLocation.address.street || "",
        postal_code: selectedLocation.address.postal_code || "",
        country: selectedLocation.address.country || "",
        landmark: selectedLocation.address.landmark || "",
      });
    } else {
      reset({});
    }
  }, [closedLocationForm, isEditing, selectedLocation, reset]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        locationFormRef.current &&
        !locationFormRef.current.contains(event.target as Node)
      ) {
        closeModal();
      }
    };

    if (closedLocationForm) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closedLocationForm]);

  if (!token || !companyId) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center p-6 ">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 max-w-md w-full rounded-2xl shadow-sm border border-gray-100 text-center"
        >
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-amber-100/50">
            <AlertCircle size={28} strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">
            Session Needs Refresh
          </h2>
          <p className="text-gray-500 mb-8 text-sm leading-relaxed">
            We need to verify your account to keep your data secure. Please log
            in again to continue managing your locations.
          </p>
          <a
            href={VEDNOR_LOGIN_PATH}
            className="inline-flex items-center justify-center w-full bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
          >
            Log In Again
          </a>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="w-full px-4 sm:px-8 py-1 min-h-screen max-h-screen overflow-y-scroll bg-[#fafafa]">
      <div className="mx-auto space-y-6">
        <AnimatePresence>
          {closedLocationForm && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex justify-center items-center"
            >
              <motion.form
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", duration: 0.4, bounce: 0.25 }}
                onSubmit={handleSubmit((data) =>
                  onSubmit(data as AddressType, isEditing),
                )}
                ref={locationFormRef}
                className="lg:p-8 p-5 space-y-6 max-h-[85dvh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-2xl"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  {WAREHOUSE_ADDRESS_FIELDS.map((field) => {
                    const fieldError = errors[field.id as keyof typeof errors];

                    // 5. Inject Dynamic Options
                    let dynamicOptions = field.options;
                    if (field.id === "country")
                      dynamicOptions = availableCountries;
                    if (field.id === "state") dynamicOptions = availableStates;
                    if (field.id === "city") dynamicOptions = availableCities;

                    return (
                      <div key={field.id} className="flex flex-col gap-1">
                        {field.type !== "checkbox" ? (
                          <>
                            <FormInput
                              label={field.label}
                              id={field.id}
                              register={register}
                              required={field.required}
                              options={dynamicOptions}
                              type={field.type}
                              placeholder={field.placeholder}
                            />

                            {fieldError && (
                              <p className="text-red-600 text-theme-body-sm">
                                {fieldError.message as string}
                              </p>
                            )}
                          </>
                        ) : (
                          <div className="flex items-center gap-2 py-2 border border-gray-300 mt-5 rounded-lg px-3">
                            <input
                              type="checkbox"
                              id={field.id}
                              {...register(field.id as keyof typeof register)}
                              className="h-5 w-5 rounded-full text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer"
                            />

                            <label
                              htmlFor={field.id}
                              className="text-theme-body-sm font-semibold text-gray-700 cursor-pointer"
                            >
                              {field.label}
                            </label>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-6 flex gap-3 justify-end border-t border-gray-100 mt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {WAREHOUSE_LOCATIONS_TEXT.FORM.CANCEL}
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-6 py-2 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 shadow-sm hover:shadow-md transition-all"
                  >
                    {WAREHOUSE_LOCATIONS_TEXT.FORM.SAVE}
                  </motion.button>
                </div>
              </motion.form>
            </motion.section>
          )}
        </AnimatePresence>

        <header className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-3 text-slate-700">
            <div className="p-2.5 bg-white border border-slate-100 rounded-xl shadow-sm">
              <Package size={22} className="text-slate-700" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 tracking-tight">
                {WAREHOUSE_LOCATIONS_TEXT.HEADER.TITLE}
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Manage your warehouses and inventory hubs
              </p>
            </div>
          </div>
          <button
            onClick={() => setClosedLocationForm(true)}
            className="group flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-5 py-2.5 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Plus
              size={16}
              className="transition-transform group-hover:scale-110"
            />
            {WAREHOUSE_LOCATIONS_TEXT.HEADER.ADD_BTN}
          </button>
        </header>

        <section className="w-full">
          <AnimatePresence mode="wait">
            {locationList.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center justify-center py-24 bg-white border border-gray-100 rounded-3xl shadow-sm relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-gray-50/30 to-white pointer-events-none" />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                    <Building
                      size={32}
                      className="text-slate-400"
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className="text-lg font-medium text-slate-800 mb-2">
                    No Warehouses Yet
                  </h3>
                  <p className="text-slate-500 text-sm mb-6 max-w-sm text-center leading-relaxed">
                    {WAREHOUSE_LOCATIONS_TEXT.EMPTY}
                  </p>
                  <button
                    onClick={() => setClosedLocationForm(true)}
                    className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md"
                  >
                    <Plus size={16} />
                    Add Your First Warehouse
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                <AnimatePresence>
                  {locationList.map((location, index) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
                      key={location.id}
                      className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-theme-caption font-semibold">
                            {location.address.address_type &&
                              location.address.address_type
                                .charAt(0)
                                .toUpperCase() +
                                location.address.address_type.slice(1)}
                          </span>
                          {location.address.is_default && (
                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md text-theme-tiny uppercase font-bold tracking-wide border border-blue-100">
                              {WAREHOUSE_LOCATIONS_TEXT.CARD.DEFAULT}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1.5 text-lg tracking-tight line-clamp-1">
                          {location.warehouse_name}
                        </h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                          {location.address.address_line_1},{" "}
                          {location.address.city}, {location.address.state}{" "}
                          {location.address.postal_code}
                        </p>
                        <p className="text-sm text-gray-400 mt-1 font-medium">
                          {location.address.country}
                        </p>
                        {location.address.number && (
                          <p className="text-sm text-gray-500 mt-3 pt-3 border-t border-gray-50">
                            <span className="font-medium text-gray-700">
                              {WAREHOUSE_LOCATIONS_TEXT.CARD.CONTACT}
                            </span>{" "}
                            {location.address.number}
                          </p>
                        )}
                      </div>

                      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditLocation(location)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => deleteLocation(location.id)}
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
        </section>
      </div>
    </main>
  );
}
