import { db } from "@/lib/db";
import OrdersDashboard from "./OrdersDashboard";

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
    const { data: orders, error } = await db.orders.getAll();

    if (error) {
        return <div className="p-8 text-red-500 bg-red-50 rounded-xl border border-red-100">Error loading orders: {error.message}</div>;
    }

    return (
        <div>
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Orders Management</h1>
                <p className="text-slate-500 mt-1">Track, analyze and manage all orders across vendors</p>
            </header>

            <OrdersDashboard orders={orders || []} />
        </div>
    );
}
