'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ProfileRequest {
    id: string;
    vendor_id: string;
    requested_data: any;
    status: 'Pending' | 'Approved' | 'Rejected';
    created_at: string;
    admin_note?: string;
    profiles?: { full_name: string };
}

export default function VendorRequestsPage() {
    const [requests, setRequests] = useState<ProfileRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'Pending' | 'History'>('Pending');

    useEffect(() => {
        fetchRequests();

        const subscription = supabase
            .channel('vendor_requests_channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'vendor_profile_requests' }, () => {
                fetchRequests();
            })
            .subscribe();

        return () => { subscription.unsubscribe(); };
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('vendor_profile_requests')
            .select('*, profiles:vendor_id(full_name)')
            .order('created_at', { ascending: false });

        setRequests(data || []);
        setLoading(false);
    };

    const handleApprove = async (req: ProfileRequest) => {
        if (!confirm('Approve changes?')) return;

        try {
            // Update Profile
            const { error: pError } = await supabase
                .from('profiles')
                .update(req.requested_data)
                .eq('id', req.vendor_id);

            if (pError) throw pError;

            // Update Request Status
            await supabase.from('vendor_profile_requests').update({ status: 'Approved' }).eq('id', req.id);
            fetchRequests();
        } catch (e: any) {
            alert('Error: ' + e.message);
        }
    };

    const handleReject = async (req: ProfileRequest) => {
        const reason = prompt('Reason for rejection:');
        if (!reason) return;

        await supabase.from('vendor_profile_requests').update({ status: 'Rejected', admin_note: reason }).eq('id', req.id);
        fetchRequests();
    };

    const filtered = requests.filter(r => activeTab === 'Pending' ? r.status === 'Pending' : r.status !== 'Pending');

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Vendor Requests</h1>

            <div className="flex gap-4 mb-6">
                <button onClick={() => setActiveTab('Pending')} className={`px-4 py-2 rounded ${activeTab === 'Pending' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>Pending</button>
                <button onClick={() => setActiveTab('History')} className={`px-4 py-2 rounded ${activeTab === 'History' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>History</button>
            </div>

            {loading ? <p>Loading...</p> : (
                <div className="grid gap-4">
                    {filtered.map(req => (
                        <div key={req.id} className="border p-4 rounded-lg bg-white shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold">{req.profiles?.full_name || 'Vendor'}</h3>
                                    <p className="text-sm text-gray-500">{new Date(req.created_at).toLocaleString()}</p>
                                    <div className="mt-2 bg-gray-50 p-2 rounded text-sm">
                                        <pre>{JSON.stringify(req.requested_data, null, 2)}</pre>
                                    </div>
                                </div>
                                {req.status === 'Pending' && (
                                    <div className="flex gap-2">
                                        <button onClick={() => handleApprove(req)} className="px-3 py-1 bg-green-500 text-white rounded text-sm">Approve</button>
                                        <button onClick={() => handleReject(req)} className="px-3 py-1 bg-red-500 text-white rounded text-sm">Reject</button>
                                    </div>
                                )}
                                {req.status !== 'Pending' && <span className={`px-2 py-1 rounded text-xs font-bold ${req.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{req.status}</span>}
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && <p className="text-gray-500">No requests found.</p>}
                </div>
            )}
        </div>
    );
}
