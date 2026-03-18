'use client';
import { ContactList, ContactPageContent } from "@/constants/customer";
import { DynamicIcon, IconName } from "lucide-react/dynamic";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function Contact() {
    const { register, reset, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            message: ''
        }
    });
    const [copied, setCopied] = useState(false);
    const onclickCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
    const onSubmit = (data: any) => {
        try {
            console.log("Form Data:", data);

            reset();
        } catch (error) {
            console.error("Error submitting form:", error);
            console.log('form error ', errors)

        }
    };
    return (
        <>
            <span>
                {copied && <div className=" absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-md z-50">
                    Copied to clipboard!
                </div>}
            </span>
            <section className={`flex flex-col gap-4 items-center justify-center text-center py-20 relative bg-cover bg-center bg-no-repeat`} style={{ backgroundImage: `url(${ContactPageContent.heroImg})` }}>

                <h2 className='text-2xl font-medium text-primary '>{ContactPageContent.heroTitle}</h2>
                <h1 className="text-4xl font-bold text-primary">{ContactPageContent.heroDesc}</h1>
            </section>
            <section className="w-full mt-6 mb-8 mx-auto  " >
                <div className="flex  items-start justify-center mx-auto gap-16 flex-wrap   ">
                    <div className=" " >
                        <h1 className="font-bold text-2xl mb-4">Message Your Problem</h1>
                        <span className="mt-6 flex flex-col justify-center items-start gap-6 px-6">

                            {
                                ContactList.map(contact => (


                                    <div onClick={() => onclickCopy(contact.description)} className="flex justify-center items-center gap-4 cursor-pointer " key={contact.id} >
                                        <span className="border-2 border-gray-400 rounded-full p-2 ">
                                            <DynamicIcon name={contact.icon as IconName} />
                                        </span>
                                        <span className="flex flex-col">
                                            <p className="font-bold">
                                                {contact.title}
                                            </p>
                                            <p>
                                                {contact.description}
                                            </p>
                                        </span>
                                    </div>
                                ))
                            }

                        </span>
                    </div>

                    <form className="flex flex-col gap-4 border-2 border-gray-300 rounded-lg px-6 py-6 lg:min-w-[24rem] sm:min-w-full" onSubmit={handleSubmit(onSubmit)}>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="name">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input {...register("name")} type="text" placeholder="Your Name" className="border-2 border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="email">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input {...register("email")} type="email" placeholder="Your Email" className="border-2 border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="phone">
                                Phone <span className="text-red-500">*</span>
                            </label>
                            <input {...register("phone")} type="tel" placeholder="Your Phone Number" className="border-2 border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="message">
                                Message <span className="text-red-500">*</span>
                            </label>
                            <textarea {...register("message")} placeholder="Your Message" className="border-2 border-gray-300 rounded-lg py-2 px-3 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                        </div>
                        <input type="submit" className=" text-primary px-6 py-3 rounded-lg bg-primary-foreground hover:scale-105 transition-transform" value="Send Message" />
                    </form>
                </div>
            </section>
        </>
    )
}