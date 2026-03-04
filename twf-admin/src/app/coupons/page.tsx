import { db } from "@/lib/db";
import CouponsClient from "./CouponsClient";

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function CouponsPage() {
    const { data: coupons, error } = await db.coupons.getAll();

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Coupons & Offers</h1>
                <p className="text-slate-500 mt-1">Manage discount codes, minimum order requirements, and expiry dates.</p>
            </header>

            {error ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg">Error loading coupons: {error.message}</div>
            ) : (
                <CouponsClient initialCoupons={coupons || []} />
            )}
        </div>
    );
}
