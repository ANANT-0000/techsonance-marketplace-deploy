"use client"
import { fetchVendorsProductsCategory, fetchVendorWarehouse } from "@/utils/vendorApiClient";
import { ProductForm } from "@/components/vendor/ProductForm";
import { authToken } from "@/utils/authToken";
import { redirect, useParams } from "next/navigation";
import { useEffect, useState } from "react";

const getWarehouseOptions = async (token: string, vendorId: string, setWarehouseOptions: any) => {
    await fetchVendorWarehouse(token).then((res) => {
        setWarehouseOptions(res.data.map((w: any) => ({ value: w.id, label: w.warehouse_name })));
    }).catch((error) => {
        console.error("Error fetching warehouse options:", error);
    });
}
const getCategoryOptions = async (token: string, vendorId: string, setCategoryOptions: any) => {
    await fetchVendorsProductsCategory(vendorId, token).then((res) => {
        setCategoryOptions(res.data.map((c: any) => ({ value: c.id, label: c.name })));
    }).catch((error) => {
        console.error("Error fetching category options:", error);
    });
}
export default function ProductFormPage() {

    const { vendorId } = useParams<{ vendorId: string }>();
    const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string; }[]>([]);
    const [warehouseOptions, setWarehouseOptions] = useState<{ value: string; label: string; }[]>([]);
    const token = authToken();
    if (!token) {
        redirect("/auth/vendorLogin");
    }

    useEffect(() => {
        getWarehouseOptions(token, vendorId, setWarehouseOptions)
        getCategoryOptions(token, vendorId, setCategoryOptions)
    }, [token])
    return (
        <main className="min-h-screen  py-8 w-full ">
            <div className=" mx-auto">
                <ProductForm categoryOptions={categoryOptions} vendorId={vendorId} warehouseOptions={warehouseOptions} />
            </div>
        </main>
    );
}