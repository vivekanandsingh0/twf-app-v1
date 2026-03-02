"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface DeliveryPartner {
    id: string;
    name: string;
    phone: string;
    photo_url: string | null;
    created_at: string;
}

const getInitials = (name: string) =>
    name.trim().split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('');

export default function VendorManagement({ initialVendor }: { initialVendor: any }) {
    const [vendor, setVendor] = useState(initialVendor);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>([]);
    const [partnersLoading, setPartnersLoading] = useState(true);
    const [vendorRating, setVendorRating] = useState<number | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        full_name: vendor.full_name || '',
        businessName: vendor.businessName || vendor.full_name || '',
        phone_number: vendor.phone_number || '',
        bio: vendor.bio || '',
        address: vendor.address || '',
        farmSize: vendor.farmSize || '',
        experience: vendor.experience || '',
        gender: vendor.gender || '',
        dob: vendor.dob || ''
    });

    const router = useRouter();

    // Fetch delivery partners for this vendor
    useEffect(() => {
        (async () => {
            setPartnersLoading(true);
            try {
                const { data, error } = await supabase
                    .from('delivery_partners')
                    .select('*')
                    .eq('vendor_id', vendor.id)
                    .order('created_at', { ascending: false });
                if (!error) setDeliveryPartners(data || []);
            } catch (e) {
                console.error('Failed to load delivery partners:', e);
            } finally {
                setPartnersLoading(false);
            }
        })();
    }, [vendor.id]);

    // Fetch average rating for this vendor via RPC to bypass RLS
    useEffect(() => {
        (async () => {
            try {
                const { data, error } = await supabase.rpc('get_admin_vendor_ratings');

                if (!error && data) {
                    const match = data.find((row: any) => row.vendor_id === vendor.id);
                    if (match && match.rating) {
                        setVendorRating(Number(match.rating));
                    } else {
                        setVendorRating(0);
                    }
                }
            } catch (e) {
                console.error("Failed to fetch product rating via RPC:", e);
            }
        })();
    }, [vendor.id]);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/profiles/${vendor.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const updated = await res.json();
                setVendor(updated);
                setIsEditing(false);
                alert("Vendor profile updated!");
                router.refresh();
            } else {
                alert("Failed to update vendor");
            }
        } catch (e) {
            console.error(e);
            alert("Error updating vendor");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <Link href="/vendors" className="text-slate-500 text-sm hover:text-slate-800 mb-2 inline-block">&larr; Back to Vendors</Link>
                    <h1 className="text-3xl font-bold text-slate-900">Vendor Profile</h1>
                </div>
                <div className="flex gap-2">
                    {isEditing ? (
                        <>
                            <button onClick={() => setIsEditing(false)} className="bg-white border border-slate-200 text-slate-700 font-bold px-4 py-2 rounded-lg hover:bg-slate-50">
                                Cancel
                            </button>
                            <button onClick={handleSave} disabled={isLoading} className="bg-emerald-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-emerald-700">
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="bg-slate-900 text-white font-bold px-4 py-2 rounded-lg hover:bg-slate-800">
                            Manage / Edit
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Basic Info */}
                <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm lg:col-span-1 h-fit">
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center text-3xl text-emerald-600 font-bold mb-4">
                            {formData.businessName.charAt(0)}
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">{formData.businessName}</h2>
                        <p className="text-slate-500 text-sm mt-1">Vendor ID: {vendor.id}</p>

                        {vendorRating !== null && (
                            <div className="flex items-center justify-center mt-3 bg-amber-50 px-4 py-2 rounded-full border border-amber-200">
                                <span className="text-amber-500 text-xl mr-1">★</span>
                                <span className="text-slate-900 font-bold text-lg">{vendorRating > 0 ? vendorRating : 'No ratings'}</span>
                                {vendorRating > 0 && <span className="text-slate-600 text-sm ml-1 font-medium">Avg Rating</span>}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase">Owner Name</label>
                            {isEditing ? (
                                <input
                                    className="w-full p-2 border border-slate-300 rounded font-medium mt-1"
                                    value={formData.full_name}
                                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                />
                            ) : (
                                <p className="font-bold text-slate-700">{vendor.full_name}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase">Phone</label>
                            {isEditing ? (
                                <input
                                    className="w-full p-2 border border-slate-300 rounded font-medium mt-1"
                                    value={formData.phone_number}
                                    onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                                />
                            ) : (
                                <p className="font-bold text-slate-700">{vendor.phone_number}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase">Gender</label>
                            {isEditing ? (
                                <input
                                    className="w-full p-2 border border-slate-300 rounded font-medium mt-1"
                                    value={formData.gender}
                                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                />
                            ) : (
                                <p className="font-bold text-slate-700">{vendor.gender || 'N/A'}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase">DOB</label>
                            {isEditing ? (
                                <input
                                    className="w-full p-2 border border-slate-300 rounded font-medium mt-1"
                                    value={formData.dob}
                                    placeholder="DD Month YYYY"
                                    onChange={e => setFormData({ ...formData, dob: e.target.value })}
                                />
                            ) : (
                                <p className="font-bold text-slate-700">{vendor.dob || 'N/A'}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Business Details */}
                    <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Business Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Business Name</label>
                                {isEditing ? (
                                    <input
                                        className="w-full p-2 border border-slate-300 rounded font-medium mt-1"
                                        value={formData.businessName}
                                        onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                                    />
                                ) : (
                                    <p className="font-medium text-slate-700">{vendor.businessName || 'N/A'}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Bio / Description</label>
                                {isEditing ? (
                                    <textarea
                                        className="w-full p-2 border border-slate-300 rounded font-medium mt-1 min-h-[80px]"
                                        value={formData.bio}
                                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                    />
                                ) : (
                                    <p className="font-medium text-slate-700">{vendor.bio || 'N/A'}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Farm Size</label>
                                {isEditing ? (
                                    <input
                                        className="w-full p-2 border border-slate-300 rounded font-medium mt-1"
                                        value={formData.farmSize}
                                        onChange={e => setFormData({ ...formData, farmSize: e.target.value })}
                                    />
                                ) : (
                                    <p className="font-medium text-slate-700">{vendor.farmSize || 'N/A'}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Experience</label>
                                {isEditing ? (
                                    <input
                                        className="w-full p-2 border border-slate-300 rounded font-medium mt-1"
                                        value={formData.experience}
                                        onChange={e => setFormData({ ...formData, experience: e.target.value })}
                                    />
                                ) : (
                                    <p className="font-medium text-slate-700">{vendor.experience || 'N/A'}</p>
                                )}
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className="text-xs font-bold text-slate-400 uppercase">Address</label>
                                {isEditing ? (
                                    <input
                                        className="w-full p-2 border border-slate-300 rounded font-medium mt-1"
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    />
                                ) : (
                                    <p className="font-medium text-slate-700">{vendor.address || 'N/A'}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Delivery Partners Section ──────────────────────────────── */}
                    <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                            <h3 className="text-lg font-bold text-slate-800">🚴 Delivery Partners</h3>
                            <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                                {deliveryPartners.length} partner{deliveryPartners.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        {partnersLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : deliveryPartners.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="text-4xl mb-2">🚲</div>
                                <p className="text-slate-500 text-sm">No delivery partners added yet.</p>
                                <p className="text-slate-400 text-xs mt-1">Partners added by this vendor will appear here.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {deliveryPartners.map(partner => (
                                    <div key={partner.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        {/* Avatar */}
                                        {partner.photo_url ? (
                                            <img
                                                src={partner.photo_url}
                                                alt={partner.name}
                                                className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-emerald-200"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                                {getInitials(partner.name)}
                                            </div>
                                        )}
                                        {/* Info */}
                                        <div className="min-w-0">
                                            <p className="font-bold text-slate-800 truncate">{partner.name}</p>
                                            <p className="text-sm text-slate-500 flex items-center gap-1">
                                                <span>📞</span>
                                                <span>{partner.phone}</span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>

        </div>
    );
}
