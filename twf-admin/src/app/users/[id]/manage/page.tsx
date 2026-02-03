"use client";

import { useState, use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ManageUserPage({ params }: { params: Promise<{ id: string }> }) {
    // In a real app we'd fetch user here similarly or pass data
    // For now we assume ID context or re-fetch.
    // Client component for interactivity
    const { id } = use(params);
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('orders');

    return (
        <div className="max-w-6xl mx-auto py-8">
            <Link href={`/users/${id}`} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-600 mb-6 transition-colors">
                ← Back to Profile
            </Link>

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Manage Customer</h1>
                    <p className="text-slate-500 mt-1">Control panel for User ID: <span className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">{id}</span></p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Menu */}
                <div className="lg:col-span-1">
                    <nav className="flex flex-col gap-1 sticky top-6">
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'orders' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            🛍️ Orders
                        </button>
                        <button
                            onClick={() => setActiveTab('payments')}
                            className={`text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'payments' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            💳 Payments
                        </button>

                        <button
                            onClick={() => setActiveTab('support')}
                            className={`text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'support' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            💬 Support Tickets
                        </button>
                        <div className="my-2 border-t border-slate-100"></div>
                        <button className="text-left px-4 py-3 rounded-xl font-bold text-sm text-red-600 hover:bg-red-50 transition-colors">
                            🚫 Block User
                        </button>
                    </nav>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3">
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm min-h-[500px] p-6">

                        {activeTab === 'orders' && (
                            <OrdersView userId={id} />
                        )}

                        {activeTab === 'payments' && (
                            <PaymentsView />
                        )}

                        {activeTab === 'support' && (
                            <SupportView userId={id} />
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}

function OrdersView({ userId }: { userId: string }) {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch Orders
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch('/api/orders');
                if (res.ok) {
                    const allOrders = await res.json();

                    const userOrders = allOrders.filter((o: any) => o.userId === userId || o.userId === `user_${userId}` || o.userId === userId.replace('user_', ''));
                    setOrders(userOrders);
                }
            } catch (e) {
                console.error("Failed to fetch orders", e);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [userId]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900">Order History</h3>
                <div className="flex gap-2">
                    <select className="border border-slate-200 rounded-lg text-sm px-3 py-1.5 outline-none focus:border-slate-400">
                        <option>All Orders</option>
                        <option>Pending</option>
                        <option>Completed</option>
                    </select>
                </div>
            </div>

            <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
                        <tr>
                            <th className="px-4 py-3">Order ID</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {loading ? (
                            <tr><td colSpan={4} className="px-4 py-12 text-center text-slate-400">Loading orders...</td></tr>
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-12 text-center text-slate-400">
                                    No orders found for this user.
                                </td>
                            </tr>
                        ) : (
                            orders.map((order: any) => (
                                <tr key={order.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-mono text-slate-600">#{order.id.split('-')[1] || order.id}</td>
                                    <td className="px-4 py-3 text-slate-600">{new Date(order.date || order.created_at).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-xs font-bold 
                                            ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-slate-100 text-slate-700'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-slate-900">${order.totalAmount}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function PaymentsView() {
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900">Payment Methods & History</h3>
            <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                <p className="text-slate-500">No saved payment methods or transaction history.</p>
            </div>
        </div>
    );
}

function SupportView({ userId }: { userId: string }) {
    const [tickets, setTickets] = useState<any[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [reply, setReply] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchTickets = async () => {
        try {
            const res = await fetch(`/api/tickets?user_id=${userId}`);
            if (res.ok) {
                const data = await res.json();
                setTickets(data);
                // Refresh selected ticket if open
                if (selectedTicket) {
                    const updated = data.find((t: any) => t.id === selectedTicket.id);
                    if (updated) setSelectedTicket(updated);
                }
            }
        } catch (e) {
            console.error("Failed to fetch tickets", e);
        }
    };

    useEffect(() => {
        fetchTickets();
        const interval = setInterval(fetchTickets, 3000);
        return () => clearInterval(interval);
    }, [userId, selectedTicket?.id]);

    const handleSendReply = async () => {
        if (!reply.trim() || !selectedTicket) return;

        try {
            const res = await fetch(`/api/tickets/${selectedTicket.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: reply,
                    sender: 'Admin',
                    status: 'Open' // Admin reply usually means waiting for user, or remains Open
                })
            });

            if (res.ok) {
                setReply('');
                fetchTickets();
            }
        } catch (e) {
            alert("Failed to send reply");
        }
    };

    const handleCloseTicket = async () => {
        if (!selectedTicket) return;
        try {
            await fetch(`/api/tickets/${selectedTicket.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Closed' })
            });
            fetchTickets();
        } catch (e) {
            alert("Failed to close ticket");
        }
    };

    return (
        <div className="flex h-[600px] border rounded-xl overflow-hidden">
            {/* Ticket List */}
            <div className="w-1/3 border-r bg-slate-50 overflow-y-auto">
                <div className="p-4 border-b font-bold text-slate-600 bg-white sticky top-0">Tickets</div>
                {tickets.length === 0 ? (
                    <div className="p-6 text-center text-slate-400">No tickets found.</div>
                ) : (
                    tickets.map(ticket => (
                        <div
                            key={ticket.id}
                            onClick={() => setSelectedTicket(ticket)}
                            className={`p-4 border-b cursor-pointer hover:bg-white transition-colors ${selectedTicket?.id === ticket.id ? 'bg-white border-l-4 border-l-emerald-600 shadow-sm' : ''}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${ticket.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                                    {ticket.status}
                                </span>
                                <span className="text-xs text-slate-400">{new Date(ticket.last_updated).toLocaleDateString()}</span>
                            </div>
                            <div className="font-bold text-sm text-slate-800 mb-1 truncate">{ticket.subject}</div>
                            <div className="text-xs text-slate-500 truncate">{ticket.messages[ticket.messages.length - 1].text}</div>
                        </div>
                    ))
                )}
            </div>

            {/* Chat Area */}
            <div className="w-2/3 flex flex-col bg-white">
                {selectedTicket ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b flex justify-between items-center bg-white">
                            <div>
                                <h3 className="font-bold text-slate-900">{selectedTicket.subject}</h3>
                                <p className="text-xs text-slate-500">Ticket ID: {selectedTicket.id}</p>
                            </div>
                            {selectedTicket.status !== 'Closed' && (
                                <button onClick={handleCloseTicket} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-full font-bold transition-colors">
                                    Mark Closed
                                </button>
                            )}
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                            {selectedTicket.messages.map((msg: any, idx: number) => {
                                const isAdmin = msg.sender === 'Admin';
                                return (
                                    <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${isAdmin ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'}`}>
                                            <div className="text-sm">{msg.text}</div>
                                            <div className={`text-[10px] mt-1 text-right ${isAdmin ? 'text-emerald-200' : 'text-slate-400'}`}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Reply Box */}
                        <div className="p-4 border-t bg-white">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                                    placeholder="Type a reply..."
                                    value={reply}
                                    onChange={e => setReply(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSendReply()}
                                />
                                <button
                                    onClick={handleSendReply}
                                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-700 transition-colors"
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <span className="text-4xl mb-4">👋</span>
                        <p>Select a ticket to start chatting.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
