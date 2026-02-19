'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/db';

export default function SupportPage() {
    const [activeTab, setActiveTab] = useState<'user' | 'farmer'>('user');
    const [farmerSupportNumber, setFarmerSupportNumber] = useState('');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        const { data, error } = await db.settings.get('vendor_support_phone');
        if (data) {
            setFarmerSupportNumber(data.value);
        }
        setLoading(false);
    };

    const handleSaveFarmerSupport = async () => {
        setSaving(true);
        try {
            const { error } = await db.settings.set('vendor_support_phone', farmerSupportNumber);
            if (error) throw error;
            alert('Support number updated successfully!');
        } catch (e: any) {
            console.error(e);
            alert('Failed to update number: ' + e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Support Management</h1>
                <p className="text-slate-500 mt-1">Manage support contacts for users and farmers</p>
            </header>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-h-[500px]">
                {/* Tabs */}
                <div className="flex border-b border-slate-100">
                    <button
                        onClick={() => setActiveTab('user')}
                        className={`flex-1 py-4 text-sm font-bold transition-all ${activeTab === 'user' ? 'text-emerald-600 border-b-2 border-emerald-500 bg-emerald-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                    >
                        User Support
                    </button>
                    <button
                        onClick={() => setActiveTab('farmer')}
                        className={`flex-1 py-4 text-sm font-bold transition-all ${activeTab === 'farmer' ? 'text-emerald-600 border-b-2 border-emerald-500 bg-emerald-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                    >
                        Farmer Support
                    </button>
                </div>

                <div className="p-8">
                    {loading && (
                        <div className="flex justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                        </div>
                    )}

                    {!loading && activeTab === 'farmer' && (
                        <div className="max-w-xl mx-auto animate-fade-in-down">
                            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-6 flex items-start gap-3">
                                <span className="text-emerald-600 text-lg">💡</span>
                                <div>
                                    <h4 className="font-bold text-emerald-800 text-sm">Vendor App Integration</h4>
                                    <p className="text-emerald-600 text-xs mt-1">
                                        Wait for vendors to reload their app to see the updated support number.
                                    </p>
                                </div>
                            </div>

                            <h2 className="text-xl font-bold text-slate-800 mb-6">Vendor App Support</h2>

                            <div className="mb-6">
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Support Phone Number
                                </label>
                                <p className="text-xs text-slate-500 mb-3">
                                    This number will be dialed when vendors click "Support" in their app profile.
                                </p>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">📞</span>
                                    <input
                                        type="tel"
                                        value={farmerSupportNumber}
                                        onChange={(e) => setFarmerSupportNumber(e.target.value)}
                                        placeholder="+91 99999 99999"
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all font-bold text-slate-700"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSaveFarmerSupport}
                                disabled={saving}
                                className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg shadow-emerald-200 transition-all ${saving ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98]'}`}
                            >
                                {saving ? 'Saving...' : 'Update Number'}
                            </button>
                        </div>
                    )}

                    {!loading && activeTab === 'user' && (
                        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-down">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-4xl shadow-inner border border-slate-100">
                                🚧
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">User Support Section</h3>
                            <p className="text-slate-500 mt-2 max-w-sm">
                                This section is currently under development. Configure user support settings here soon.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
