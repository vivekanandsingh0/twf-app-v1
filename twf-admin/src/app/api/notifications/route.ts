import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; // Using the supabase client from lib

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

    // If Admin requesting list for dashboard (usually admin=true or no user params)
    // The previous logic had filtering for App simulation here. 
    // Since App now fetches directly from Supabase, this endpoint is mainly for the Admin Panel itself to list created notifications.

    // Fetch all notifications (Admin View)
    const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500, headers });
    }

    // Map back to camelCase for Admin UI consistency if needed, or update Admin UI to use snake_case
    // Assuming Admin UI expects camelCase based on previous localDb structure
    const mapped = notifications?.map(n => ({
        id: n.id,
        title: n.title,
        body: n.body,
        type: n.type,
        targetType: n.target_type,
        targetId: n.target_id,
        promoCode: n.promo_code,
        createdAt: n.created_at,
        read: n.is_read
    }));

    return NextResponse.json(mapped, { headers });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const newNotification = {
            title: body.title,
            body: body.body,
            type: body.type || 'info',
            target_type: body.targetType, // Map camelCase to snake_case
            target_id: body.targetId || null,
            promo_code: body.promoCode || null,
            // id and created_at handled by DB defaults
        };

        const { data, error } = await supabase
            .from('notifications')
            .insert([newNotification])
            .select()
            .single();

        if (error) throw error;

        // Map back for response
        const responseData = {
            ...data,
            targetType: data.target_type,
            promoCode: data.promo_code,
            createdAt: data.created_at
        };

        return NextResponse.json(responseData, { status: 201, headers });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || 'Failed to create notification' }, { status: 500, headers });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400, headers });

        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true }, { headers });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || 'Failed to delete' }, { status: 500, headers });
    }
}
