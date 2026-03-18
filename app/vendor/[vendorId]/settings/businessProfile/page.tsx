'use client';
 
import { useForm } from "react-hook-form"; 
 
interface BusinessProfile {
    id: number;
    full_name: string;         // The personal name of the account holder
    tax_id: string;            // e.g., GSTIN, VAT, or PAN
    business_name: string;     // The display name of the shop/company
    contact_email: string;
    contact_phone: string;
    description: string;       // A brief "About Us" for the storefront
    verified: boolean;         // (Optional) To track if the profile is approved
}

/**
 * Array of Mock Business Profiles
 */
const businessProfileData: BusinessProfile =

{
    id: 2,
    full_name: "Anita Desai",
    tax_id: "27AABCV5678G1Z9",
    business_name: "Desai Electronics Hub",
    contact_email: "support@desaielectronics.in",
    contact_phone: "+91 99887 76655",
    description: "Authorized reseller of major tech brands. Selling smartphones, laptops, and accessories with a 1-year warranty on all products.",
    verified: true
}


export default function BusinessProfilePage() {
    const { register, getValues, setValue, watch, handleSubmit } = useForm({
        defaultValues: {
            full_name: businessProfileData.full_name,
            tax_id: businessProfileData.tax_id,
            business_name: businessProfileData.business_name,
            contact_email: businessProfileData.contact_email,
            contact_phone: businessProfileData.contact_phone,
            description: businessProfileData.description
        }
    })
    return (
        <>
             
           
              <main className={`mt-6 `}>
               
                <form className="vendor_settings_content ml-70   rounded-2xl border-gray-300 p-6 bg-white  border-2 " onSubmit={handleSubmit((data) => {
                    console.log(data);
                })}>
                    <h2 className="text-2xl font-bold mb-4">Business Profile</h2>
                    <section className="space-y-5">
                        <span className="flex  gap-12 justify-between">
                            <div className="flex-1">
                                <label className="block text-gray-700 mb-2 font-bold">Full Name</label>
                                <input type="text" className="w-full border border-gray-300 rounded-lg py-2 px-4" placeholder="Enter full name"   {...register('full_name')} />
                            </div>
                         <div className="flex-1">
                                <label className="block text-gray-700 mb-2 font-bold">Business Name</label>
                                <input type="text" className="w-full border border-gray-300 rounded-lg py-2 px-4" placeholder="Enter business name" {...register('business_name')} />
                            </div>
                        </span>
                       <span className="flex  gap-12 justify-between">
                            <div className="flex-1">
                                <label className="block text-gray-700 mb-2 font-bold">Contact Email</label>
                                <input type="email" className="w-full border border-gray-300 rounded-lg py-2 px-4" placeholder="Enter contact email" {...register('contact_email')} />
                            </div>
                            <div className="flex-1">
                                <label className="block text-gray-700 mb-2 font-bold">Contact Phone</label>
                                <input type="tel" className="w-full border border-gray-300 rounded-lg py-2 px-4" placeholder="Enter contact phone" {...register('contact_phone')} />
                            </div>
                        </span>
                        <div>
                            <label className="block text-gray-700 mb-2 font-bold">Description</label>
                            <textarea className="w-full border border-gray-300 rounded-lg py-2 px-4" placeholder="Enter business description" {...register('description')}></textarea>
                        </div>
                    </section>
                    <div className="mt-6">
                        <button type="submit" className="px-6 py-2 bg-blue-500 text-white font-medium rounded-xl">Save Changes</button>
                    </div>

                </form>

            </main>

        </>
    )
}
