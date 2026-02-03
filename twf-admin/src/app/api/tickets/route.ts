
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
    // Optional: filter by user_id
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    const tickets = await localDb.tickets.getAll();

    if (userId) {
        // Handle various user ID formats if necessary, but exact match is best
        const filtered = tickets.filter((t: any) => t.userId === userId || t.userId === `user_${userId}` || `user_${t.userId}` === userId);
        return NextResponse.json(filtered, { headers });
    }

    return NextResponse.json(tickets, { headers });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const newTicket = {
            id: `TICKET-${Date.now()}`,
            userId: body.userId,
            subject: body.subject,
            status: 'Open', // Open, Pending, Resolved, Closed
            created_at: new Date().toISOString(),
            last_updated: new Date().toISOString(),
            messages: [
                {
                    sender: 'User',
                    text: body.message,
                    timestamp: new Date().toISOString()
                }
            ]
        };

        const saved = await localDb.tickets.create(newTicket);
        return NextResponse.json(saved, { headers });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500, headers });
    }
}
