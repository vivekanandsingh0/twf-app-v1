
import { NextResponse } from 'next/server';
import { localDb } from '@/lib/local-db';

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers });
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendor_id');

    const products = await localDb.products.getAll();

    // If filtering by specific vendor (e.g. Vendor App inventory), just return their products regardless of status
    if (vendorId) {
        const filtered = products.filter((p: any) => String(p.vendor_id) === String(vendorId));
        return NextResponse.json(filtered, { headers });
    }

    // For public feed (Market), only show products from ACTIVE vendors
    const vendors = await localDb.vendors.getAll();
    const activeVendorIds = new Set(
        vendors
            .filter((v: any) => v.shop_status === 'Active' || !v.shop_status) // Default to Active if undefined
            .map((v: any) => String(v.id))
    );

    const activeProducts = products.filter((p: any) => activeVendorIds.has(String(p.vendor_id)));

    return NextResponse.json(activeProducts, { headers });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("Admin API: Creating Product", body);

        const newProduct = {
            id: body.id || `prod_${Date.now()}`,
            created_at: new Date().toISOString(),
            ...body
        };

        const saved = await localDb.products.create(newProduct);
        return NextResponse.json(saved, { headers });
    } catch (e) {
        console.error("Admin API Error:", e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers });
    }
}
