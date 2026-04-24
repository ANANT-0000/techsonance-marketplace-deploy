"use client"
import { deleteProduct, deleteProductVariant } from '@/utils/vendorApiClient';
import { Delete, Trash2 } from 'lucide-react'
type DeleteBtnProps =
    | { id: string; toDelete: "PRODUCT"; style?: string; vendorId: string }
    | { id: string; toDelete: "VARIANT"; style?: string; vendorId: string; variantId: string }

export const DeleteBtn = (props: DeleteBtnProps) => {
    const handleDelete = async (productId: string) => {
        const confirmed = window.confirm(`Are you sure you want to delete this product? This action cannot be undone.`);
        if (!confirmed) return;
        if (props.toDelete === "VARIANT") {
            console.log(props.id, props.vendorId, props?.variantId)
            const result = await deleteProductVariant(productId, props.variantId, props.vendorId,);
            console.log(result)
            return;
        } else if (props.toDelete === "PRODUCT") {
            const result = await deleteProduct(productId, props.vendorId);
            console.log(result)
            return;
        }
    }

    return (
        <button onClick={(() => handleDelete(props.id))} className={props.style} >
            <Trash2 />Delete
        </button>
    )
}
