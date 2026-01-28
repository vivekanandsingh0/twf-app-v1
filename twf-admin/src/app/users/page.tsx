import { supabase } from "@/lib/supabase";

// Force dynamic rendering to ensure fresh data
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function UsersPage() {
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return <div className="text-red-500">Error loading users: {error.message}</div>;
    }

    return (
        <div>
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Users</h1>
                <p className="text-gray-500 mt-1">Platform user base</p>
            </header>

            {/* RLS Warning */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                <span className="text-orange-600 text-xl">⚠️</span>
                <div>
                    <h4 className="text-orange-800 font-bold text-sm">Row Level Security (RLS) Enabled</h4>
                    <p className="text-orange-700 text-sm mt-1">
                        If you see no users here, it's because RLS policies prevent the anonymous client from viewing user data.
                        You must use a Service Role Key or log in as a super admin to see all users.
                    </p>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm text-gray-500">
                    <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-700 font-semibold">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Phone</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {profiles?.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                            {user.full_name?.charAt(0) || 'U'}
                                        </div>
                                        <div className="flex flex-col">
                                            <span>{user.full_name || 'Anonymous User'}</span>
                                            <span className="text-xs text-gray-400">{user.gender || '-'}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span>{user.phone_number || 'N/A'}</span>
                                        <span className="text-xs text-gray-400">{user.dob || ''}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${user.user_type === 'Vendor' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {user.user_type || 'User'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-500">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                        {profiles?.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                    No users found or accessible.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
