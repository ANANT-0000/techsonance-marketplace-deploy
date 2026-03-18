'use client';
import { useForm } from 'react-hook-form';
import { Dot, Edit, Landmark } from 'lucide-react';
import { useEffect, useState } from 'react';


interface InvoiceSettings {
    gstin: string;              // GSTIN number
    pan: string;                // PAN number
    businessName: string;       // Registered business name
    prefix: string;             // Invoice prefix (e.g., "INV")
    year: number;               // Invoice year (e.g., 2026)
    startSequence: number;      // Starting sequence number
    preview: string | null;            // Example preview (e.g., "INV-2026-00001")
    signatureUrl?: string | undefined;      // Optional signature image path
    termsAndNotes?: string;     // Optional invoice notes
}
interface BankAccount {
    bankName: string;
    accountNumber: string;
    ifsc: string;
    primary: boolean;
}
const invoiceSettings: InvoiceSettings = { gstin: "24ABCDE1234F1Z5", pan: "ABCDE1234F", businessName: "TechWorld Innovations Pvt Ltd", prefix: "INV", year: 2026, startSequence: 467, preview: "INV-2026-00001", signatureUrl: undefined, termsAndNotes: "Thank you for your business. Goods once sold will not be taken back. Authorized Signature" };
const bankAccounts: BankAccount[] = [{ bankName: "HDFC Bank", accountNumber: "XXXX-XXXX-8821", ifsc: "HDFC0001234", primary: true }];

