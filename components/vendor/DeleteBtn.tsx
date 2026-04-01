"use client"
import { Delete, Trash2 } from 'lucide-react'

export const DeleteBtn = ({ id }) => {
    const handleDelete = (productId: string) => {
        // Implement the logic to delete the product with the given id
        console.log(`Delete product with ID: ${productId}`);
    }

    return (
        <button onClick={() => handleDelete(id)} className="flex gap-2  text-red-600 hover:text-red-800" title="Delete Product">
            Delete <Trash2 />
        </button>
    )
}
