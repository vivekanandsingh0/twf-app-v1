import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import OrderManagement from "./OrderManagement";

export const revalidate = 0;

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { data: order, error } = await db.orders.getById(id);

    if (error || !order) {
        notFound();
    }

    return <OrderManagement initialOrder={order} />;
}
