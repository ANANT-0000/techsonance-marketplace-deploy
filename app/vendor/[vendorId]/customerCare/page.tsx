"use client"
import Navbar from "@/components/vendor/Navbar";
import { useState } from "react";
import { Pagination } from "@/components/common/Pagination";
import { DotIcon } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { CUSTOMER_TICKET_DATA } from "@/constants/vendor";

export default function CustomerCarePage() {
    const { handleSubmit, register, setValue, formState: { errors } } = useForm({
        defaultValues: {
            subject: '',
            description: '',
            priority: 'Medium',
            attachment: null
        }
    })
    const [count, setCount] = useState(1);
    const pageSize = 2;
    const totalPages = Math.ceil(CUSTOMER_TICKET_DATA.length / pageSize);
    const startIndex = (count - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentData = CUSTOMER_TICKET_DATA.slice(startIndex, endIndex);

    const onSubmit = (data: any) => {
        console.log('customer care form data:', data)
        setValue('subject', '')
        setValue('description', '')
        setValue('priority', 'Medium')
        setValue('attachment', null);
    }

    return (
        <>
            <Navbar title={"Customer Care"} />
            <main>
                <section>
                    <div className="support_tickets_container my-6">
                        {currentData.map((ticket) => (
                            <div key={ticket.id} className={`support_ticket_card flex justify-between border-l-10 rounded-l-2xl border border-gray-300 rounded-lg p-4 mb-4 shadow-sm ${ticket.status === 'Open' ? 'border-l-red-500' : ticket.status === 'In Progress' ? 'border-l-yellow-500' : ticket.status === 'Resolved' ? 'border-l-green-500' : 'border-l-gray-500'}`}>
                                <div className="flex flex-col justify-between mb-2">
                                    <h2 className="font-semibold text-lg">{ticket.subject}</h2>
                                    <p className="text-gray-600 mb-1"><strong>Description:</strong> {ticket.description}</p>
                                    <div className="flex">
                                        <p className="text-gray-600"><strong>Ticket </strong> {ticket.ticket_number}</p> <DotIcon /> <p className="text-gray-600"><strong>Created </strong> {ticket.created}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col justify-between">
                                    <span className={`px-3 py-2 text-center rounded-full text-sm font-medium ${ticket.status === 'Open' ? 'bg-red-200 text-red-800' : ticket.status === 'In Progress' ? 'bg-yellow-200 text-yellow-800' : ticket.status === 'Resolved' ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                                        {ticket.status}
                                    </span>
                                    <Link href={'/viewConversation'} className="text-blue-500">
                                        View Conversation
                                    </Link>
                                </div>
                            </div>
                        ))}
                        <div className="flex justify-between items-top">
                            <p className="text-gray-500">show ticket {currentData.length} of {CUSTOMER_TICKET_DATA.length}</p>
                            <Pagination setCount={setCount} count={count} totalPages={totalPages} style={''} />
                        </div>
                    </div>
                </section>
                <form className="border-2 border-gray-300 rounded-lg p-4 my-6" onSubmit={handleSubmit(onSubmit)}>
                    <h1 className="text-xl font-bold mb-6">Create New Ticket </h1>
                    <div className="flex flex-col gap-2 mb-4">
                        <label htmlFor="subject">Subject</label>
                        <input type="text" id="subject" className="w-full border border-gray-300 rounded-lg p-2" {...register('subject', { required: 'subject is required' })} />
                        {errors.subject && <p className="text-red-500 text-sm">{errors.subject.message}</p>}
                    </div>
                    <div className="flex flex-col gap-2 mb-4">
                        <label htmlFor="description">Description</label>
                        <textarea id="description" rows={4} className="w-full border border-gray-300 rounded-lg p-2" {...register('description', { required: 'description is required' })}></textarea>
                        {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
                    </div>
                    <div className="flex flex-col gap-2 mb-4">
                        <label htmlFor="priority">Priority</label>
                        <select id="priority" className="w-full border border-gray-300 rounded-lg p-2" {...register('priority', { required: 'select priority' })}>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                        {errors.priority && <p className="text-red-500 text-sm">{errors.priority.message}</p>}
                    </div>
                    <div className="flex flex-col gap-2 mb-4">
                        <label htmlFor="attachment">Attachment</label>
                        <input type="file" id="attachment" className="w-full border border-gray-300 rounded-lg p-2" {...register('attachment', { required: false })} />
                        {errors.attachment && <p className="text-red-500 text-sm">{errors.attachment.message}</p>}
                    </div>
                    <input type="submit" value="Create Ticket" className="bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer" />
                </form>
            </main>
        </>
    )
}
