"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function DeleteVendorButton({ vendorId, vendorName }: { vendorId: string, vendorName: string }) {
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmText, setConfirmText] = useState("");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleDelete = async () => {
        if (confirmText !== "DELETE") return;

        setLoading(true);
        setError(null);

        const { error: rpcError } = await supabase.rpc('admin_delete_vendor_completely', {
            vendor_uuid: vendorId
        });

        if (rpcError) {
            console.error("Delete vendor error:", rpcError);
            setError(`Failed: ${rpcError.message}`);
            setLoading(false);
            return;
        }

        // Redirect to vendors list after successful deletion
        router.push("/vendors");
        router.refresh();
    };

    if (!showConfirm) {
        return (
            <button
                onClick={() => setShowConfirm(true)}
                className="w-full py-3 text-sm font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 hover:border-red-300 transition-all flex items-center justify-center gap-2"
            >
                🗑️ Delete Vendor Completely
            </button>
        );
    }

    return (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5 space-y-4">
            <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                    <h3 className="font-bold text-red-800 text-sm">Permanently Delete &quot;{vendorName}&quot;?</h3>
                    <p className="text-red-600 text-xs mt-1 leading-relaxed">
                        This will permanently delete:<br />
                        • All products listed by this vendor<br />
                        • All orders associated with this vendor<br />
                        • All payout history & bank details<br />
                        • Delivery partners added by this vendor<br />
                        • Spotlight entries & reviews<br />
                        • The vendor profile & auth account<br /><br />
                        <strong>The phone number will be freed up.</strong> If this person tries to register again, they will start as a brand new vendor.
                    </p>
                </div>
            </div>

            <div>
                <label className="text-xs font-bold text-red-700 block mb-1.5">
                    Type <span className="bg-red-100 px-1.5 py-0.5 rounded font-mono">DELETE</span> to confirm
                </label>
                <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Type DELETE here..."
                    className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300 bg-white"
                />
            </div>

            {error && <p className="text-xs text-red-600 font-medium bg-red-100 p-2 rounded-lg">❌ {error}</p>}

            <div className="flex gap-2">
                <button
                    onClick={handleDelete}
                    disabled={loading || confirmText !== "DELETE"}
                    className="flex-1 py-2.5 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {loading ? "Deleting..." : "🗑️ Delete Permanently"}
                </button>
                <button
                    onClick={() => { setShowConfirm(false); setConfirmText(""); setError(null); }}
                    className="px-4 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
