"use client";
import {
  fetchTaxProfiles,
  fetchTaxSlabOptions,
  fetchTaxSlabs,
  fetchVendorsProductsCategory,
  fetchVendorWarehouse,
} from "@/utils/vendorApiClient";
import { ProductForm } from "@/components/vendor/ProductForm";
import { authToken } from "@/utils/authToken";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/hooks/reduxHooks";

const getWarehouseOptions = async (token: string, setWarehouseOptions: any) => {
  await fetchVendorWarehouse(token)
    .then((res) => {
      setWarehouseOptions(
        res.data.map((w: any) => ({ value: w.id, label: w.warehouse_name })),
      );
    })
    .catch((error) => {});
};
const getCategoryOptions = async (token: string, setCategoryOptions: any) => {
  await fetchVendorsProductsCategory(token)
    .then((res) => {
      setCategoryOptions(
        res.data.map((c: any) => ({ value: c.id, label: c.name })),
      );
    })
    .catch((error) => {});
};

const getTaxSlabsOptions = async (token: string, setTaxSlabsOptions: any) => {
  fetchTaxSlabOptions(token)
    .then((res) => {
      setTaxSlabsOptions(
        res.data.map((t: any) => ({
          value: t.id,
          label: t.slab_name,
        })),
      );
    })
    .catch((error) => {});
};
export default function ProductFormPage() {
  const { user } = useAppSelector((state) => state.auth);
  const vendorId = (user && "vendor_id" in user ? user.vendor_id : "") ?? "";
  const [categoryOptions, setCategoryOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [warehouseOptions, setWarehouseOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [taxSlabsOptions, setTaxSlabsOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const token = authToken();
  if (!token) {
    redirect("/auth/vendorLogin");
  }

  useEffect(() => {
    getWarehouseOptions(token, setWarehouseOptions);
    getCategoryOptions(token, setCategoryOptions);
    getTaxSlabsOptions(token, setTaxSlabsOptions);
  }, [token]);
  return (
    <main className="min-h-screen overflow-y-scroll py-8 w-full ">
      <div className=" mx-auto">
        <ProductForm
          categoryOptions={categoryOptions}
          vendorId={vendorId}
          warehouseOptions={warehouseOptions}
          taxSlabsOptions={taxSlabsOptions}
        />
      </div>
    </main>
  );
}
