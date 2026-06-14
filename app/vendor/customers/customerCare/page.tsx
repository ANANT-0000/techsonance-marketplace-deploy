"use client";
import Navbar from "@/components/vendor/Navbar";
import { useEffect, useState } from "react";
import { Pagination } from "@/components/common/Pagination";
import { DotIcon, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TicketFormData, ticketSchema } from "@/utils/validation";
import AxiosAPI from "@/lib/axios";
import { CustomerTicket, CustomerTicketStatus, CustomerTicketPriority } from "@/utils/Types";
import { CUSTOMER_CARE_TEXT } from "@/constants/vendorText";

const fetchCustomerTickets = async () => {
  const res = await AxiosAPI.get("/v1/customer-tickets");
  return res.data;
};

export default function CustomerCarePage() {
  
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    mode: "onBlur",
    defaultValues: {
      subject: "",
      description: "",
      priority: CustomerTicketPriority.MEDIUM,
      attachment: null,
    },
  });
  const [customerTickets, setCustomerTickets] = useState<CustomerTicket[]>([]);
  // Pagination Logic
  const [count, setCount] = useState(1);
  const pageSize = 2;
  const totalPages = Math.ceil(customerTickets.length / pageSize);
  const startIndex = (count - 1) * pageSize;
  const currentData = customerTickets.slice(startIndex, startIndex + pageSize);
  const getCustomerTickets = async () => {
    const data = await fetchCustomerTickets();
    setCustomerTickets(data);
  };
  useEffect(() => {
    getCustomerTickets();
  }, []);
  const onSubmit = (data: TicketFormData) => {
    // Add your API call here
    reset(); // Clears everything back to defaultValues
  };

  return (
    <>
      <Navbar title={CUSTOMER_CARE_TEXT.TITLE} />
      <main className="max-w-4xl mx-auto px-4">
        <section>
          <div className="support_tickets_container my-6">
            {currentData.map((ticket) => (
              <div
                key={ticket.id}
                className={`support_ticket_card flex justify-between border-l-[10px] border border-gray-300 rounded-lg p-4 mb-4 shadow-sm ${
                  ticket.status === CustomerTicketStatus.OPEN
                    ? "border-l-red-500"
                    : ticket.status === CustomerTicketStatus.IN_PROGRESS
                      ? "border-l-yellow-500"
                      : "border-l-green-500"
                }`}
              >
                <div className="flex flex-col justify-between">
                  <h2 className="font-semibold text-theme-h6">
                    {ticket.subject}
                  </h2>
                  <p className="text-theme-body-sm text-gray-600 mb-1">
                    {ticket.description}
                  </p>
                  <div className="flex items-center text-theme-caption text-gray-400">
                    <span>Ticket #{ticket.ticket_number}</span>
                    <DotIcon size={16} />
                    <span>Created {ticket.created}</span>
                  </div>
                </div>
                <div className="flex flex-col justify-between items-end">
                  <span
                    className={`px-3 py-1 rounded-full text-theme-caption font-bold ${
                      ticket.status === CustomerTicketStatus.OPEN
                        ? "bg-red-100 text-red-700"
                        : ticket.status === CustomerTicketStatus.IN_PROGRESS
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                    }`}
                  >
                    {ticket.status}
                  </span>
                  <Link
                    href={"/viewConversation"}
                    className="text-blue-500 text-theme-body-sm hover:underline"
                  >
                    {CUSTOMER_CARE_TEXT.VIEW_CONVERSATION}
                  </Link>
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center mt-4">
              <p className="text-theme-body-sm text-gray-500">
                {CUSTOMER_CARE_TEXT.SHOWING_TICKETS.replace("{count}", String(currentData.length)).replace("{total}", String(customerTickets.length))}
              </p>
              <Pagination
                setCount={setCount}
                count={count}
                totalPages={totalPages}
                style={""}
              />
            </div>
          </div>
        </section>

        <form
          className="border-2 border-gray-200 rounded-2xl p-6 my-10 bg-white shadow-sm"
          onSubmit={handleSubmit(onSubmit)}
        >
          <h1 className="text-theme-h5 font-bold mb-6 text-gray-800">
            {CUSTOMER_CARE_TEXT.CREATE_NEW_TICKET}
          </h1>

          <div className="grid grid-cols-1 gap-5">
            {/* Subject */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="subject"
                className="text-theme-body-sm font-semibold text-gray-700"
              >
                {CUSTOMER_CARE_TEXT.SUBJECT}
              </label>
              <input
                type="text"
                id="subject"
                {...register("subject")}
                className={`border p-2.5 rounded-xl outline-none focus:ring-2 transition-all ${
                  errors.subject
                    ? "border-red-400 focus:ring-red-500/10"
                    : "border-gray-300 focus:ring-blue-500/10"
                }`}
              />
              {errors.subject && (
                <p className="text-red-500 text-theme-caption mt-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.subject.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="description"
                className="text-theme-body-sm font-semibold text-gray-700"
              >
                {CUSTOMER_CARE_TEXT.DESCRIPTION}
              </label>
              <textarea
                id="description"
                rows={4}
                {...register("description")}
                className={`border p-2.5 rounded-xl outline-none focus:ring-2 transition-all ${
                  errors.description
                    ? "border-red-400 focus:ring-red-500/10"
                    : "border-gray-300 focus:ring-blue-500/10"
                }`}
              ></textarea>
              {errors.description && (
                <p className="text-red-500 text-theme-caption mt-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Priority */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="priority"
                  className="text-theme-body-sm font-semibold text-gray-700"
                >
                  {CUSTOMER_CARE_TEXT.PRIORITY}
                </label>
                <select
                  id="priority"
                  {...register("priority")}
                  className="border border-gray-300 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10"
                >
                  <option value={CustomerTicketPriority.HIGH}>
                    {CUSTOMER_CARE_TEXT.PRIORITY_OPTIONS.HIGH}
                  </option>
                  <option value={CustomerTicketPriority.MEDIUM}>
                    {CUSTOMER_CARE_TEXT.PRIORITY_OPTIONS.MEDIUM}
                  </option>
                  <option value={CustomerTicketPriority.LOW}>
                    {CUSTOMER_CARE_TEXT.PRIORITY_OPTIONS.LOW}
                  </option>
                </select>
                {errors.priority && (
                  <p className="text-red-500 text-theme-caption mt-1">
                    {errors.priority.message}
                  </p>
                )}
              </div>

              {/* Attachment */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="attachment"
                  className="text-theme-body-sm font-semibold text-gray-700"
                >
                  {CUSTOMER_CARE_TEXT.ATTACHMENT}
                </label>
                <input
                  type="file"
                  id="attachment"
                  {...register("attachment")}
                  className="text-theme-body-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-theme-body-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all"
                />
                {errors.attachment && (
                  <p className="text-red-500 text-theme-caption mt-1">
                    {errors.attachment.message as string}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200 disabled:opacity-50 mt-2"
            >
              {isSubmitting ? CUSTOMER_CARE_TEXT.CREATING : CUSTOMER_CARE_TEXT.CREATE_TICKET}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
