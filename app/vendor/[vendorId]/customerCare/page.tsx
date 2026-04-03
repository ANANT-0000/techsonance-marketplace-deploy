"use client"
import Navbar from "@/components/vendor/Navbar";
import { useState } from "react";
import { Pagination } from "@/components/common/Pagination";
import { DotIcon, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CUSTOMER_TICKET_DATA } from "@/constants/vendor";
import { ticketSchema, TicketFormData } from "@/utils/validation";

export default function CustomerCarePage() {
    const {
        handleSubmit,
        register,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<TicketFormData>({
        resolver: zodResolver(ticketSchema),
        mode: "onBlur",
        defaultValues: {
            subject: '',
            description: '',
            priority: 'Medium',
            attachment: null
        }
    });

    // Pagination Logic
    const [count, setCount] = useState(1);
    const pageSize = 2;
    const totalPages = Math.ceil(CUSTOMER_TICKET_DATA.length / pageSize);
    const startIndex = (count - 1) * pageSize;
    const currentData = CUSTOMER_TICKET_DATA.slice(startIndex, startIndex + pageSize);

    const onSubmit = (data: TicketFormData) => {
        console.log('Customer care form data:', data);
        // Add your API call here
        reset(); // Clears everything back to defaultValues
    };

    return (
        <>
            <Navbar title={"Customer Care"} />
            <main className="max-w-4xl mx-auto px-4">
                <section>
                    <div className="support_tickets_container my-6">
                        {currentData.map((ticket) => (
                            <div
                                key={ticket.id}
                                className={`support_ticket_card flex justify-between border-l-[10px] border border-gray-300 rounded-lg p-4 mb-4 shadow-sm ${ticket.status === 'Open' ? 'border-l-red-500' :
                                        ticket.status === 'In Progress' ? 'border-l-yellow-500' :
                                            'border-l-green-500'
                                    }`}
                            >
                                <div className="flex flex-col justify-between">
                                    <h2 className="font-semibold text-lg">{ticket.subject}</h2>
                                    <p className="text-sm text-gray-600 mb-1">{ticket.description}</p>
                                    <div className="flex items-center text-xs text-gray-400">
                                        <span>Ticket #{ticket.ticket_number}</span>
                                        <DotIcon size={16} />
                                        <span>Created {ticket.created}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col justify-between items-end">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${ticket.status === 'Open' ? 'bg-red-100 text-red-700' :
                                            ticket.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-green-100 text-green-700'
                                        }`}>
                                        {ticket.status}
                                    </span>
                                    <Link href={'/viewConversation'} className="text-blue-500 text-sm hover:underline">
                                        View Conversation
                                    </Link>
                                </div>
                            </div>
                        ))}

                        <div className="flex justify-between items-center mt-4">
                            <p className="text-sm text-gray-500">Showing {currentData.length} of {CUSTOMER_TICKET_DATA.length} tickets</p>
                            <Pagination setCount={setCount} count={count} totalPages={totalPages} style={''} />
                        </div>
                    </div>
                </section>

                <form className="border-2 border-gray-200 rounded-2xl p-6 my-10 bg-white shadow-sm" onSubmit={handleSubmit(onSubmit)}>
                    <h1 className="text-xl font-bold mb-6 text-gray-800">Create New Ticket</h1>

                    <div className="grid grid-cols-1 gap-5">
                        {/* Subject */}
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="subject" className="text-sm font-semibold text-gray-700">Subject</label>
                            <input
                                type="text"
                                id="subject"
                                {...register('subject')}
                                className={`border p-2.5 rounded-xl outline-none focus:ring-2 transition-all ${errors.subject ? "border-red-400 focus:ring-red-500/10" : "border-gray-300 focus:ring-blue-500/10"
                                    }`}
                            />
                            {errors.subject && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.subject.message}</p>}
                        </div>

                        {/* Description */}
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="description" className="text-sm font-semibold text-gray-700">Description</label>
                            <textarea
                                id="description"
                                rows={4}
                                {...register('description')}
                                className={`border p-2.5 rounded-xl outline-none focus:ring-2 transition-all ${errors.description ? "border-red-400 focus:ring-red-500/10" : "border-gray-300 focus:ring-blue-500/10"
                                    }`}
                            ></textarea>
                            {errors.description && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.description.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Priority */}
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="priority" className="text-sm font-semibold text-gray-700">Priority</label>
                                <select
                                    id="priority"
                                    {...register('priority')}
                                    className="border border-gray-300 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10"
                                >
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                                {errors.priority && <p className="text-red-500 text-xs mt-1">{errors.priority.message}</p>}
                            </div>

                            {/* Attachment */}
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="attachment" className="text-sm font-semibold text-gray-700">Attachment (Optional)</label>
                                <input
                                    type="file"
                                    id="attachment"
                                    {...register('attachment')}
                                    className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all"
                                />
                                {errors.attachment && <p className="text-red-500 text-xs mt-1">{errors.attachment.message as string}</p>}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200 disabled:opacity-50 mt-2"
                        >
                            {isSubmitting ? "Creating..." : "Create Ticket"}
                        </button>
                    </div>
                </form>
            </main>
        </>
    )
}