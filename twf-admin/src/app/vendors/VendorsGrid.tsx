"use client";

import { useState } from "react";
import Link from "next/link";
import ApproveVendorButton from "./ApproveVendorButton";

interface VendorGridProps {
    vendors: any[];
    vendorRatings: Record<string, string>;
}

export default function VendorsGrid({ vendors, vendorRatings }: VendorGridProps) {
    const [filter, setFilter] = useState<"all" | "approved" | "pending">("all");

    const approvedCount = vendors.filter(v => v.vendor_approved).length;
    const pendingCount = vendors.filter(v => !v.vendor_approved).length;

    const filtered = filter === "all"
        ? vendors
        : filter === "approved"
            ? vendors.filter(v => v.vendor_approved)
            : vendors.filter(v => !v.vendor_approved);

    return (
        <div>
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 mb-6">
                <button
                    onClick={() => setFilter("all")}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === "all" ? "bg-slate-900 text-white shadow-lg" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
                >
                    All Vendors <span className="ml-1 text-xs opacity-70">({vendors.length})</span>
                </button>
                <button
                    onClick={() => setFilter("approved")}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 ${filter === "approved" ? "bg-emerald-600 text-white shadow-lg" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
                >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                    Approved <span className="ml-0.5 text-xs opacity-70">({approvedCount})</span>
                </button>
                <button
                    onClick={() => setFilter("pending")}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 ${filter === "pending" ? "bg-amber-500 text-white shadow-lg" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
                >
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                    Pending Approval
                    {pendingCount > 0 && (
                        <span className={`ml-0.5 text-xs font-bold px-1.5 py-0.5 rounded-full ${filter === "pending" ? "bg-white/20" : "bg-red-100 text-red-600"}`}>
                            {pendingCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Vendor Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((vendor) => {
                    const avgRating = vendorRatings[vendor.id] || null;
                    return (
                        <div key={vendor.id} className={`group bg-white border rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative overflow-hidden ${vendor.vendor_approved ? 'border-slate-100' : 'border-amber-200 bg-amber-50/20'}`}>

                            {/* Rating Badge */}
                            <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-1">
                                {avgRating && (
                                    <span className="flex items-center gap-1 bg-amber-50 text-amber-600 border border-amber-200 text-[10px] font-bold px-2 py-1 rounded-full">
                                        <span className="text-amber-500">★</span> {avgRating}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-col items-center text-center mb-4 pt-4">
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

                            {/* Approval Toggle */}
                            <div className="flex justify-center mb-4">
                                <ApproveVendorButton vendorId={vendor.id} vendorName={vendor.full_name || 'Unknown'} isApproved={vendor.vendor_approved === true} />
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
                    );
                })}

                {/* Empty State */}
                {filtered.length === 0 && (
                    <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                            {filter === "pending" ? "⏳" : "🌱"}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">
                            {filter === "pending" ? "No Pending Vendors" : filter === "approved" ? "No Approved Vendors" : "No Vendors Found"}
                        </h3>
                        <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">
                            {filter === "pending"
                                ? "All vendors are currently approved. New farmer registrations will appear here."
                                : filter === "approved"
                                    ? "No vendors have been approved yet."
                                    : "Start by onboarding users as \"Vendor\" in the mobile app to see them appear here."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
