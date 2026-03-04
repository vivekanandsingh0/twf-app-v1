"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function CouponsClient({ initialCoupons }: { initialCoupons: any[] }) {
    const [coupons, setCoupons] = useState(initialCoupons);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<any>(null);

    // Form state
    const [code, setCode] = useState("");
    const [description, setDescription] = useState("");
    const [discountType, setDiscountType] = useState<"percentage" | "fixed">("fixed");
    const [discountValue, setDiscountValue] = useState("");
    const [minOrderValue, setMinOrderValue] = useState("0");
    const [maxDiscount, setMaxDiscount] = useState("");
    const [validUntil, setValidUntil] = useState("");
    const [usageLimit, setUsageLimit] = useState("");
    const [usageLimitPerUser, setUsageLimitPerUser] = useState("1");
    const [specificProductId, setSpecificProductId] = useState("");
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        // Fetch products for dropdown
        const fetchProducts = async () => {
            const { data } = await supabase.from('products').select('id, name').order('name');
            if (data) setProducts(data);
        };
        fetchProducts();
    }, []);

    const openModal = (coupon?: any) => {
        if (coupon) {
            setEditingCoupon(coupon);
            setCode(coupon.code);
            setDescription(coupon.description || "");
            setDiscountType(coupon.discount_type);
            setDiscountValue(coupon.discount_value.toString());
            setMinOrderValue(coupon.min_order_value?.toString() || "0");
            setMaxDiscount(coupon.max_discount?.toString() || "");
            // Format datetime for input type="datetime-local" if present
            setValidUntil(coupon.valid_until ? new Date(coupon.valid_until).toISOString().slice(0, 16) : "");
            setUsageLimit(coupon.usage_limit?.toString() || "");
            setUsageLimitPerUser(coupon.usage_limit_per_user?.toString() || "1");
            setSpecificProductId(coupon.specific_product_id || "");
            setIsActive(coupon.is_active);
        } else {
            setEditingCoupon(null);
            setCode("");
            setDescription("");
            setDiscountType("fixed");
            setDiscountValue("");
            setMinOrderValue("0");
            setMaxDiscount("");
            setValidUntil("");
            setUsageLimit("");
            setUsageLimitPerUser("1");
            setSpecificProductId("");
            setIsActive(true);
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            code: code.toUpperCase(), // Best practice
            description: description || null,
            discount_type: discountType,
            discount_value: parseFloat(discountValue),
            min_order_value: parseFloat(minOrderValue) || 0,
            max_discount: maxDiscount ? parseFloat(maxDiscount) : null,
            valid_until: validUntil ? new Date(validUntil).toISOString() : null,
            usage_limit: usageLimit ? parseInt(usageLimit) : null,
            usage_limit_per_user: parseInt(usageLimitPerUser) || 1,
            specific_product_id: specificProductId || null,
            is_active: isActive
        };

        try {
            if (editingCoupon) {
                const { data, error } = await supabase
                    .from('coupons')
                    .update(payload)
                    .eq('id', editingCoupon.id)
                    .select()
                    .single();
                if (error) throw error;
                setCoupons(coupons.map(c => c.id === data.id ? data : c));
            } else {
                const { data, error } = await supabase
                    .from('coupons')
                    .insert(payload)
                    .select()
                    .single();
                if (error) throw error;
                setCoupons([data, ...coupons]);
            }
            setIsModalOpen(false);
        } catch (error: any) {
            alert("Error saving coupon: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase.from('coupons').update({ is_active: !currentStatus }).eq('id', id);
        if (!error) {
            setCoupons(coupons.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
        }
    };

    const deleteCoupon = async (id: string) => {
        if (!confirm("Are you sure you want to delete this coupon?")) return;
        const { error } = await supabase.from('coupons').delete().eq('id', id);
        if (!error) {
            setCoupons(coupons.filter(c => c.id !== id));
        } else {
            alert("Could not delete. It might have usage history.");
        }
    };

    return (
        <div>
            {/* Top Bar */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4">
                    <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2">
                        <span className="text-xl">🎟️</span>
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Active</p>
                            <p className="text-lg font-bold text-slate-800">{coupons.filter(c => c.is_active).length}</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm shadow-emerald-200"
                >
                    <span>+ Create Coupon</span>
                </button>
            </div>

            {/* Coupons List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-widest text-slate-500 font-bold">
                                <th className="p-4">Code / Details</th>
                                <th className="p-4">Discount</th>
                                <th className="p-4">Rules</th>
                                <th className="p-4">Validity</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {coupons.map(coupon => (
                                <tr key={coupon.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="p-4">
                                        <p className="font-bold text-emerald-700 bg-emerald-50 w-max px-2 py-0.5 rounded border border-emerald-100">{coupon.code}</p>
                                        <p className="text-slate-500 mt-1 text-xs truncate max-w-[200px]">{coupon.description || "No description"}</p>
                                    </td>
                                    <td className="p-4">
                                        <p className="font-bold text-slate-800">
                                            {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`}
                                        </p>
                                        {coupon.max_discount && <p className="text-xs text-slate-500">Up to ₹{coupon.max_discount}</p>}
                                    </td>
                                    <td className="p-4">
                                        <p className="text-slate-700">Min Order: <span className="font-semibold text-slate-900">₹{coupon.min_order_value}</span></p>
                                        <p className="text-xs text-slate-500">Limit: {coupon.usage_limit_per_user} per user</p>
                                    </td>
                                    <td className="p-4">
                                        {coupon.valid_until ? (
                                            <div>
                                                <p className="text-slate-700">{new Date(coupon.valid_until).toLocaleDateString()}</p>
                                                <p className="text-xs text-slate-500">{new Date(coupon.valid_until).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        ) : (
                                            <p className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded w-max text-xs">Never Expires</p>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => toggleStatus(coupon.id, coupon.is_active)}
                                            className={`px-3 py-1 rounded-full text-xs font-bold ${coupon.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}
                                        >
                                            {coupon.is_active ? "Active" : "Disabled"}
                                        </button>
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <button
                                            onClick={() => openModal(coupon)}
                                            className="text-slate-400 hover:text-blue-600 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Edit"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => deleteCoupon(coupon.id)}
                                            className="text-slate-400 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {coupons.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                                        No coupons found. Create your first discount!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h2 className="text-xl font-bold text-slate-800">{editingCoupon ? "Edit Coupon" : "Create New Coupon"}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-6">

                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Coupon Code *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. SAVE50"
                                        className="w-full border border-slate-300 rounded-lg p-2.5 uppercase font-mono tracking-wider focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        required
                                        value={code}
                                        onChange={e => setCode(e.target.value)}
                                        readOnly={!!editingCoupon} // Usually don't allow changing code after creation
                                    />
                                    {editingCoupon && <p className="text-xs text-slate-400 mt-1">Code cannot be changed after creation.</p>}
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                                    <input
                                        type="text"
                                        placeholder="Internal note or display text"
                                        className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                    />
                                </div>

                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Discount Type *</label>
                                    <select
                                        className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        value={discountType}
                                        onChange={e => setDiscountType(e.target.value as "percentage" | "fixed")}
                                    >
                                        <option value="fixed">Fixed Amount (₹)</option>
                                        <option value="percentage">Percentage (%)</option>
                                    </select>
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">
                                        Discount Value *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        step="0.01"
                                        className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        required
                                        value={discountValue}
                                        onChange={e => setDiscountValue(e.target.value)}
                                    />
                                </div>

                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Min Order Value (₹)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        value={minOrderValue}
                                        onChange={e => setMinOrderValue(e.target.value)}
                                    />
                                </div>
                                {discountType === 'percentage' && (
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Max Discount Cap (₹) (Optional)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            value={maxDiscount}
                                            onChange={e => setMaxDiscount(e.target.value)}
                                            placeholder="Leave empty for uncapped"
                                        />
                                    </div>
                                )}

                                <div className="col-span-2 sm:col-span-1 border-t border-slate-100 pt-4">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Usage Limit (Global)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        value={usageLimit}
                                        onChange={e => setUsageLimit(e.target.value)}
                                        placeholder="Total times it can be used"
                                    />
                                </div>
                                <div className="col-span-2 sm:col-span-1 border-t border-slate-100 pt-4">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Per-User Limit</label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        value={usageLimitPerUser}
                                        onChange={e => setUsageLimitPerUser(e.target.value)}
                                        placeholder="Default: 1"
                                    />
                                </div>

                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Valid Until (Expiry Date)</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-700"
                                        value={validUntil}
                                        onChange={e => setValidUntil(e.target.value)}
                                    />
                                    <p className="text-xs text-slate-400 mt-1">Leave blank for no expiry</p>
                                </div>

                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Specific Product (Optional)</label>
                                    <select
                                        className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        value={specificProductId}
                                        onChange={e => setSpecificProductId(e.target.value)}
                                    >
                                        <option value="">-- Apply to any product --</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-span-2">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isActive}
                                            onChange={e => setIsActive(e.target.checked)}
                                            className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                                        />
                                        <span className="font-bold text-slate-700">Coupon is Active</span>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50"
                                >
                                    {loading ? "Saving..." : "Save Coupon"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

