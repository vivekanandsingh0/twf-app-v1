"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StatusManager({ vendor }: { vendor: any }) {
    const router = useRouter();
    const [status, setStatus] = useState(vendor.shop_status || 'Active');
    const [loading, setLoading] = useState(false);

    const handleUpdate = async (newStatus: string) => {
        setLoading(true);
        setStatus(newStatus);

        try {
            const res = await fetch(`/api/profiles/${vendor.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shop_status: newStatus })
            });
            if (res.ok) {
                router.refresh();
            } else {
                alert('Failed to update status');
            }
        } catch (e) {
            console.error(e);
            alert('Error updating status');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'Active': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'Inactive': return 'bg-slate-100 text-slate-800 border-slate-200';
            case 'Suspended': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'Terminated': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Current Status</h2>
                    <p className="text-slate-500 text-sm">Control the operational status of this shop.</p>
                </div>
                <div className={`px-4 py-1.5 rounded-full border text-sm font-bold ${getStatusColor(status)}`}>
                    {status}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={() => handleUpdate('Active')}
                    disabled={loading || status === 'Active'}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${status === 'Active'
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-slate-100 hover:border-emerald-200 hover:bg-slate-50'
                        }`}
                >
                    <div className="font-bold text-slate-900 mb-1">Active</div>
                    <div className="text-xs text-slate-500">Shop is live. Users can see products and place orders.</div>
                </button>

                <button
                    onClick={() => handleUpdate('Inactive')}
                    disabled={loading || status === 'Inactive'}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${status === 'Inactive'
                            ? 'border-slate-500 bg-slate-50'
                            : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                >
                    <div className="font-bold text-slate-900 mb-1">Inactive</div>
                    <div className="text-xs text-slate-500">Shop is hidden. Users cannot see products. Vendor can still access dashboard.</div>
                </button>

                <button
                    onClick={() => handleUpdate('Suspended')}
                    disabled={loading || status === 'Suspended'}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${status === 'Suspended'
                            ? 'border-amber-500 bg-amber-50'
                            : 'border-slate-100 hover:border-amber-200 hover:bg-slate-50'
                        }`}
                >
                    <div className="font-bold text-slate-900 mb-1">Suspended</div>
                    <div className="text-xs text-slate-500">Shop is temporarily disabled due to policy violation or pending review.</div>
                </button>

                <button
                    onClick={() => handleUpdate('Terminated')}
                    disabled={loading || status === 'Terminated'}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${status === 'Terminated'
                            ? 'border-red-500 bg-red-50'
                            : 'border-slate-100 hover:border-red-200 hover:bg-slate-50'
                        }`}
                >
                    <div className="font-bold text-red-700 mb-1">Terminated</div>
                    <div className="text-xs text-slate-500">Permanently banning this vendor. Cannot operate.</div>
                </button>
            </div>
        </div>
    );
}
