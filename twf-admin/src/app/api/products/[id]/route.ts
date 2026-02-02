
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
        const updated = await localDb.products.update(id, body);
        return NextResponse.json(updated, { headers });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to update' }, { status: 500, headers });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await localDb.products.delete(id);
        return NextResponse.json({ success: true }, { headers });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500, headers });
    }
}
