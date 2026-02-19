
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const revalidate = 0;

const getInitials = (name: string) =>
    name.trim().split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('');

export default async function VendorDashboardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // 1. Fetch Vendor Profile
    const { data: vendors } = await db.vendors.getAll();
    const vendor = vendors?.find((p: any) => p.id === id);

    if (!vendor) {
        notFound();
    }

    // 2. Fetch Vendor Orders
    const { data: allOrders } = await db.orders.getAll();
    const vendorOrders = allOrders?.filter((o: any) => String(o.vendor_id) === String(id)) || [];

    // 3. Fetch Vendor Products
    const { data: allProducts } = await db.products.getAll();
    const vendorProducts = allProducts?.filter((p: any) => String(p.vendor_id) === String(id)) || [];

    // 4. Fetch Delivery Partners for this vendor
    const { data: deliveryPartners } = await supabase
        .from('delivery_partners')
        .select('*')
        .eq('vendor_id', id)
        .order('created_at', { ascending: false });

    // 5. Calculate Stats
    const totalSales = vendorOrders
        .filter((o: any) => o.status === 'Delivered')
        .reduce((sum: number, o: any) => sum + (Number(o.total_amount) || 0), 0);

    const pendingOrders = vendorOrders.filter((o: any) => o.status === 'Pending').length;
    const completedOrders = vendorOrders.filter((o: any) => o.status === 'Delivered').length;

    // 6. Determine Status Badge
    const status = (vendor.shop_status || 'Active') as 'Active' | 'Inactive' | 'Suspended' | 'Terminated';
    const statusStyles = {
        'Active': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        'Inactive': 'bg-slate-100 text-slate-700 border-slate-200',
        'Suspended': 'bg-amber-100 text-amber-700 border-amber-200',
        'Terminated': 'bg-red-100 text-red-700 border-red-200'
    }[status] || 'bg-slate-100 text-slate-700 border-slate-200';

    return (
        <div className="max-w-6xl mx-auto pb-12">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <Link href="/vendors" className="text-slate-500 text-sm hover:text-slate-800">&larr; Back to Vendors</Link>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-500 text-sm">{vendor.full_name}</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            {vendor.businessName || vendor.full_name}
                            <span className={`text-xs font-bold px-2 py-1 rounded-full border uppercase tracking-wide ${statusStyles} border`}>{status}</span>
                        </h1>
                        <p className="text-slate-500 mt-1">Vendor Dashboard &amp; Activity Monitor</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href={`/vendors/${id}`} className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-50 transition-all">
                            Edit Profile
                        </Link>
                        <Link
                            href={`/vendors/${id}/status`}
                            className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-black transition-all"
                        >
                            Manage Status
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Total Sales</h3>
                    <p className="text-2xl font-bold text-slate-900">₹{totalSales.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-amber-400">
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Pending</h3>
                    <p className="text-2xl font-bold text-amber-600">{pendingOrders}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-blue-400">
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">In Progress</h3>
                    <p className="text-2xl font-bold text-blue-600">
                        {vendorOrders.filter((o: any) => ['Accepted', 'Preparing', 'Ready', 'Shipped', 'On the Way'].includes(o.status)).length}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-400">
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Delivered</h3>
                    <p className="text-2xl font-bold text-emerald-600">{completedOrders}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-red-400">
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Cancelled</h3>
                    <p className="text-2xl font-bold text-red-600">
                        {vendorOrders.filter((o: any) => ['Cancelled', 'Returned', 'Undelivered'].includes(o.status)).length}
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Recent Orders + Complaints */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Orders Section */}
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="font-bold text-lg text-slate-900">Recent Orders</h2>
                            <Link href="/orders" className="text-sm text-emerald-600 font-bold hover:underline">View All</Link>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {vendorOrders.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">No orders yet.</div>
                            ) : (
                                vendorOrders.slice(0, 5).map((order: any) => (
                                    <div key={order.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div>
                                            <div className="font-bold text-slate-900 text-sm">{order.id}</div>
                                            <div className="text-xs text-slate-500 mb-1">{new Date(order.created_at).toLocaleDateString()}</div>
                                            {order.items && order.items.length > 0 && (
                                                <div className="text-xs text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100 mt-1 max-w-xs">
                                                    {order.items.map((i: any, idx: number) => (
                                                        <div key={idx} className="truncate">
                                                            {i.quantity}x {i.productName}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-slate-900 text-sm">₹{order.total_amount}</div>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                                                order.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-slate-100 text-slate-700'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>


                </div>

                {/* Right Column */}
                <div className="space-y-8">

                    {/* Top Products */}
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="font-bold text-lg text-slate-900">Top Products</h2>
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{vendorProducts.length}</span>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {vendorProducts.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">No products listed.</div>
                            ) : (
                                vendorProducts.slice(0, 5).map((prod: any) => (
                                    <div key={prod.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex-shrink-0">
                                            {prod.image_url && <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover rounded-lg" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-slate-900 text-sm truncate">{prod.name}</div>
                                            <div className="text-xs text-slate-500">{prod.category} • stock: {prod.stock}</div>
                                        </div>
                                        <div className="font-bold text-slate-700 text-sm">₹{prod.price}</div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                            <Link href={`/vendors/${id}/inventory`} className="text-sm font-bold text-slate-600 hover:text-slate-900">Manage Inventory</Link>
                        </div>
                    </div>

                    {/* ── Delivery Partners ──────────────────────────────────────── */}
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="font-bold text-lg text-slate-900">🚴 Delivery Partners</h2>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                {deliveryPartners?.length ?? 0}
                            </span>
                        </div>

                        {!deliveryPartners || deliveryPartners.length === 0 ? (
                            <div className="p-8 text-center bg-slate-50">
                                <div className="text-3xl mb-2">🚲</div>
                                <p className="text-slate-500 text-sm font-medium">No partners added yet</p>
                                <p className="text-slate-400 text-xs mt-1">
                                    Partners added by this vendor<br />will appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {deliveryPartners.map((partner: any) => (
                                    <div key={partner.id} className="p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                                        {/* Avatar */}
                                        {partner.photo_url ? (
                                            <img
                                                src={partner.photo_url}
                                                alt={partner.name}
                                                className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-emerald-100"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                {getInitials(partner.name)}
                                            </div>
                                        )}
                                        {/* Info */}
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold text-slate-800 text-sm truncate">{partner.name}</p>
                                            <p className="text-xs text-slate-500">{partner.phone}</p>
                                        </div>
                                        {/* Active badge */}
                                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase">
                                            Active
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Payout Information */}
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="font-bold text-lg text-slate-900">Payout Details</h2>
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm text-slate-500">Next Payout</span>
                                <span className="font-bold text-slate-900">₹{totalSales > 0 ? (totalSales * 0.9).toLocaleString() : '0'}</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
                                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                            </div>
                            <div className="text-xs text-slate-400 mb-6">
                                Scheduled for Next Monday. 90% of total sales (10% platform fee).
                            </div>

                            <button className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 text-sm mb-4">
                                View Transaction History
                            </button>

                            <div className="pt-4 border-t border-slate-100">
                                <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-2">Registered Bank Account</h3>
                                {vendor.bank_details ? (
                                    <div className="text-sm space-y-1">
                                        <div className="font-bold text-slate-800">{vendor.bank_details.bank_name}</div>
                                        <div className="text-slate-600">{vendor.bank_details.account_holder_name}</div>
                                        <div className="text-slate-500 font-mono text-xs">{vendor.bank_details.account_number}</div>
                                        <div className="text-slate-400 text-xs">IFSC: {vendor.bank_details.ifsc_code}</div>
                                    </div>
                                ) : (
                                    <div className="text-slate-400 text-sm italic">
                                        No bank details provided by vendor.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
