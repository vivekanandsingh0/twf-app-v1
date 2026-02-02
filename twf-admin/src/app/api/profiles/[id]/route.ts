
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

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    // For vendors, we look in profiles
    const profiles = await localDb.profiles.getAll();
    const vendor = profiles.find((p: any) => p.id === id); // id could be user id or vendor id
    // OR vendors list? Currently vendors are just profiles with type 'Vendor'.

    // Check if we have extended vendor data in `localDb.vendors`?
    // Wait, localDb.vendors.getAll() returns profiles.

    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404, headers });
    return NextResponse.json(vendor, { headers });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        console.log(`Admin API: Updating Profile ${id}`, body);

        // We need a method to update a profile in localDb
        // Adding it to localDb logic below
        const profiles = await localDb.profiles.getAll();
        const index = profiles.findIndex((p: any) => p.id === id);

        // If not found by ID, maybe it's the "hardcoded" vendor for demo purposes?
        // Let's create if not exists or return 404.

        let updatedProfile;
        if (index === -1) {
            // Create new if we treat this ID as authoritative
            console.log("Profile not found, creating new one for sync...");
            updatedProfile = { id, user_type: 'Vendor', created_at: new Date().toISOString(), ...body };
            await localDb.profiles.create(updatedProfile);
        } else {
            profiles[index] = { ...profiles[index], ...body };
            // We need to write back. Since getAll returns a value, we can't mutate directly without a write method.
            // Accessing the implementation detail of localDb to update.
            // Adding `update` to localDb.profiles in next step.
            await localDb.profiles.update(id, body);
            updatedProfile = profiles[index];
        }

        return NextResponse.json(updatedProfile || body, { headers });
    } catch (e) {
        console.error("Admin API Error:", e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers });
    }
}
