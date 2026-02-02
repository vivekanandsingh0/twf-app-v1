
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import VendorManagement from "./VendorManagement";

export const revalidate = 0;

export default async function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch user profile (vendor)
    const { data: profiles, error } = await db.vendors.getAll();
    const vendor = profiles?.find((p: any) => p.id === id);

    if (!vendor) {
        notFound();
    }

    return <VendorManagement initialVendor={vendor} />;
}
