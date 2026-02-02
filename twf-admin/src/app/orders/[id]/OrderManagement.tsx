"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import InvoiceTemplate from "./InvoiceTemplate";

export default function OrderManagement({ initialOrder }: { initialOrder: any }) {
    const [order, setOrder] = useState(initialOrder);
    const [status, setStatus] = useState(initialOrder.status);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleUpdateStatus = async (newStatus?: string) => {
        const statusToUpdate = newStatus || status;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/orders/${order.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: statusToUpdate })
            });
            if (res.ok) {
                const updated = await res.json();
                setOrder(updated);
                setStatus(updated.status);
                alert("Order status updated!");
                router.refresh();
            } else {
                alert("Failed to update status");
            }
        } catch (e) {
            console.error(e);
            alert("Error updating status");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrintInvoice = () => {
        window.print();
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-6 flex items-center justify-between no-print">
                <div>
                    <Link href="/orders" className="text-slate-500 text-sm hover:text-slate-800 mb-2 inline-block">&larr; Back to Orders</Link>
                    <h1 className="text-3xl font-bold text-slate-900">Order Details <span className="text-slate-400 font-normal">#{order.id}</span></h1>
                </div>
                <div className="flex gap-2">
                    <button onClick={handlePrintInvoice} className="bg-white border border-slate-200 text-slate-700 font-bold px-4 py-2 rounded-lg hover:bg-slate-50">
                        Print Invoice
                    </button>
                    <button
                        onClick={() => {
                            if (confirm('Are you sure you want to cancel this order?')) {
                                handleUpdateStatus('Cancelled');
                            }
                        }}
                        className="bg-red-50 text-red-600 border border-red-100 font-bold px-4 py-2 rounded-lg hover:bg-red-100"
                    >
                        Cancel Order
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Content: Items & Financials */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Items Card */}
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 mb-4">Ordered Items</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-slate-100 text-slate-500 uppercase text-xs">
                                    <tr>
                                        <th className="pb-3">Product</th>
                                        <th className="pb-3 text-center">Qty</th>
                                        <th className="pb-3 text-right">Price</th>
                                        <th className="pb-3 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {order.items?.map((item: any, i: number) => (
                                        <tr key={i}>
                                            <td className="py-4">
                                                <div className="font-bold text-slate-800">{item.productName || item.name}</div>
                                                <div className="text-slate-400 text-xs">SKU: {item.productId?.slice(0, 6) || 'N/A'}</div>
                                            </td>
                                            <td className="py-4 text-center text-slate-600">{item.quantity}</td>
                                            <td className="py-4 text-right text-slate-600">₹{item.price}</td>
                                            <td className="py-4 text-right font-bold text-slate-800">₹{item.price * item.quantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 mb-4">Payment Breakdown</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal</span>
                                <span>₹{order.items?.reduce((acc: number, x: any) => acc + (x.price * x.quantity), 0) || order.total_amount}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Shipping Fee</span>
                                <span>₹{order.shipping_fee || 0}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Discount</span>
                                <span className="text-green-600">-₹{order.discount || 0}</span>
                            </div>
                            <div className="border-t border-slate-100 pt-3 flex justify-between font-bold text-lg text-slate-900">
                                <span>Total Amount</span>
                                <span>₹{order.total_amount}</span>
                            </div>
                        </div>
                        <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold">Payment Method</p>
                                <p className="text-slate-800 font-medium">{order.payment_method || 'COD'}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${order.payment_status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                {order.payment_status || 'Pending'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Status & Customer */}
                <div className="space-y-6 no-print">

                    {/* Status Card */}
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 mb-4">Order Status</h2>
                        <div className="space-y-4">
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                            >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                            <button
                                onClick={() => handleUpdateStatus()}
                                disabled={isLoading}
                                className={`w-full text-white font-bold py-2.5 rounded-lg transition-colors ${isLoading ? 'bg-slate-400' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                            >
                                {isLoading ? 'Updating...' : 'Update Status'}
                            </button>
                        </div>
                    </div>

                    {/* Customer Card */}
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 mb-4">Customer Details</h2>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                {(order.customerName || order.customer?.full_name || 'U').charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-slate-900">{order.customerName || order.customer?.full_name || 'Unknown'}</p>
                                <p className="text-xs text-slate-500">Customer ID: {order.user_id}</p>
                            </div>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex gap-3">
                                <span className="text-slate-400 w-5">📞</span>
                                <a href={`tel:${order.customer_phone}`} className="text-blue-600 hover:underline">{order.customer_phone || 'N/A'}</a>
                            </div>
                            <div className="flex gap-3">
                                <span className="text-slate-400 w-5">📍</span>
                                <p className="text-slate-600 leading-snug">{order.delivery_address || 'No address provided'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Vendor Info */}
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 mb-2">Fulfilled By</h2>
                        <p className="text-slate-600 font-medium">Vendor ID: {order.vendor_id || 'System'}</p>
                        <p className="text-xs text-slate-400 mt-1">This order is assigned to this vendor.</p>
                        <button className="mt-3 text-emerald-600 text-sm font-bold hover:underline">View Vendor Profile &rarr;</button>
                    </div>

                </div>
            </div>

            {/* Hidden Print Template */}
            <InvoiceTemplate order={order} />
        </div>
    );
}
