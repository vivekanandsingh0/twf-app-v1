import { supabase } from "@/lib/supabase";

export const revalidate = 0;

export default async function OrdersPage() {
    const { data: orders, error } = await supabase
        .from('orders')
        .select('*, customer:profiles!user_id(full_name), vendor:profiles!vendor_id(full_name), addresses(address, city)')
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
                            <th className="px-6 py-4">Vendor</th>
                            <th className="px-6 py-4">Phone</th>
                            <th className="px-6 py-4">Address</th>
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4">Payment</th>
                            <th className="px-6 py-4">Status</th>
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
                                    {order.customer?.full_name || 'Unknown User'}
                                </td>
                                <td className="px-6 py-4 text-xs font-semibold text-emerald-700 bg-emerald-50/50">
                                    {/* @ts-ignore relationship */}
                                    {order.vendor?.full_name || 'System / Unassigned'}
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-600">
                                    {/* @ts-ignore new schema field */}
                                    {order.customer_phone || order.customer?.phone_number || 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-500 max-w-[150px] truncate" title={order.delivery_address || order.addresses?.address}>
                                    {/* @ts-ignore new schema field */}
                                    {order.delivery_address || order.addresses?.city || 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-gray-900 font-bold">
                                    ${order.total_amount?.toFixed(2)}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-gray-700">
                                            {/* @ts-ignore new schema field */}
                                            {order.payment_method || 'N/A'}
                                        </span>
                                        <span className={`text-[10px] font-bold uppercase ${order.payment_status === 'Paid' ? 'text-green-600' : 'text-orange-600'}`}>
                                            {/* @ts-ignore new schema field */}
                                            {order.payment_status || 'COD'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs font-mono">
                                    {new Date(order.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-gray-900 hover:text-green-700 font-medium text-xs border border-gray-200 px-3 py-1 rounded hover:bg-gray-50 transition-colors">
                                        View Details
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
