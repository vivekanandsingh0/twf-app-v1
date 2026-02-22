'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function DeliverySettingsPage() {
    const [minOrder, setMinOrder] = useState('200');
    const [deliveryFee, setDeliveryFee] = useState('30');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('app_settings')
                .select('*')
                .eq('key', 'delivery_charges')
                .single();

            if (data && !error) {
                const val = data.value;
                setMinOrder(val.min_order_for_free_delivery?.toString() || '200');
                setDeliveryFee(val.delivery_fee?.toString() || '30');
            }
        } catch (e) {
            console.error('Failed to load settings', e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        try {
            const { error } = await supabase
                .from('app_settings')
                .upsert({
                    key: 'delivery_charges',
                    value: {
                        min_order_for_free_delivery: parseFloat(minOrder) || 200,
                        delivery_fee: parseFloat(deliveryFee) || 30,
                    },
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e) {
            console.error('Failed to save settings', e);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl">
            {/* Header */}
            <div className="flex items-center gap-3">
                <a href="/settings" className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                    ←
                </a>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Delivery Charges</h1>
                    <p className="text-slate-500 text-sm mt-1">Configure delivery fees and free delivery thresholds</p>
                </div>
            </div>

            {/* Settings Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
                {/* Info Banner */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex gap-3">
                    <div className="text-2xl">🚚</div>
                    <div>
                        <p className="text-emerald-800 font-semibold text-sm">How it works</p>
                        <p className="text-emerald-700 text-sm mt-1">
                            If a user&apos;s cart subtotal is <strong>below</strong> the minimum order amount, they&apos;ll be charged the delivery fee.
                            Orders <strong>above</strong> the threshold get <strong>free delivery</strong>.
                        </p>
                    </div>
                </div>

                {/* Minimum Order Amount */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Minimum Order for Free Delivery (₹)
                    </label>
                    <p className="text-slate-400 text-xs mb-3">
                        Orders above this amount will get free delivery
                    </p>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                        <input
                            type="number"
                            value={minOrder}
                            onChange={(e) => setMinOrder(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-slate-800 font-medium text-lg focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-all"
                            placeholder="200"
                        />
                    </div>
                </div>

                {/* Delivery Fee */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Delivery Fee (₹)
                    </label>
                    <p className="text-slate-400 text-xs mb-3">
                        Amount charged when order is below the minimum
                    </p>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                        <input
                            type="number"
                            value={deliveryFee}
                            onChange={(e) => setDeliveryFee(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-slate-800 font-medium text-lg focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-all"
                            placeholder="30"
                        />
                    </div>
                </div>

                {/* Preview */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                    <p className="text-sm font-semibold text-slate-600">Preview for Users</p>
                    <div className="flex items-center gap-2">
                        <span className="text-lg">📦</span>
                        <p className="text-sm text-slate-600">
                            Cart below <strong>₹{minOrder || '0'}</strong> →
                            <span className="text-red-500 font-semibold ml-1">₹{deliveryFee || '0'} delivery fee</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-lg">🎉</span>
                        <p className="text-sm text-slate-600">
                            Cart above <strong>₹{minOrder || '0'}</strong> →
                            <span className="text-emerald-600 font-semibold ml-1">FREE delivery!</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <button
                onClick={handleSave}
                disabled={saving}
                className={`w-full py-4 rounded-xl font-bold text-white text-base transition-all duration-300 ${saved
                        ? 'bg-emerald-500 shadow-lg shadow-emerald-200'
                        : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200'
                    } ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
                {saving ? 'Saving...' : saved ? '✓ Settings Saved!' : 'Save Changes'}
            </button>
        </div>
    );
}
