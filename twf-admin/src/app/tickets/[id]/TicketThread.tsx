"use client";

import { useState } from "react";


import { createClient } from "@supabase/supabase-js";

// Initialize client side (expose env vars if needed or hardcode for now as shown in logs)
const supabaseUrl = 'https://ftnkpsaxxdbdnrkxtvkt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0bmtwc2F4eGRiZG5ya3h0dmt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5OTE3OTgsImV4cCI6MjA4NDU2Nzc5OH0.mCEbcvs0gucOC2IBoYxS8CLAWfwDVDRdsaiD8G4dWrs';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function TicketThread({ ticket }: { ticket: any }) {
    const [messages, setMessages] = useState<any[]>(ticket.messages || []);
    const [reply, setReply] = useState("");
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState(ticket.status);

    const handleSend = async () => {
        if (!reply.trim()) return;
        setSending(true);

        const newMessage = {
            sender: "Admin",
            text: reply,
            timestamp: new Date().toISOString()
        };

        const updatedMessages = [...messages, newMessage];

        const { error } = await supabase
            .from("tickets")
            .update({
                messages: updatedMessages,
                updated_at: new Date().toISOString(),
                // optionally update status if needed
            })
            .eq("id", ticket.id);

        if (!error) {
            setMessages(updatedMessages);
            setReply("");
        } else {
            alert("Failed to send reply");
        }
        setSending(false);
    };

    const handleStatusChange = async (newStatus: string) => {
        const { error } = await supabase
            .from("tickets")
            .update({ status: newStatus })
            .eq("id", ticket.id);

        if (!error) {
            setStatus(newStatus);
        }
    };

    return (
        <div className="flex flex-col h-[600px]">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                {messages.map((msg: any, idx: number) => {
                    const isAdmin = msg.sender === 'Admin';
                    return (
                        <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-3 rounded-2xl shadow-sm ${isAdmin
                                ? 'bg-emerald-600 text-white rounded-br-none'
                                : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                                }`}>
                                <p className="text-sm">{msg.text}</p>
                                <p suppressHydrationWarning className={`text-[10px] mt-1 text-right ${isAdmin ? 'text-emerald-100' : 'text-slate-400'}`}>
                                    {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-200">
                <div className="flex gap-2 mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest pt-2">Ticket Status:</span>
                    <select
                        value={status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="text-xs font-bold border-none bg-slate-100 rounded-lg px-2 py-1 outline-none cursor-pointer hover:bg-slate-200"
                    >
                        <option value="Open">Open</option>
                        <option value="Pending">Pending</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                    </select>
                </div>
                <div className="flex gap-3">
                    <textarea
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                        placeholder="Type your reply..."
                        rows={2}
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        disabled={status === 'Closed'}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!reply.trim() || sending || status === 'Closed'}
                        className="bg-emerald-600 text-white px-6 rounded-xl font-bold text-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-emerald-200"
                    >
                        {sending ? '...' : 'Send'}
                    </button>
                </div>
            </div>
        </div>
    );
}
