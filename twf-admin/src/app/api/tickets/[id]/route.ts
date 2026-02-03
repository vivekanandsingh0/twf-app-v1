
import { NextResponse } from 'next/server';
import { localDb } from '@/lib/local-db';

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers });
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const ticket = await localDb.tickets.getById(id);

    if (!ticket) {
        return NextResponse.json({ error: 'Ticket not found' }, { status: 404, headers });
    }

    return NextResponse.json(ticket, { headers });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json(); // { message: string, sender: 'Admin' | 'User', status?: string }

        const ticket = await localDb.tickets.getById(id);
        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404, headers });
        }

        const updates: any = {
            last_updated: new Date().toISOString()
        };

        if (body.status) {
            updates.status = body.status;
        }

        if (body.message) {
            updates.messages = [
                ...ticket.messages,
                {
                    sender: body.sender || 'Admin', // Default to Admin if not specified (User app should specify 'User')
                    text: body.message,
                    timestamp: new Date().toISOString()
                }
            ];

            // If Admin replies, maybe set status to 'Pending User' or keep 'Open'. 
            // If User replies, set to 'Open' (Action Needed).
            if (body.sender === 'User') {
                updates.status = 'Open';
            }
        }

        const updatedTicket = await localDb.tickets.update(id, updates);
        return NextResponse.json(updatedTicket, { headers });

    } catch (e) {
        return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500, headers });
    }
}
