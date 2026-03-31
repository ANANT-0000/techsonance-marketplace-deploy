import {type TicketMessage } from "@/constants";

export const MessageBubble = ({ message }: { message: TicketMessage }) => {
    const isVendor = message.type === "vendor";

    return (
        <div className={`message_bubble_container w-full flex my-4 px-10 ${isVendor ? 'justify-start' : 'justify-end'}`}>
            <div>
                <div className={`message_bubble rounded-2xl py-6 px-8 max-w-xl min-w-md ${isVendor ? 'bg-gray-200 float-left text-black rounded-tl-none' : 'bg-blue-100 text-black rounded-tr-none float-right'}`}>
                    <div className="message_header flex items-center mb-2 justify-between">
                        <p><span className="font-bold">{message.sender}</span></p>
                        <p className="text-sm text-gray-600">{message.time}</p>
                    </div>
                    <p className="text-balance font-medium">{message.text}</p>
                </div>
            </div>
        </div>
    );
};