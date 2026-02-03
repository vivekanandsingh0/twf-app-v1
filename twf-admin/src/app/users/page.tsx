import { db } from "@/lib/db";

// Force dynamic rendering to ensure fresh data
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
    const { data: allProfiles, error } = await db.users.getAll();

    // Filter only Users (Customers)
    const profiles = allProfiles?.filter((u: any) => u.user_type === 'User');

    if (error) {
        return <div className="text-red-500">Error loading customers: {(error as any).message || 'Unknown error'}</div>;
    }

    return (
        <div>
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Customers</h1>
                    <p className="text-gray-500 mt-1">Manage platform users</p>
                </div>
            </header>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm text-gray-500">
                    <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-700 font-semibold">
                        <tr>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Contact</th>
                            <th className="px-6 py-4">Joined</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {profiles?.map((user: any) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
                                            {user.full_name?.charAt(0) || 'U'}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-base">{user.full_name || 'Anonymous User'}</span>
                                            <span className="text-xs text-gray-400 capitalize">{user.gender || '-'}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-mono text-slate-600">{user.phone_number || 'N/A'}</span>
                                        <span className="text-xs text-gray-400">{user.dob || ''}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-500">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <a href={`/users/${user.id}`} className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                                            View Profile
                                        </a>
                                        <a href={`/users/${user.id}/manage`} className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-black transition-colors">
                                            Manage Profile
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {profiles?.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                    <p className="text-lg">No customers found.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
