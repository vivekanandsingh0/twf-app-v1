"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
    'Pending': 'bg-amber-100 text-amber-800 border-amber-200',
    'Accepted': 'bg-blue-100 text-blue-800 border-blue-200',
    'Confirmed': 'bg-purple-100 text-purple-800 border-purple-200',
    'Preparing': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'Ready': 'bg-cyan-100 text-cyan-800 border-cyan-200',
    'Shipped': 'bg-sky-100 text-sky-800 border-sky-200',
    'On the Way': 'bg-sky-100 text-sky-800 border-sky-200',
    'Delivered': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Cancelled': 'bg-red-100 text-red-800 border-red-200',
    'Returned': 'bg-rose-100 text-rose-800 border-rose-200',
    'Undelivered': 'bg-orange-100 text-orange-800 border-orange-200',
};

const STATUS_ICONS: Record<string, string> = {
    'Pending': '⏳', 'Accepted': '✅', 'Confirmed': '📋', 'Preparing': '👨‍🍳',
    'Ready': '📦', 'Shipped': '🚚', 'On the Way': '🛵', 'Delivered': '✅',
    'Cancelled': '❌', 'Returned': '↩️', 'Undelivered': '⚠️',
};

type SortField = 'date' | 'amount' | 'status';
type SortDir = 'asc' | 'desc';

