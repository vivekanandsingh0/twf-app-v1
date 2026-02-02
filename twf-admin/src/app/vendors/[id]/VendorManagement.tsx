"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function VendorManagement({ initialVendor }: { initialVendor: any }) {
    const [vendor, setVendor] = useState(initialVendor);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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

                {/* Right Column: Detailed Info */}
                <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm lg:col-span-2 space-y-6">
                    <div>
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
                </div>
            </div>

        </div>
    );
}
