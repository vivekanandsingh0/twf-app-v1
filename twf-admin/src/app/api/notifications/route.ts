import { NextResponse } from 'next/server';
import { localDb } from '@/lib/local-db';

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers });
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userType = searchParams.get('userType'); // 'User' | 'Vendor'

    const notifications = await localDb.notifications.getAll();

    // If Admin request, return all
    if (searchParams.get('admin') === 'true') {
        return NextResponse.json(notifications, { headers });
    }

    // Filter Logic
    const filtered = notifications.filter((n: any) => {
        // Notification for specific user
        if (n.targetType === 'Specific' && n.targetId === userId) return true;

        // Broadcasts
        if (n.targetType === 'All') return true;
        if (n.targetType === 'AllUsers' && userType === 'User') return true;
        if (n.targetType === 'AllVendors' && userType === 'Vendor') return true;

        return false;
    });

    return NextResponse.json(filtered, { headers });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const newNotification = {
            id: `notif_${Date.now()}`,
            title: body.title,
            body: body.body,
            type: body.type || 'info', // info, alert, promo
            targetType: body.targetType, // Specific, All, AllUsers, AllVendors
            targetId: body.targetId, // userId if Specific
            promoCode: body.promoCode,
            createdAt: new Date().toISOString(),
            read: false
        };

        const saved = await localDb.notifications.create(newNotification);
        return NextResponse.json(saved, { status: 201, headers });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to create notification' }, { status: 500, headers });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400, headers });

        await localDb.notifications.delete(id);
        return NextResponse.json({ success: true }, { headers });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500, headers });
    }
}
