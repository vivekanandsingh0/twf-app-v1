"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface PayoutRequest {
    id: string;
    vendor_id: string;
    amount: number;
    status: string;
    admin_notes?: string;
    transaction_id?: string;
    bank_name?: string;
    completed_at?: string;
    created_at: string;
    profiles?: {
        id: string;
        full_name: string;
        business_name: string;
        phone_number: string;
        bank_details: any;
    };
}

export default function PayoutsManager() {
    const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [newStatus, setNewStatus] = useState("Completed");
    const [adminNotes, setAdminNotes] = useState("");
    const [transactionId, setTransactionId] = useState("");
    const [bankName, setBankName] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const fetchPayouts = async () => {
        setLoading(true);
        setErrorMsg("");
        try {
            const { data, error } = await supabase
                .from('payout_requests')
                .select(`
          *,
          profiles (id, full_name, business_name, phone_number, bank_details)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPayouts(data || []);
        } catch (error: any) {
            console.error('Error fetching payouts', error);
            setErrorMsg(JSON.stringify(error, null, 2) || error.message || "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayouts();
    }, []);

    const handleOpenUpdateModal = (payout: PayoutRequest) => {
        setSelectedPayout(payout);
        setNewStatus(payout.status);
        setAdminNotes(payout.admin_notes || "");
        setTransactionId(payout.transaction_id || "");
        setBankName(payout.bank_name || "");
        setIsUpdateModalOpen(true);
    };

    const handleUpdatePayout = async () => {
        if (!selectedPayout) return;
        try {
            const updateData: any = {
                status: newStatus,
                admin_notes: adminNotes,
            };

            if (newStatus === 'Completed') {
                updateData.transaction_id = transactionId;
                updateData.bank_name = bankName;
                updateData.completed_at = new Date().toISOString();
            }

            const { error } = await supabase
                .from('payout_requests')
                .update(updateData)
                .eq('id', selectedPayout.id);

            if (error) throw error;

            setIsUpdateModalOpen(false);
            fetchPayouts();
        } catch (error) {
            console.error("Error updating payout", error);
            alert("Failed to update payout.");
        }
    };

    const bankInfo = selectedPayout?.profiles?.bank_details || {};

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Farmer Payouts</h1>
                    <p className="text-slate-500">Manage vendor withdrawal requests</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {errorMsg ? (
                    <div className="p-8 text-center text-red-500">
                        <p className="font-bold mb-2">Failed to load payouts:</p>
                        <pre className="text-xs text-left bg-red-50 p-4 rounded overflow-auto">{errorMsg}</pre>
                    </div>
                ) : loading ? (
                    <div className="p-8 text-center text-slate-500">Loading payout requests...</div>
                ) : payouts.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No payout requests found.</div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Farmer</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {payouts.map((payout) => (
                                <tr key={payout.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                        {new Date(payout.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-900">
                                        <div className="font-semibold">{payout.profiles?.business_name || payout.profiles?.full_name || 'Unknown'}</div>
                                        <div className="text-xs text-slate-500">{payout.profiles?.phone_number || 'No phone'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600">
                                        ₹{payout.amount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${payout.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                                            payout.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-orange-100 text-orange-800'
                                            }`}>
                                            {payout.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleOpenUpdateModal(payout)}
                                            className="text-emerald-600 hover:text-emerald-900 font-medium hover:underline mr-4"
                                        >
                                            Manage
                                        </button>
                                        <a href={`/vendors/${payout.vendor_id}`} className="text-slate-500 hover:text-slate-700 font-medium hover:underline">
                                            Profile
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {isUpdateModalOpen && selectedPayout && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-fade-in-up">
                        <div className="p-6 border-b border-slate-100 mb-4 bg-slate-50">
                            <h2 className="text-xl font-bold text-slate-900">Process Payout</h2>
                            <p className="text-sm text-slate-500 mt-1">For {selectedPayout.profiles?.business_name || selectedPayout.profiles?.full_name}</p>
                        </div>

                        <div className="px-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            {/* Bank Details View */}
                            <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                                <h3 className="text-sm font-bold text-blue-900 mb-2">Farmer Bank Details</h3>
                                <div className="space-y-1 text-sm text-blue-800">
                                    <p><span className="font-semibold">Account Name:</span> {bankInfo?.account_holder_name || bankInfo?.accountHolderName || 'N/A'}</p>
                                    <p><span className="font-semibold">Bank:</span> {bankInfo?.bank_name || bankInfo?.bankName || 'N/A'}</p>
                                    <p><span className="font-semibold">Account No:</span> {bankInfo?.account_number || bankInfo?.accountNumber || 'N/A'}</p>
                                    <p><span className="font-semibold">IFSC:</span> {bankInfo?.ifsc_code || bankInfo?.ifscCode || 'N/A'}</p>
                                    <p><span className="font-semibold">UPI ID:</span> {bankInfo?.upi_id || bankInfo?.upiId || 'N/A'}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                                <select
                                    value={newStatus}
                                    onChange={e => setNewStatus(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>

                            {newStatus === 'Completed' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Transaction ID</label>
                                        <input
                                            type="text"
                                            value={transactionId}
                                            onChange={e => setTransactionId(e.target.value)}
                                            placeholder="e.g. UTR12345678"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Paid From Bank</label>
                                        <input
                                            type="text"
                                            value={bankName}
                                            onChange={e => setBankName(e.target.value)}
                                            placeholder="e.g. HDFC Bank Admin Account"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                                        />
                                    </div>
                                </>
                            )}

                            {newStatus === 'Rejected' && (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Reason for Rejection</label>
                                    <textarea
                                        value={adminNotes}
                                        onChange={e => setAdminNotes(e.target.value)}
                                        placeholder="Enter reason for rejecting the payout..."
                                        rows={3}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                                    />
                                </div>
                            )}

                            {newStatus === 'Completed' && (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Admin Notes (Optional)</label>
                                    <textarea
                                        value={adminNotes}
                                        onChange={e => setAdminNotes(e.target.value)}
                                        placeholder="Any internal notes"
                                        rows={2}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 mt-4">
                            <button
                                onClick={() => setIsUpdateModalOpen(false)}
                                className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdatePayout}
                                className="px-6 py-2.5 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200"
                            >
                                Save Updates
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
