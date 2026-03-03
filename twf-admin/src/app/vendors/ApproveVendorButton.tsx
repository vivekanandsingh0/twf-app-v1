"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ApproveVendorButton({ vendorId, vendorName, isApproved }: { vendorId: string, vendorName: string, isApproved: boolean }) {
    const [approved, setApproved] = useState(isApproved);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleToggle = async () => {
        const newVal = !approved;
        if (!confirm(`${newVal ? "Approve" : "Unapprove"} vendor "${vendorName}"? ${newVal ? "They will gain full access to the vendor dashboard." : "They will lose access to the vendor dashboard."}`)) return;

        setLoading(true);
        setError(null);

        // Use RPC function with SECURITY DEFINER to bypass RLS
        const { error: rpcError } = await supabase.rpc('admin_set_vendor_approved', {
            vendor_uuid: vendorId,
            approved: newVal
        });

        if (rpcError) {
            console.error("Approve vendor error:", rpcError);
            setError(`Failed: ${rpcError.message}`);
            setLoading(false);
            return;
        }

        setApproved(newVal);
        setLoading(false);
        router.refresh();
    };

    return (
        <div className="flex flex-col items-center gap-1">
            <button
                onClick={handleToggle}
                disabled={loading}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all disabled:opacity-50 flex items-center gap-1.5 ${approved
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                    }`}
            >
                {loading ? (
                    <span className="animate-spin">⏳</span>
                ) : approved ? (
                    <>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                        Approved
                    </>
                ) : (
                    <>
                        <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                        Tap to Approve
                    </>
                )}
            </button>
            {error && <span className="text-[10px] text-red-500 font-medium">{error}</span>}
        </div>
    );
}
