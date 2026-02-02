
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

export async function GET() {
    const data = await localDb.orders.getAll();
    return NextResponse.json(data, { headers });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("Admin API: Received Order Create Request", body);

        const newOrder = {
            id: body.id || `ORD-${Date.now()}`,
            status: 'Pending',
            created_at: new Date().toISOString(),
            ...body
        };
        const saved = await localDb.orders.create(newOrder);
        return NextResponse.json(saved, { headers });
    } catch (e) {
        console.error("Admin API Error:", e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers });
    }
}
