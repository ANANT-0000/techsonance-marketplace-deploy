"use client";
import { ContactList, ContactPageContent } from "@/constants/customer";
import { ContactFormData, contactSchema } from "@/utils/validation";
import { zodResolver } from "@hookform/resolvers/zod";

import { DynamicIcon, IconName } from "lucide-react/dynamic";
import { useState } from "react";
import { useForm } from "react-hook-form";

export const CONTACT_FORM_FIELDS = [
  {
    id: "name",
    label: "Name",
    placeholder: "Your Name",
    type: "text",
  },
  {
    id: "email",
    label: "Email",
    placeholder: "Your Email",
    type: "email",
  },
  {
    id: "phone",
    label: "Phone",
    placeholder: "Your Phone Number",
    type: "tel",
  },

  {
    id: "message",
    label: "Message",
    placeholder: "Your Message",
    type: "textarea",
  },
];
export default function Contact() {
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });
  const [copied, setCopied] = useState(false);
  const onclickCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const onSubmit = (data: ContactFormData) => {
    try {
      console.log("Form Data:", data);

      reset();
    } catch (error) {
      console.error("Error submitting form:", error);
      console.log("form error ", errors);
    }
  };
  return (
    <>
      <span>
        {copied && (
          <div className=" absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-md z-50">
            Copied to clipboard!
          </div>
        )}
      </span>
      <section
        className={`flex flex-col gap-4 items-center justify-center text-center py-20 relative bg-cover bg-center bg-no-repeat`}
        style={{ backgroundImage: `url(${ContactPageContent.heroImg})` }}
      >
        <h2 className="text-2xl font-medium text-primary ">
          {ContactPageContent.heroTitle}
        </h2>
        <h1 className="text-4xl font-bold text-primary">
          {ContactPageContent.heroDesc}
        </h1>
      </section>
      <section className="w-full mt-6 mb-8 mx-auto  ">
        <div className="flex  items-start justify-center mx-auto gap-16 flex-wrap   ">
          <div className=" ">
            <h1 className="font-bold text-2xl mb-4">Message Your Problem</h1>
            <span className="mt-6 flex flex-col justify-center items-start gap-6 px-6">
              {ContactList.map((contact) => (
                <div
                  onClick={() => onclickCopy(contact.description)}
                  className="flex justify-center items-center gap-4 cursor-pointer "
                  key={contact.id}
                >
                  <span className="border-2 border-gray-400 rounded-full p-2 ">
                    <DynamicIcon
                      name={contact.icon as IconName}
                      fallback={() => <p></p>}
                    />
                  </span>
                  <span className="flex flex-col">
                    <p className="font-bold">{contact.title}</p>
                    <p>{contact.description}</p>
                  </span>
                </div>
              ))}
            </span>
          </div>
          <form
            className="flex flex-col gap-4 border-2 border-gray-300 rounded-lg px-6 py-6 lg:min-w-[24rem] sm:min-w-full"
            onSubmit={handleSubmit(onSubmit)}
          >
            {CONTACT_FORM_FIELDS.map((field) => (
              <div className="flex flex-col gap-2" key={field.id}>
                <label htmlFor={field.id}>
                  {field.label} <span className="text-red-500">*</span>
                </label>
                {field.type === "textarea" ?
                  <textarea
                    {...register(field.id as keyof typeof register)}
                    placeholder={field.placeholder}
                    className="border-2 border-gray-300 rounded-lg py-2 px-3 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                : <input
                    {...register(field.id as keyof typeof register)}
                    type={field.type}
                    placeholder={field.placeholder}
                    className="border-2 border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                }
              </div>
            ))}
            <input
              type="submit"
              className=" text-primary px-6 py-3 rounded-lg bg-primary-foreground hover:scale-105 transition-transform"
              value="Send Message"
            />
          </form>
        </div>
      </section>
    </>
  );
}