export default function BillingAndBankingPage() {
    const { register, getValues, setValue, watch, handleSubmit } = useForm({
        defaultValues: invoiceSettings
    })
    const [signatureUrl, setSignatureUrl] = useState<string | undefined>();
        ;
    useEffect(() => {
        if (signatureUrl && signatureUrl.length > 0) {
            const file = signatureUrl[0];
            // Suppose 'file' comes from an <input type="file" />
            if (file instanceof Blob) {
                const objectUrl = URL.createObjectURL(file);
                setSignatureUrl(objectUrl);
            } else {
                console.error("Invalid file provided to createObjectURL");
            }


        }
    }, [signatureUrl]);
    return (
        <>


            <main className={`mt-6 `}>
               
                <form className="vendor_settings_content ml-70   " onSubmit={handleSubmit((data) => {
                    console.log(data);
                })}>

                    <section className='py-6 px-6 border-2 border-gray-200   gap-6 rounded-2xl mb-6'>
                        <header className='flex justify-between items-center'>
                            <span>
                                <h1 className='text-2xl font-bold'>Tax Identity</h1>
                                <p className='text-sm text-gray-500'>Manage your GSTIN and PAN details.</p>
                            </span>
                            {invoiceSettings.gstin && (
                                <div className='bg-green-50 border-2 rounded-2xl font-bold border-green-500 text-green-500 py-2 px-6'>
                                    Active (Regular)
                                </div>
                            )}
                        </header>
                        <span className='flex gap-12 my-6'>
                            <div className='flex-1 flex flex-col '>
                                <label htmlFor="gstin">GSTIN Number</label>
                                <input type="text" defaultValue={watch("gstin")} id="gstin" className='form_input mt-2' {...register("gstin")} />
                            </div>
                            <div className='flex-1 flex flex-col  '>
                                <label htmlFor="pan">PAN Number</label>
                                <input type="text" defaultValue={watch("pan")} id="pan" className='form_input mt-2' {...register("pan")} />
                            </div>
                        </span>

                        <div className='flex flex-col  '>
                            <label htmlFor="businessName">Registered Business Name</label>
                            <input type="text" defaultValue={watch("businessName")} id="businessName" className='form_input mt-2' {...register("businessName")} />
                        </div>


                    </section>
                    <section className='py-6 px-6 border-2 border-gray-200   gap-6 rounded-2xl my-6 '>
                        <header className='flex justify-between items-center'>

                            <h1 className='text-2xl font-bold'>Invoice Customization</h1>
                        </header>

                        <span className='flex justify-between gap-12'>


                            <div className='my-6 flex flex-col gap-2 flex-1'>
                                <label className='font-bold' htmlFor="invoice prefix">Invoice Prefix</label>
                                <span className='flex'>
                                    <input type="text" defaultValue={watch("prefix")} id="invoice prefix" className='form_input   rounded-r-none pl-4 ' {...register("prefix")} />
                                    <span className='form_input text-2xl rounded-none text-gray-500 border-2 border-gray-300 px-2 py-2    text-center w-24'>-</span>
                                    <select id="" className='form_input  rounded-l-none  w-full' {...register("year")}  >
                                        <option selected={watch("year") === 2023}>2023</option>
                                        <option selected={watch("year") === 2024}>2024</option>
                                        <option selected={watch("year") === 2025}>2025</option>
                                        <option selected={watch("year") === 2026}>2026</option>
                                    </select>
                                </span>
                                <p className='text-gray-500'>Preview: {watch("prefix")}-{watch("year")}</p>
                            </div>
                            <div className='my-6 flex flex-col gap-2 flex-1 w-full '>
                                <label className='font-bold' htmlFor="start sequence">Starting Sequence Number</label>
                                <input type="number" defaultValue={watch("startSequence")} id="start sequence" className='form_input mt-3 w-full ' {...register("startSequence")} />
                            </div>
                        </span>
                        <div className='flex flex-col gap-2 my-6 '>

                            <h1 className='mb-6'>Authorized Signature</h1>
                            <div className='flex items-start gap-6'>
                                {signatureUrl ?

                                    <img src={signatureUrl} alt="Authorized Signature" className='min-w-24 max-w-48 max-h-32 min-h-36 object-cover rounded-2xl' />
                                    : <label htmlFor="Authorized Signature" className='w-28 h-20  font-medium text-gray-500 min-w-24 max-w-48 max-h-32 min-h-18  border-2 border-gray-300 rounded-2xl text-center p-6'>Signature
                                        <input type="file" id="Authorized Signature" className='form_input mt-2 hidden  ' onChange={(e) => setSignatureUrl(e.target.files)} />
                                    </label>
                                }
                                <div>


                                    {
                                        signatureUrl ?
                                            <>
                                                <button className='py-2 px-4 border-2 border-red-300 b g-red-100 text-red-700 rounded-lg ' onClick={() => { setSignatureUrl(undefined); setValue("signatureUrl", undefined) }}>Remove Signature</button>
                                            </> :
                                            <>
                                                <p className='text-sm text-gray-500 mt-2'>Upload an image of the authorized signature to be displayed on your invoices.</p>
                                            </>
                                    }
                                </div>

                            </div>
                        </div>
                        <div className='my-6 flex flex-col gap-2 '>
                            <label htmlFor="terms and notes" className='font-bold'>Invoice Terms & Notes</label>
                            <textarea id="terms and notes" rows={4} className='form_input mt-2 w-full ' {...register("termsAndNotes")}>{watch("termsAndNotes")}</textarea>

                        </div>
                        <div className='align-right mt-6 flex justify-end'>
                            <input type="submit" defaultValue={'Save Changes'} className='py-2 px-4 bg-blue-500 text-white rounded-lg hover:border-blue-300' />
                        </div>
                    </section>
                    <section className=' border-2 border-gray-300 rounded-2xl p-6 my-6 '>

                        <header className='flex justify-between items-center mb-6'>
                            <span>
                                <h1 className='text-2xl font-bold'>Bank Accounts</h1>
                                <p className='text-sm text-gray-500'>Manage your bank accounts for payouts.</p>
                            </span>
                            <button className='py-2 px-4  bg-blue-500 text-white rounded-lg' >+ Add Account</button>
                        </header>
                        {
                            bankAccounts.map((account, index) => (

                                <div key={index} className={`flex justify-between items-center  border-2  ${account.primary ? 'border-blue-500 ' : 'border-gray-300'} px-6 py-6 mb-4 rounded-lg`}>
                                    <span className='flex items-center gap-2'>

                                        <span className='p-2 border-2 border-blue-300 bg-blue-50 rounded-lg inline-block'>

                                            <Landmark className='text-blue-500' />
                                        </span>

                                        <div className='mx-1'>
                                            <h2 className="text-xl font-bold ">{account.bankName}</h2>
                                            <p className="flex text-gray-500"> {account.accountNumber} <Dot />
                                                IFSC: {account.ifsc}</p>
                                        </div>
                                    </span>
                                    <span className='flex items-center align-middle gap-4'>


                                        {account.primary && (
                                            <p className="py-2 px-4 rounded-xl text-sm font-medium text-green-600  border-green-500 bg-green-100  inline-block">Primary Account</p>
                                        )}

                                        <button className=" "><Edit /> </button>
                                    </span>
                                </div>
                            )
                            )
                        }
                    </section>


                </form>
            </main>
        </>
    )
}