export default function OrdersDashboard({ orders }: { orders: any[] }) {
    const [statusFilter, setStatusFilter] = useState<string>("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortField, setSortField] = useState<SortField>('date');
    const [sortDir, setSortDir] = useState<SortDir>('desc');
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    // Stats calculation
    const stats = useMemo(() => {
        const total = orders.length;
        const pending = orders.filter(o => o.status === 'Pending').length;
        const inProgress = orders.filter(o => ['Accepted', 'Confirmed', 'Preparing', 'Ready', 'Shipped', 'On the Way'].includes(o.status)).length;
        const delivered = orders.filter(o => o.status === 'Delivered').length;
        const cancelled = orders.filter(o => ['Cancelled', 'Returned', 'Undelivered'].includes(o.status)).length;
        const totalRevenue = orders.filter(o => o.status === 'Delivered').reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
        const totalOrderValue = orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
        const avgOrderValue = total > 0 ? totalOrderValue / total : 0;
        const codOrders = orders.filter(o => o.payment_status === 'COD' || o.payment_method === 'COD').length;
        const paidOrders = orders.filter(o => o.payment_status === 'Paid').length;
        return { total, pending, inProgress, delivered, cancelled, totalRevenue, avgOrderValue, codOrders, paidOrders };
    }, [orders]);

    // Get unique statuses from orders
    const allStatuses = useMemo(() => {
        const statuses = new Set(orders.map(o => o.status));
        return ['All', ...Array.from(statuses)];
    }, [orders]);

    // Filter + Search + Sort
    const filteredOrders = useMemo(() => {
        let result = [...orders];

        // Status filter
        if (statusFilter !== 'All') {
            result = result.filter(o => o.status === statusFilter);
        }

        // Search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(o =>
                o.id?.toLowerCase().includes(q) ||
                o.customer?.full_name?.toLowerCase().includes(q) ||
                o.vendor?.full_name?.toLowerCase().includes(q) ||
                o.customer_phone?.toLowerCase().includes(q) ||
                o.delivery_address?.toLowerCase().includes(q) ||
                o.delivery_partner_name?.toLowerCase().includes(q)
            );
        }

        // Sort
        result.sort((a, b) => {
            let cmp = 0;
            if (sortField === 'date') cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            else if (sortField === 'amount') cmp = (a.total_amount || 0) - (b.total_amount || 0);
            else if (sortField === 'status') cmp = (a.status || '').localeCompare(b.status || '');
            return sortDir === 'desc' ? -cmp : cmp;
        });

        return result;
    }, [orders, statusFilter, searchQuery, sortField, sortDir]);

    const toggleSort = (field: SortField) => {
        if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortDir('desc'); }
    };

    const formatDate = (d: string) => {
        const date = new Date(d);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };
    const formatTime = (d: string) => {
        const date = new Date(d);
        return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div>
            {/* STATS CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
                <div
                    onClick={() => setStatusFilter('All')}
                    className={`bg-white rounded-2xl p-5 border shadow-sm cursor-pointer transition-all hover:shadow-md ${statusFilter === 'All' ? 'border-slate-900 ring-1 ring-slate-900' : 'border-slate-200'}`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Orders</span>
                        <span className="text-lg">📦</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                    <p className="text-xs text-slate-400 mt-1">All orders</p>
                </div>

                <div
                    onClick={() => setStatusFilter('Pending')}
                    className={`bg-white rounded-2xl p-5 border shadow-sm cursor-pointer transition-all hover:shadow-md ${statusFilter === 'Pending' ? 'border-amber-500 ring-1 ring-amber-500' : 'border-slate-200'}`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-amber-500 text-xs font-bold uppercase tracking-wider">Pending</span>
                        <span className="text-lg">⏳</span>
                    </div>
                    <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
                    <p className="text-xs text-slate-400 mt-1">Awaiting action</p>
                </div>

                <div
                    onClick={() => setStatusFilter('Delivered')}
                    className={`bg-white rounded-2xl p-5 border shadow-sm cursor-pointer transition-all hover:shadow-md ${statusFilter === 'Delivered' ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-200'}`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-emerald-500 text-xs font-bold uppercase tracking-wider">Delivered</span>
                        <span className="text-lg">✅</span>
                    </div>
                    <p className="text-3xl font-bold text-emerald-600">{stats.delivered}</p>
                    <p className="text-xs text-slate-400 mt-1">Completed</p>
                </div>

                <div
                    onClick={() => setStatusFilter('Cancelled')}
                    className={`bg-white rounded-2xl p-5 border shadow-sm cursor-pointer transition-all hover:shadow-md ${statusFilter === 'Cancelled' ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'}`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-red-500 text-xs font-bold uppercase tracking-wider">Cancelled</span>
                        <span className="text-lg">❌</span>
                    </div>
                    <p className="text-3xl font-bold text-red-600">{stats.cancelled}</p>
                    <p className="text-xs text-slate-400 mt-1">Cancelled / Returned</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-5 border border-emerald-700 shadow-sm text-white">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-emerald-200 text-xs font-bold uppercase tracking-wider">Revenue</span>
                        <span className="text-lg">💰</span>
                    </div>
                    <p className="text-3xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-emerald-200 mt-1">From delivered orders</p>
                </div>
            </div>

            {/* SECONDARY STATS ROW */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-3">
                    <span className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-lg">🔄</span>
                    <div>
                        <p className="text-lg font-bold text-slate-900">{stats.inProgress}</p>
                        <p className="text-xs text-slate-400">In Progress</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-3">
                    <span className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-lg">💳</span>
                    <div>
                        <p className="text-lg font-bold text-slate-900">{stats.paidOrders} Paid / {stats.codOrders} COD</p>
                        <p className="text-xs text-slate-400">Payment Split</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-3">
                    <span className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-lg">📊</span>
                    <div>
                        <p className="text-lg font-bold text-slate-900">₹{stats.avgOrderValue.toFixed(0)}</p>
                        <p className="text-xs text-slate-400">Avg Order Value</p>
                    </div>
                </div>
            </div>

            {/* FILTER BAR + SEARCH */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex flex-wrap gap-2">
                    {allStatuses.map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === s
                                ? 'bg-slate-900 text-white shadow-md'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {s !== 'All' && <span className="mr-1">{STATUS_ICONS[s] || '📋'}</span>}
                            {s}
                            {s !== 'All' && <span className="ml-1 opacity-60">({orders.filter(o => o.status === s).length})</span>}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
                        />
                    </div>
                </div>
            </div>

            {/* ORDERS TABLE */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <div className="col-span-1">Order</div>
                    <div className="col-span-2">Customer</div>
                    <div className="col-span-2">Vendor / Farmer</div>
                    <div className="col-span-2">Items</div>
                    <div className="col-span-1 cursor-pointer hover:text-slate-800" onClick={() => toggleSort('amount')}>
                        Amount {sortField === 'amount' && (sortDir === 'desc' ? '↓' : '↑')}
                    </div>
                    <div className="col-span-1">Payment</div>
                    <div className="col-span-1 cursor-pointer hover:text-slate-800" onClick={() => toggleSort('status')}>
                        Status {sortField === 'status' && (sortDir === 'desc' ? '↓' : '↑')}
                    </div>
                    <div className="col-span-1 cursor-pointer hover:text-slate-800" onClick={() => toggleSort('date')}>
                        Date {sortField === 'date' && (sortDir === 'desc' ? '↓' : '↑')}
                    </div>
                    <div className="col-span-1 text-right">Action</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-slate-100">
                    {filteredOrders.length === 0 && (
                        <div className="p-12 text-center">
                            <div className="text-4xl mb-3">📭</div>
                            <p className="font-bold text-slate-600">No orders found</p>
                            <p className="text-xs text-slate-400 mt-1">{searchQuery ? 'Try different search terms' : 'No orders match the selected filter'}</p>
                        </div>
                    )}

                    {filteredOrders.map((order) => (
                        <div key={order.id}>
                            {/* Order Row */}
                            <div
                                className="grid grid-cols-12 gap-2 px-5 py-4 items-center hover:bg-slate-50/50 transition-colors cursor-pointer"
                                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                            >
                                {/* Order ID */}
                                <div className="col-span-1">
                                    <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                        #{order.id.slice(0, 8)}
                                    </span>
                                </div>

                                {/* Customer */}
                                <div className="col-span-2">
                                    <p className="font-bold text-sm text-slate-900 truncate">{order.customer?.full_name || 'Unknown'}</p>
                                    <p className="text-[10px] text-slate-400 truncate">{order.customer_phone || order.customer?.phone_number || ''}</p>
                                </div>

                                {/* Vendor */}
                                <div className="col-span-2">
                                    <p className="font-bold text-sm text-emerald-700 truncate">{order.vendor?.full_name || 'Unassigned'}</p>
                                    <p className="text-[10px] text-slate-400 truncate">{order.vendor?.phone_number || ''}</p>
                                </div>

                                {/* Items */}
                                <div className="col-span-2">
                                    {order.items && order.items.length > 0 ? (
                                        <div className="text-xs text-slate-600">
                                            <span className="font-bold">{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                                            <p className="text-[10px] text-slate-400 truncate">
                                                {order.items.slice(0, 2).map((i: any) => `${i.quantity}x ${i.productName}`).join(', ')}
                                                {order.items.length > 2 && ` +${order.items.length - 2} more`}
                                            </p>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-slate-300">—</span>
                                    )}
                                </div>

                                {/* Amount */}
                                <div className="col-span-1">
                                    <span className="font-bold text-sm text-slate-900">₹{Number(order.total_amount || 0).toLocaleString()}</span>
                                </div>

                                {/* Payment */}
                                <div className="col-span-1">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${order.payment_status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                        {order.payment_status || 'COD'}
                                    </span>
                                </div>

                                {/* Status */}
                                <div className="col-span-1">
                                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border ${STATUS_COLORS[order.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                        {STATUS_ICONS[order.status] || '📋'} {order.status}
                                    </span>
                                </div>

                                {/* Date */}
                                <div className="col-span-1">
                                    <p className="text-xs font-bold text-slate-700">{formatDate(order.created_at)}</p>
                                    <p className="text-[10px] text-slate-400">{formatTime(order.created_at)}</p>
                                </div>

                                {/* Action */}
                                <div className="col-span-1 text-right">
                                    <Link
                                        href={`/orders/${order.id}`}
                                        onClick={e => e.stopPropagation()}
                                        className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all"
                                    >
                                        Manage
                                    </Link>
                                </div>
                            </div>

                            {/* Expanded Order Details */}
                            {expandedOrder === order.id && (
                                <div className="px-5 pb-5 bg-slate-50/50 border-t border-slate-100 animate-fade-in-down">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                                        {/* Items Ordered */}
                                        <div className="bg-white rounded-xl border border-slate-200 p-4">
                                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">🛒 Items Ordered</h4>
                                            {order.items && order.items.length > 0 ? (
                                                <div className="space-y-2">
                                                    {order.items.map((item: any, idx: number) => (
                                                        <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                                                            <div className="flex items-center gap-3">
                                                                {item.imageUrl && (
                                                                    <img src={item.imageUrl} alt={item.productName} className="w-10 h-10 rounded-lg object-cover border border-slate-100" />
                                                                )}
                                                                <div>
                                                                    <p className="text-sm font-bold text-slate-800">{item.productName}</p>
                                                                    <p className="text-[10px] text-slate-400">{item.quantity} × ₹{item.price}</p>
                                                                </div>
                                                            </div>
                                                            <span className="font-bold text-sm text-slate-900">₹{(item.quantity * item.price).toLocaleString()}</span>
                                                        </div>
                                                    ))}
                                                    <div className="flex justify-between pt-2 border-t border-slate-200 mt-2">
                                                        <span className="text-xs font-bold text-slate-500">Total</span>
                                                        <span className="font-bold text-emerald-700">₹{Number(order.total_amount || 0).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-slate-400 italic">No item details available</p>
                                            )}
                                        </div>

                                        {/* Delivery & Customer Info */}
                                        <div className="bg-white rounded-xl border border-slate-200 p-4">
                                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">📍 Delivery Info</h4>
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Delivery Address</p>
                                                    <p className="text-sm text-slate-700">{order.delivery_address || 'Not specified'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Customer</p>
                                                    <p className="text-sm font-bold text-slate-800">{order.customer?.full_name || 'Unknown'}</p>
                                                    <p className="text-xs text-slate-500">{order.customer_phone || order.customer?.phone_number || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Payment</p>
                                                    <p className="text-sm text-slate-700">{order.payment_method || 'N/A'} — <span className={order.payment_status === 'Paid' ? 'text-green-600 font-bold' : 'text-orange-600 font-bold'}>{order.payment_status || 'COD'}</span></p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Vendor & Delivery Partner */}
                                        <div className="bg-white rounded-xl border border-slate-200 p-4">
                                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">👩‍🌾 Vendor & Delivery</h4>
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Farmer / Vendor</p>
                                                    <p className="text-sm font-bold text-emerald-700">{order.vendor?.full_name || 'Unassigned'}</p>
                                                    <p className="text-xs text-slate-500">{order.vendor?.phone_number || ''}</p>
                                                </div>
                                                {order.delivery_partner_name ? (
                                                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                                                        <p className="text-[10px] text-blue-500 font-bold uppercase mb-1">🚴 Delivery Partner</p>
                                                        <div className="flex items-center gap-3">
                                                            {order.delivery_partner_photo && (
                                                                <img src={order.delivery_partner_photo} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-blue-200" />
                                                            )}
                                                            <div>
                                                                <p className="text-sm font-bold text-blue-800">{order.delivery_partner_name}</p>
                                                                <p className="text-xs text-blue-600">{order.delivery_partner_phone || ''}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Delivery Partner</p>
                                                        <p className="text-xs text-slate-400 italic">Not assigned yet</p>
                                                    </div>
                                                )}
                                                {/* Status Timeline */}
                                                <div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Status Log</p>
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-slate-300 flex-shrink-0"></span>
                                                            <span className="text-[10px] text-slate-500">Order placed — {formatDate(order.created_at)} {formatTime(order.created_at)}</span>
                                                        </div>
                                                        {order.updated_at && order.updated_at !== order.created_at && (
                                                            <div className="flex items-center gap-2">
                                                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${order.status === 'Delivered' ? 'bg-emerald-500' : order.status === 'Cancelled' ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                                                                <span className="text-[10px] text-slate-500">{order.status} — {formatDate(order.updated_at)} {formatTime(order.updated_at)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span>Showing {filteredOrders.length} of {orders.length} orders</span>
                    <span>{statusFilter !== 'All' && `Filtered by: ${statusFilter}`}</span>
                </div>
            </div>
        </div>
    );
}
