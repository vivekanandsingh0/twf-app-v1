
import { NextResponse } from 'next/server';
import { localDb } from '@/lib/local-db';

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        console.log(`Admin API: Updating Order ${id}`, body);

        // 1. Get current order state
        const { data: allOrders } = await localDb.orders.getAll();
        const currentOrder = allOrders.find((o: any) => o.id === id);

        if (!currentOrder) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404, headers });
        }

        // 2. Check if we need to deduct stock (Transitioning TO Delivered)
        if (body.status === 'Delivered' && currentOrder.status !== 'Delivered') {
            console.log(`Order ${id} marked as Delivered. Deducting stock...`);
            const items = currentOrder.items || [];
            const vendorId = currentOrder.vendor_id;

            if (items.length > 0 && vendorId) {
                const { data: allProducts } = await localDb.products.getAll();
                // Filter products for this vendor to optimize/ensure correctness
                const vendorProducts = allProducts.filter((p: any) => String(p.vendor_id) === String(vendorId));

                for (const item of items) {
                    // Find product by ID first (if available), else Name
                    const product = vendorProducts.find((p: any) =>
                        (item.productId && p.id === item.productId) ||
                        (p.name === item.productName) // Fallback to name
                    );

                    if (product) {
                        const newStock = Math.max(0, product.stock - (Number(item.quantity) || 0));
                        console.log(`Updating stock for ${product.name}: ${product.stock} -> ${newStock}`);
                        await localDb.products.update(product.id, { stock: newStock });
                    } else {
                        console.warn(`Product not found for stock deduction: ${item.productName}`);
                    }
                }
            }
        }

        // 3. Update the order
        const updated = await localDb.orders.update(id, body);
        return NextResponse.json(updated, { headers });
    } catch (e) {
        console.error("Admin API Error:", e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers });
    }
}
