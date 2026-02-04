'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserInfoCardProps {
    user: any;
}

export default function UserInfoCard({ user }: UserInfoCardProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        full_name: user.full_name || '',
        phone_number: user.phone_number || '',
        gender: user.gender || '',
        dob: user.dob || ''
    });

    const handleSave = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/profiles/${user.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            setIsEditing(false);
            router.refresh(); // Refresh server component data
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-slate-900">Personal Information</h3>
                {isEditing ? (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="text-sm font-medium text-slate-500 hover:text-slate-700"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="text-sm font-bold text-emerald-600 hover:text-emerald-700"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                    >
                        Edit
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                        <input
                            type="text"
                            className="w-full text-base font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                        <input
                            type="text"
                            className="w-full text-base font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                            value={formData.phone_number}
                            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Gender</label>
                        <select
                            className="w-full text-base font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date of Birth</label>
                        <input
                            type="text"
                            className="w-full text-base font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                            value={formData.dob}
                            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                            placeholder="e.g. 10 August 1999"
                        />
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                        <p className="font-medium text-slate-700">{user.full_name || '-'}</p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Phone Number</label>
                        <p className="font-medium text-slate-700 font-mono">{user.phone_number || '-'}</p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Gender</label>
                        <p className="font-medium text-slate-700 capitalize">{user.gender || '-'}</p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date of Birth</label>
                        <p className="font-medium text-slate-700">{user.dob || '-'}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
