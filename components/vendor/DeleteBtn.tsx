"use client"
import { authToken } from '@/utils/authToken';
import { deleteProduct, deleteProductVariant } from '@/utils/vendorApiClient';
import { Delete, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
type DeleteBtnProps =
    | { id: string; toDelete: "PRODUCT"; style?: string; vendorId: string }
    | { id: string; toDelete: "VARIANT"; style?: string; vendorId: string; variantId: string }

export const DeleteBtn = (props: DeleteBtnProps) => {
    const router = useRouter();
    const handleDelete = async (productId: string) => {
        const token = authToken();
        if (!token) {
            toast.error("Authentication not found! Try to Login Again!");
            setTimeout(() => {
                router.push('/auth/vendorLogin');
            }, 2000);
            return;
        }
        if (props.toDelete === "VARIANT") {
            console.log(props.id, props.vendorId, props?.variantId)
            const result = await deleteProductVariant(productId, props.variantId, props.vendorId, token);
            console.log(result)
            return;
        } else if (props.toDelete === "PRODUCT") {
            
            const result = await deleteProduct(productId, props.vendorId, token);
            console.log(result)
            return;
        }
    }

    return (
        <>
            
        <button onClick={(() => handleDelete(props.id))} className={props.style} >
            <Trash2 />Delete
        </button>
            <Toaster />
        </>
    )
}
