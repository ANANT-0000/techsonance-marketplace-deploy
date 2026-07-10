"use client";
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
import { MapPin, Building, Plus, Trash2, Edit, Package } from "lucide-react";
import { Country, State, City } from "country-state-city";
import { FormInput } from "@/components/common/FormInput";
import { WAREHOUSE_ADDRESS_FIELDS } from "@/constants";
import { WAREHOUSE_LOCATIONS_TEXT } from "@/constants/vendorText";

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
    if (!token) {
      redirect("/auth/vendorLogin");
    }
    const response = await fetchDeleteWarehouseLocation(id, token);
    const updatedLocations = locationList.filter(
      (location) => location.id !== id,
    );
    setLocationList(updatedLocations);
  };

  const handleEditLocation = (location: Warehouse) => {
    setSelectedLocation(location);
    setIsEditing(true);
    setClosedLocationForm(true);
  };

  const onSubmit = async (data: AddressType, isEditing: boolean) => {
    if (!token) {
      redirect("/auth/vendorLogin");
    }
    if (isEditing && selectedLocation) {
      const response = await fetchUpdateWarehouseLocation(
        selectedLocation.id,
        data,
        token,
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
                : loc
            )
          );
        })
        .catch((error) => {});
    } else {
      const response = await fetchCreateWarehouseLocation(data, token)
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
        })
        .catch((error) => {});
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
    if (!token) {
      redirect("/auth/vendorLogin");
    }
    const getWarehouseList = async () => {
      await fetchVendorWarehouseLocations(token)
        .then((response) => {
          if (response.success) {
            setLocationList(response.data);
          }
        })
        .catch((error) => {});
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

  return (
    <main className="mt-1 min-h-screen max-h-screen overflow-y-scroll relative w-full">
      <AnimatePresence>
        {closedLocationForm && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-10 flex justify-center items-center"
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
              className="lg:p-6 p-3 space-y-4 max-h-[80dvh] overflow-y-auto bg-white rounded-2xl shadow-2xl w-full max-w-2xl"
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

              <div className="pt-4 flex gap-3 justify-end">
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
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
                >
                  {WAREHOUSE_LOCATIONS_TEXT.FORM.SAVE}
                </motion.button>
              </div>
            </motion.form>
          </motion.section>
        )}
      </AnimatePresence>

      <header className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-3 text-gray-700">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Package size={24} />
          </div>
          <div>
            <h1 className="text-theme-h4 font-bold text-gray-800">
              {WAREHOUSE_LOCATIONS_TEXT.HEADER.TITLE}
            </h1>
            <p className="text-gray-500 text-theme-body-sm mt-0.5">
              Manage your warehouses and inventory hubs
            </p>
          </div>
        </div>
        <button
          onClick={() => setClosedLocationForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus size={20} />
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
              className="flex flex-col items-center justify-center py-16 bg-white border border-gray-200 rounded-2xl shadow-sm"
            >
              <Building size={48} className="text-gray-300 mb-4" />
              <h2 className="text-theme-h5 font-bold text-gray-800 mb-2">
                No Warehouses Yet
              </h2>
              <p className="text-gray-500 mb-6 max-w-md text-center text-theme-body-sm">
                {WAREHOUSE_LOCATIONS_TEXT.EMPTY}
              </p>
              <button
                onClick={() => setClosedLocationForm(true)}
                className="text-theme-body-sm font-semibold text-blue-600 hover:underline"
              >
                Add Your First Warehouse
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
                {locationList.map((location, index) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                    key={location.id}
                    className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
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
                      <h3 className="font-bold text-gray-800 mb-1 line-clamp-1">
                        {location.warehouse_name}
                      </h3>
                      <p className="text-theme-body-sm text-gray-600">
                        {location.address.address_line_1},{" "}
                        {location.address.city}, {location.address.state}{" "}
                        {location.address.postal_code}
                      </p>
                      <p className="text-theme-body-sm text-gray-500 mt-1">
                        {location.address.country}
                      </p>
                      {location.address.number && (
                        <p className="text-theme-body-sm text-gray-500 mt-2">
                          <span className="font-semibold text-gray-700">
                            {WAREHOUSE_LOCATIONS_TEXT.CARD.CONTACT}
                          </span>{" "}
                          {location.address.number}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-gray-100">
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
    </main>
  );
}
