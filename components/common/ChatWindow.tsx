import { SendHorizontal } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { SupportTicketType, TicketMessage } from "@/constants";
import { useEffect, useState } from "react";

export const ChatWindow = ({ ticket }: { ticket: SupportTicketType }) => {
    const [inputText, setInputText] = useState("");
    const [messages, setMessages] = useState(ticket.messages || []);

    useEffect(() => {
        setMessages(ticket.messages || []);
    }, [ticket]);

    const handleSend = () => {
        if (!inputText.trim()) return;
        const newMessage: TicketMessage = {
            id: Date.now(),
            sender: "You",
            role: "Super Admin",
            text: inputText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: "super_admin",
        };
        setMessages([...messages, newMessage]);
        setInputText("");
    };

    return (
        <section className="w-full">
            <div className="chat_window_header bg-gray-100 flex justify-between items-center px-6 py-4 pb-6 border-b-4 border-gray-100">
                <span>
                    <h1 className="text-lg font-bold">{ticket.title}</h1>
                    <p className="text-sm text-gray-500">{ticket.company} - {ticket.email}</p>
                </span>
                <div className="chat_window_header_right flex items-center gap-4 md:flex-wrap sm:flex-wrap">
                    <button className="sm:py-2 px-4 bg-green-100 border-2 border-green-500 rounded-xl text-green-600 font-bold">Mark Resolved</button>
                    <button className={`py-2 px-4 bg-red-100 border-2 ${ticket.status === 'active' ? 'border-red-500 text-red-500' : 'border-gray-300 text-gray-500'} font-bold rounded-xl`}>Close Ticket</button>
                </div>
            </div>
            {messages.map((message, index) => (
                <MessageBubble message={message} key={index} />
            ))}
            <div className="chat_input_container bg-gray-100 flex w-full border-t-2 border-gray-200 px-6 py-4 items-center gap-4">
                <input type="text" placeholder="Type your reply here..." onChange={(e) => setInputText(e.target.value)} value={inputText} onKeyDown={(e) => e.key === 'Enter' && handleSend()} className="form_input flex-1" />
                <button onClick={handleSend} className="form_input bg-blue-500 text-white py-2 px-4 rounded-xl flex items-center gap-2">Send <SendHorizontal size={40} strokeWidth={3} absoluteStrokeWidth /></button>
            </div>
        </section>
    );
};