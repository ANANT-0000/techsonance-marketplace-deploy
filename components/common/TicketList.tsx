import { SupportTicketType } from "@/constants";

export const TicketList = ({ tickets, onSelect, activeId }: { tickets: SupportTicketType[]; onSelect: (ticket: SupportTicketType) => void; activeId: string }) => {
    return (
        <section className="flex flex-col">
            <div className="header w-full flex flex-col bg-gray-100 pb-2 pt-4 pl-4 pr-2">
                <h1 className="font-bold">Active Tickets({tickets.length})</h1>
                <input type="search" className="form_input py-1" placeholder="Filter Status..." />
            </div>
            <div className="ticket_list_container pl-4">
                {tickets.map((ticket) => (
                    <div
                        key={ticket.id}
                        className={`ticket_card pl-4 my-1 py-2 pr-2 w-[300px] cursor-pointer ${activeId === ticket.id ? 'active_ticket_card border-l-4 border-l-green-500' : 'bg-gray-100 hover:bg-gray-200'}`}
                        onClick={() => onSelect(ticket)}
                    >
                        <div className="ticket_card_header flex justify-between items-center mb-2 text-sm">
                            <h2 className="ticket_title">{ticket.id}</h2>
                            <span className="ticket_time text-gray-500">{ticket.time}</span>
                        </div>
                        <p className="ticket_company">{ticket.title}</p>
                        <div className="ticket_status flex items-center gap-2 mt-2">
                            <span className={`status_indicator text-sm rounded-full h-2 w-2 shadow-md ${ticket.status === 'active' ? 'bg-green-500 shadow-green-500/50' : ticket.status === 'pending' ? 'bg-yellow-500 shadow-yellow-500/50' : 'bg-gray-500 shadow-gray-500/50'}`}></span>
                            <span className="status_text capitalize">{ticket.company}</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};
