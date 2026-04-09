"use client"
import { deleteProduct, deleteProductVariant } from '@/utils/vendorApiClient';
import { Delete, Trash2 } from 'lucide-react'
import React from 'react';

export const DeleteBtn = ({ id, toDelete, style = 'flex gap-2  text-red-600 hover:text-red-800', ...props }: { id: string; toDelete: string; style?: string; } & React.ProfilerProps) => {
    const handleDelete = async (id: string) => {
        const confirmed = window.confirm(`Are you sure you want to delete this product? This action cannot be undone.`);
        if (!confirmed) return;
        if (toDelete === "VARIANT") {
            console.log(id, props.vendorId, props.productId)
            const result = await deleteProductVariant(id, props.vendorId, props.productId,props.variantId);
            console.log(result)
            return;
        } else if (toDelete === "PRODUCT") {
            const result = await deleteProduct(id, props.vendorId);
            console.log(result)
            return;
        }
    }

    return (
        <button onClick={(() => handleDelete(id))} className={style} >
            Delete <Trash2 />
        </button>
    )
}
