import { db } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { data: allProfiles } = await db.users.getAll();
    const user = allProfiles?.find((u: any) => u.id === id);

    if (!user) notFound();

    return (
        <div className="max-w-4xl mx-auto py-8">
            <Link href="/users" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-600 mb-6 transition-colors">
                ← Back to Customers
            </Link>

            {/* Profile Header */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                <div className="h-32 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
                <div className="px-8 pb-8 relative">
                    <div className="absolute -top-12 left-8 w-24 h-24 rounded-2xl bg-white p-1 shadow-md">
                        <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-400">
                            {user.full_name?.charAt(0) || 'U'}
                        </div>
                    </div>
                    <div className="ml-28 pt-2 flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{user.full_name || 'Anonymous User'}</h1>
                            <p className="text-slate-500 font-mono text-sm mt-1">{user.phone_number}</p>
                            <div className="flex gap-2 mt-3">
                                <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                                    {user.user_type}
                                </span>
                                <span className="px-2.5 py-1 rounded-md bg-slate-50 text-slate-600 text-xs font-medium">
                                    Joined {new Date(user.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        <Link href={`/users/${id}/manage`} className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-colors shadow-sm">
                            Manage User
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Personal Info */}
                <div className="md:col-span-2 space-y-8">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-slate-900">Personal Information</h3>
                            <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700">Edit</button>
                        </div>
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
                    </div>

                    {/* Address - Placeholder (requires DB expansion) */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-slate-900">Addresses</h3>
                            <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700">Manage</button>
                        </div>
                        <div className="p-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                            <p className="text-slate-400 text-sm">No addresses saved yet.</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <h3 className="font-bold text-sm text-slate-900 mb-4">Activity Overview</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                                <span className="text-sm font-medium text-emerald-800">Active Orders</span>
                                <span className="text-lg font-bold text-emerald-700">0</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50 border border-blue-100">
                                <span className="text-sm font-medium text-blue-800">Total Orders</span>
                                <span className="text-lg font-bold text-blue-700">0</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg bg-purple-50 border border-purple-100">
                                <span className="text-sm font-medium text-purple-800">Total Spent</span>
                                <span className="text-lg font-bold text-purple-700">₹0</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
