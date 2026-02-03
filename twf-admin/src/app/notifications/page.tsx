"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refresh, setRefresh] = useState(0);

    // Form State
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [targetType, setTargetType] = useState("All"); // All, AllUsers, AllVendors
    const [type, setType] = useState("info"); // info, alert, promo
    const [promoCode, setPromoCode] = useState("");
    const [sending, setSending] = useState(false);

    useEffect(() => {
        // ... (existing poll logic)
        fetch('/api/notifications?admin=true')
            .then(res => res.json())
            .then(data => {
                setNotifications(data);
                setLoading(false);
            });
    }, [refresh]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !body) return;

        setSending(true);
        try {
            const res = await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    body,
                    targetType,
                    type,
                    promoCode: type === 'promo' ? promoCode : undefined
                })
            });

            if (res.ok) {
                alert("Notification Sent!");
                setTitle("");
                setBody("");
                setPromoCode("");
                setRefresh(prev => prev + 1);
            } else {
                alert("Failed to send.");
            }
        } catch (error) {
            console.error(error);
            alert("Error sending notification.");
        } finally {
            setSending(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this notification?")) return;

        try {
            const res = await fetch(`/api/notifications?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setRefresh(prev => prev + 1);
            } else {
                alert("Failed to delete");
            }
        } catch (e) {
            console.error(e);
            alert("Error deleting notification");
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
                    <p className="text-slate-500 mt-1">Broadcast messages to Users and Vendors.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Send Form */}
                <div className="md:col-span-1">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-6">
                        <h2 className="font-bold text-lg text-slate-900 mb-4">Send New Alert</h2>
                        <form onSubmit={handleSend} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="e.g. System Maintenance"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Message Body</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="Enter your message here..."
                                    value={body}
                                    onChange={e => setBody(e.target.value)}
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Target</label>
                                    <select
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                        value={targetType}
                                        onChange={e => setTargetType(e.target.value)}
                                    >
                                        <option value="All">Everyone</option>
                                        <option value="AllUsers">All Users</option>
                                        <option value="AllVendors">All Vendors</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                    <select
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                        value={type}
                                        onChange={e => setType(e.target.value)}
                                    >
                                        <option value="info">Info ℹ️</option>
                                        <option value="alert">Alert ⚠️</option>
                                        <option value="promo">Promo 🎉</option>
                                    </select>
                                </div>
                            </div>

                            {type === 'promo' && (
                                <div className="animate-fade-in-down">
                                    <label className="block text-sm font-medium text-purple-700 mb-1">Promo Code</label>
                                    <input
                                        type="text"
                                        className="w-full border border-purple-200 bg-purple-50 rounded-lg px-3 py-2 text-sm text-purple-700 focus:ring-purple-500 focus:border-purple-500 font-mono"
                                        placeholder="e.g. WELCOME20"
                                        value={promoCode}
                                        onChange={e => setPromoCode(e.target.value.toUpperCase())}
                                    />
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={sending}
                                className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-lg hover:bg-black transition-colors disabled:opacity-70"
                            >
                                {sending ? 'Sending...' : 'Send Notification'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* History List */}
                <div className="md:col-span-2">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="font-bold text-lg text-slate-900">Sent History</h2>
                        </div>

                        {loading ? (
                            <div className="p-8 text-center text-slate-500">Loading history...</div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">No notifications sent yet.</div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {notifications.map((notif: any) => (
                                    <div key={notif.id} className="p-6 hover:bg-slate-50 transition-colors group">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${notif.type === 'alert' ? 'bg-red-50 text-red-600 border-red-100' :
                                                    notif.type === 'promo' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                        'bg-blue-50 text-blue-600 border-blue-100'
                                                    }`}>
                                                    {notif.type}
                                                </span>
                                                <span className="text-xs text-slate-400 font-mono">
                                                    To: {notif.targetType}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-slate-400">
                                                    {format(new Date(notif.createdAt), 'MMM d, h:mm a')}
                                                </span>
                                                <button
                                                    onClick={() => handleDelete(notif.id)}
                                                    className="w-6 h-6 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Delete Notification"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-slate-900 mb-1">{notif.title}</h3>
                                        <p className="text-slate-600 text-sm leading-relaxed">{notif.body}</p>
                                        {notif.promoCode && (
                                            <p className="text-xs font-mono text-purple-600 mt-2 bg-purple-50 inline-block px-2 py-1 rounded border border-purple-100">
                                                Code: <strong>{notif.promoCode}</strong>
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
