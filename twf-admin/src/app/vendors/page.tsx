import { db } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import VendorsGrid from "./VendorsGrid";

// Force dynamic rendering
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function VendorsPage() {
    // Fetch profiles that are Vendors
    const { data: vendors, error: vendorError } = await db.vendors.getAll();

    // Fetch all order reviews (via RPC to bypass RLS) to calculate average ratings for vendors
    const { data: vendorRatingsData, error: ratingsError } = await supabase.rpc('get_admin_vendor_ratings');

    const vendorRatings: Record<string, string> = {};
    if (vendorRatingsData && !ratingsError) {
        vendorRatingsData.forEach((row: any) => {
            if (row.vendor_id) {
                vendorRatings[row.vendor_id] = Number(row.rating).toFixed(1);
            }
        });
    }

    // Fetch Pending Requests
    const { data: requests, error: reqError } = await db.vendors.getRequests();

    if (vendorError) return <div className="p-8 text-red-500 bg-red-50 rounded-xl border border-red-100">Error loading vendors: {vendorError.message}</div>;

    const pendingCount = (vendors || []).filter((v: any) => !v.vendor_approved).length;

    return (
        <div>
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Vendors & Farmers</h1>
                    <p className="text-slate-500 mt-1">Manage partner relationships and verification</p>
                </div>
                {pendingCount > 0 && (
                    <span className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                        <span className="flex h-2.5 w-2.5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                        {pendingCount} Pending Approval
                    </span>
                )}
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
                        {requests.map((req: any) => (
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
                                                {Object.keys(req.requested_data).map((key: string) => key.replace(/_/g, ' ')).join(', ')}
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

            {/* VENDORS GRID WITH FILTER TABS */}
            <VendorsGrid vendors={vendors || []} vendorRatings={vendorRatings} />
        </div>
    );
}
