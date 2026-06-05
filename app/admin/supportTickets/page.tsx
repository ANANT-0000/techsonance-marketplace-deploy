'use client';

import { Navbar } from "@/components/admin/Navbar";
import { SUPPORT_TICKETS } from "@/constants/admin";
import { useState } from "react";
import { TicketList } from "@/components/common/TicketList";
import { ChatWindow } from "@/components/common/ChatWindow";

export default function SupportTicketsPage() {
    const [selectedTicket, setSelectedTicket] = useState(SUPPORT_TICKETS[0]);
    return (
        <>
            <Navbar title="Support Tickets" />
            <main className="flex">
                <TicketList tickets={SUPPORT_TICKETS} activeId={selectedTicket.id} onSelect={setSelectedTicket} />
                <ChatWindow ticket={selectedTicket} />
            </main>
        </>
    );
}
