import { supabase } from "@/lib/supabase";

export const revalidate = 0;

export default async function OrdersPage() {
    const { data: orders, error } = await supabase
        .from('orders')
        .select('*, profiles(full_name), addresses(address, city)')
        .order('created_at', { ascending: false });

    if (error) {
        return <div className="text-red-500">Error loading orders: {error.message}</div>;
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Delivered': return 'bg-green-100 text-green-800';
            case 'Shipped': return 'bg-blue-100 text-blue-800';
            case 'Confirmed': return 'bg-purple-100 text-purple-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <div>
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Orders</h1>
                <p className="text-gray-500 mt-1">Track and manage deliveries</p>
            </header>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm text-gray-500">
                    <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-700 font-semibold">
                        <tr>
                            <th className="px-6 py-4">Order ID</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Location</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders?.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                    #{order.id.slice(0, 8)}...
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    {/* @ts-ignore relationship */}
                                    {order.profiles?.full_name || 'Unknown User'}
                                </td>
                                <td className="px-6 py-4 text-gray-900 font-bold">
                                    ${order.total_amount?.toFixed(2)}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {/* @ts-ignore relationship */}
                                    {order.addresses?.city || 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-xs font-mono">
                                    {new Date(order.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-gray-900 hover:text-green-700 font-medium text-xs border border-gray-200 px-3 py-1 rounded hover:bg-gray-50 transition-colors">
                                        Manage
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {orders?.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                    No orders found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
