import { db } from "@/lib/db";
import Link from "next/link";

// Force dynamic rendering
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function VendorsPage() {
    // Fetch profiles that are Vendors
    const { data: vendors, error: vendorError } = await db.vendors.getAll();

    // Fetch Pending Requests
    const { data: requests, error: reqError } = await db.vendors.getRequests();

    if (vendorError) return <div className="p-8 text-red-500 bg-red-50 rounded-xl border border-red-100">Error loading vendors: {vendorError.message}</div>;

    return (
        <div>
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Vendors & Farmers</h1>
                    <p className="text-slate-500 mt-1">Manage partner relationships and verification</p>
                </div>
                <div className="flex items-center gap-3">
                    <a href="/vendor-requests" className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm flex items-center gap-2">
                        <span>📝</span> Manage Requests
                    </a>
                    <button className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center gap-2">
                        <span className="text-lg">+</span> Add New Vendor
                    </button>
                </div>
            </header>

            {/* PENDING REQUESTS SECTION */}
            {requests && requests.length > 0 && (
                <div className="mb-12 animate-fade-in-down">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                        </span>
                        <h2 className="text-lg font-bold text-slate-800">Pending Actions</h2>
                    </div>

                    <div className="grid gap-4">
                        {requests.map((req) => (
                            <div key={req.id} className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                                    <span className="text-8xl">📝</span>
                                </div>

                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 relative z-10">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Profile Update</span>
                                            <span className="text-slate-400 text-xs">•</span>
                                            <span className="text-slate-500 text-xs font-medium">{new Date(req.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="font-bold text-slate-900 text-xl">
                                            {req.profiles?.full_name || 'Unknown Vendor'}
                                        </h3>
                                        <p className="text-slate-500 text-sm mt-1">
                                            Requesting updates to:
                                            <span className="font-medium text-slate-700 ml-1">
                                                {Object.keys(req.requested_data).map(key => key.replace(/_/g, ' ')).join(', ')}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <a
                                            href={`/vendor-requests`}
                                            className="bg-white text-slate-900 border border-slate-200 px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                                        >
                                            Review Request &rarr;
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* VENDORS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {vendors?.map((vendor) => (
                    <div key={vendor.id} className="group bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative overflow-hidden">

                        {/* Status Badge */}
                        <div className="absolute top-4 right-4 z-10">
                            <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                                Verified
                            </span>
                        </div>

                        <div className="flex flex-col items-center text-center mb-6 pt-4">
                            <div className="w-20 h-20 rounded-2xl bg-slate-50 mb-4 flex items-center justify-center text-2xl shadow-inner relative group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                                <span className="absolute inset-0 bg-gradient-to-tr from-emerald-50 to-transparent opacity-50 rounded-2xl"></span>
                                {vendor.profile_image ? (
                                    <img src={vendor.profile_image} alt={vendor.full_name} className="w-full h-full object-cover" />
                                ) : (
                                    <span>{vendor.full_name?.charAt(0) || 'V'}</span>
                                )}
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 line-clamp-1 w-full px-2">{vendor.full_name || 'Unnamed Vendor'}</h3>
                            <p className="text-slate-400 text-xs font-medium mt-1">{vendor.phone_number}</p>
                        </div>

                        <div className="space-y-3 mb-6 flex-1 bg-slate-50/50 rounded-xl p-4 border border-slate-50">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400 font-medium uppercase tracking-wider">Size</span>
                                <span className="font-bold text-slate-700">{vendor.farm_size || 'N/A'}</span>
                            </div>
                            <div className="w-full h-px bg-slate-200/50"></div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400 font-medium uppercase tracking-wider">Exp</span>
                                <span className="font-bold text-slate-700">{vendor.experience || 'N/A'}</span>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-auto">
                            <Link href={`/vendors/${vendor.id}`} className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors text-center flex items-center justify-center">
                                View Profile
                            </Link>
                            <Link href={`/vendors/${vendor.id}/manage`} className="flex-1 py-2.5 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-black transition-colors shadow-lg shadow-slate-200 text-center flex items-center justify-center">
                                Manage
                            </Link>
                        </div>
                    </div>
                ))}

                {/* Empty State */}
                {vendors?.length === 0 && (
                    <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🌱</div>
                        <h3 className="text-lg font-bold text-slate-900">No Vendors Found</h3>
                        <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">Start by onboarding users as "Vendor" in the mobile app to see them appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
