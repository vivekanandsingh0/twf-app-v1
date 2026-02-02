
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import InventoryList from "./InventoryList";

export const revalidate = 0;

export default async function VendorInventoryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // 1. Fetch Vendor
    const { data: vendors } = await db.vendors.getAll();
    const vendor = vendors?.find((p: any) => p.id === id);

    if (!vendor) {
        notFound();
    }

    // 2. Fetch Products
    const { data: allProducts } = await db.products.getAll();
    const vendorProducts = allProducts?.filter((p: any) => String(p.vendor_id) === String(id)) || [];

    return (
        <div className="max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Link href={`/vendors/${id}/manage`} className="text-slate-500 text-sm hover:text-slate-800">&larr; Back to Dashboard</Link>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-500 text-sm">{vendor.full_name}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Manage Inventory</h1>
                    <p className="text-slate-500 text-sm mt-1">Add, remove, or update products for this vendor.</p>
                </div>
            </div>

            {/* Inventory Manager Component */}
            <InventoryList initialProducts={vendorProducts} vendorId={id} />
        </div>
    );
}
