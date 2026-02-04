import { db } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import UserInfoCard from "./UserInfoCard";

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch user
    const { data: allProfiles } = await db.users.getAll();
    const user = allProfiles?.find((u: any) => u.id === id);

    if (!user) notFound();

    // Fetch orders to calculate stats
    const { data: allOrders } = await db.orders.getAll();
    const userOrders = allOrders?.filter((o: any) => o.user_id === id) || [];

    // Calculate Stats
    const activeOrders = userOrders.filter((o: any) => ['Pending', 'Confirmed', 'Shipped'].includes(o.status)).length;
    const totalOrders = userOrders.length;
    const totalSpent = userOrders.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);

    return (
        <main className="max-w-4xl mx-auto py-8">
            <div className="mb-6">
                <Link href="/users" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-600 transition-colors">
                    <span>&larr; Back to Customers</span>
                </Link>
            </div>

            {/* Profile Header */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                <div className="h-32 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
                <div className="px-8 pb-8 relative">
                    <div className="absolute -top-12 left-8 w-24 h-24 rounded-2xl bg-white p-1 shadow-md">
                        <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-400 overflow-hidden relative">
                            {user.profile_image ? (
                                <img src={user.profile_image} alt={user.full_name} className="w-full h-full object-cover" />
                            ) : (
                                <span>{user.full_name?.charAt(0) || 'U'}</span>
                            )}
                        </div>
                    </div>
                    <div className="ml-28 pt-2 flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{user.full_name || 'Anonymous User'}</h1>
                            <p className="text-slate-500 font-mono text-sm mt-1">{user.phone_number}</p>
                            <div className="flex gap-2 mt-3">
                                <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                                    {user.user_type}
                                </span>
                                <span className="px-2.5 py-1 rounded-md bg-slate-50 text-slate-600 text-xs font-medium">
                                    Joined <span suppressHydrationWarning>{user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : 'N/A'}</span>
                                </span>
                            </div>
                        </div>
                        <Link href={`/users/${id}/manage`} className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-colors shadow-sm">
                            Manage User
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Personal Info */}
                <div className="md:col-span-2 space-y-8">
                    <UserInfoCard user={user} />

                    {/* Address Card */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-slate-900">Addresses</h3>
                            <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700">Manage</button>
                        </div>
                        <div className="grid gap-4">
                            {user.addresses && user.addresses.length > 0 ? (
                                user.addresses.map((addr: any, index: number) => (
                                    <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100">
                                        <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                                            {/* Simple icon mapping */}
                                            {addr.type?.toLowerCase().includes('home') ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                                            ) : addr.type?.toLowerCase().includes('work') ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-sm text-slate-900">{addr.type}</span>
                                                {index === 0 && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase">Default</span>}
                                            </div>
                                            <p className="text-sm text-slate-600 leading-relaxed">
                                                {addr.address}, {addr.city} - {addr.pincode}
                                            </p>
                                            {addr.landmark && <p className="text-xs text-slate-400 mt-1">Landmark: {addr.landmark}</p>}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                    <p className="text-slate-400 text-sm">No addresses saved yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6" suppressHydrationWarning>
                        <h3 className="font-bold text-sm text-slate-900 mb-4">Activity Overview</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                                <span className="text-sm font-medium text-emerald-800">Active Orders</span>
                                <span className="text-lg font-bold text-emerald-700">{activeOrders}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50 border border-blue-100">
                                <span className="text-sm font-medium text-blue-800">Total Orders</span>
                                <span className="text-lg font-bold text-blue-700">{totalOrders}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg bg-purple-50 border border-purple-100">
                                <span className="text-sm font-medium text-purple-800">Total Spent</span>
                                <span className="text-lg font-bold text-purple-700">₹{totalSpent}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
