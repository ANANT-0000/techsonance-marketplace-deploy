"use client";
import { getClientCompanyId } from "@/utils/getCompanyId";
import { authToken } from "@/utils/authToken";
import { deleteProduct, deleteProductVariant } from "@/utils/vendorApiClient";
import { Delete, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { DELETE_BTN_TEXT } from "@/constants/vendorText";
type DeleteBtnProps =
  | { id: string; toDelete: "PRODUCT"; style?: string; vendorId: string }
  | {
      id: string;
      toDelete: "VARIANT";
      style?: string;
      vendorId: string;
      variantId: string;
    };

export const DeleteBtn = (props: DeleteBtnProps) => {
  const companyId = getClientCompanyId();

  const router = useRouter();
  const handleDelete = async (productId: string) => {
    const token = authToken();
    if (!token || !companyId) {
      toast.error(DELETE_BTN_TEXT.ERR_AUTH);
      setTimeout(() => {
        router.push("/auth/vendorLogin");
      }, 2000);
      return;
    }
    if (props.toDelete === "VARIANT") {
      const result = await deleteProductVariant(
        productId,
        props.variantId,
        token,
        companyId,
      );
      return;
    } else if (props.toDelete === "PRODUCT") {
      const result = await deleteProduct(productId, token, companyId);
      return;
    }
  };

  return (
    <>
      <button onClick={() => handleDelete(props.id)} className={props.style}>
        <Trash2 />
        {DELETE_BTN_TEXT.DELETE}
      </button>
      <Toaster />
    </>
  );
};
