
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
    const data = await localDb.profiles.getAll();
    return NextResponse.json(data, { headers });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("Admin API: Received Profile Create Request", body);

        const newProfile = {
            id: body.id || `user_${Date.now()}`,
            full_name: body.full_name || 'Anonymous',
            phone_number: body.phone_number,
            user_type: body.user_type || 'User',
            created_at: new Date().toISOString(),
            ...body
        };
        const saved = await localDb.profiles.create(newProfile);
        return NextResponse.json(saved, { headers });
    } catch (e) {
        console.error("Admin API Error:", e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers });
    }
}
