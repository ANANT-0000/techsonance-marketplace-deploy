"use server"
import { deleteVendorProductCategory, fetchVendorsProductsCategory } from '@/utils/vendorApiClient';
import { Button } from '../common/Button';

export const CategoriesList = async ({ vendorId }: { categories: any[]; vendorId: string }) => {
    const getCategory = await fetchVendorsProductsCategory(vendorId);
    const categories = getCategory?.data || [];
    return (
        <>
            
        </>
    )
}
