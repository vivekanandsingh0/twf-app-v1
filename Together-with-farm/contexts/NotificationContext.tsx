import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from './UserContext';
import { supabase } from '../lib/supabase';

export interface Notification {
    id: string;
    title: string;
    body: string;
    description?: string; // App uses description, valid to map body -> description
    type: 'info' | 'alert' | 'promo' | 'order' | 'success';
    createdAt: string;
    read: boolean;
    section?: string; // Today, Yesterday
    icon?: string;
    highlight?: boolean;
    voucherCode?: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const { user, userData } = useUser();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        if (!user) return;

        try {
            // Build query based on user type and ID
            let query = supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false });

            // We need OR condition: target_type='All' OR (target_type='Specific' AND target_id=user.id) OR (target_type='AllUsers'/'AllVendors')
            // Supabase .or() syntax: 'column.eq.value, column.eq.value'
            // But we have mixed AND/OR logic. Simplest is to fetch all potential relevant ones or use multiple queries.
            // Using .or(): target_type.eq.All, target_type.eq.AllUsers (if user), target_type.eq.Specific.and.target_id.eq.UserID

            // Constructing the OR string
            let orCondition = `target_type.eq.All`;

            if (userData?.userType === 'User') {
                orCondition += `,target_type.eq.AllUsers`;
            } else if (userData?.userType === 'Vendor') {
                orCondition += `,target_type.eq.AllVendors`;
            }

            // For Specific, we need (target_type=Specific AND target_id=user.id)
            // Supabase OR with AND inside is tricky in one string.
            // Easier: Fetch ALL potential types then filter in memory? No, wasteful.
            // Better: `target_type.eq.All, target_type.eq.element, and(target_type.eq.Specific, target_id.eq.${user.id})`
            // Syntax: or(target_type.eq.All, target_type.eq.AllUsers, and(target_type.eq.Specific, target_id.eq.123))

            // The 'and' inside 'or' syntax: `target_type.eq.Specific.and(target_id.eq.${user.id})` NO
            // Correct syntax: `target_type.eq.All, target_type.eq.AllUsers, and(target_type.eq.Specific,target_id.eq.${user.id})`

            orCondition += `,and(target_type.eq.Specific,target_id.eq.${user.id})`;

            const { data, error } = await query.or(orCondition);

            if (error) throw error;

            if (data) {
                const processed: Notification[] = data.map((n: any) => ({
                    id: n.id,
                    title: n.title,
                    body: n.body,
                    description: n.body, // Mapping body to description as well for UI compatibility if needed
                    type: n.type,
                    createdAt: n.created_at,
                    read: n.is_read || false,
                    // UI Helpers
                    section: isToday(new Date(n.created_at)) ? 'Today' : 'Yesterday',
                    icon: getIconForType(n.type),
                    highlight: !n.is_read,
                    voucherCode: n.promo_code
                }));

                setNotifications(processed);
                setUnreadCount(processed.filter((n: any) => !n.read).length); // Logic simplified
            }
        } catch (e) {
            console.log("Failed to fetch notifications", e);
        }
    };

    // Helpers
    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const formatTimeAgo = (date: Date) => {
        const diff = (new Date().getTime() - date.getTime()) / 1000;
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}min ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return 'Yesterday';
    };

    const getIconForType = (type: string) => {
        switch (type) {
            case 'order': return 'cube-outline';
            case 'promo': return 'gift-outline';
            case 'alert': return 'alert-circle-outline';
            case 'success': return 'checkmark-circle-outline';
            default: return 'information-circle-outline';
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000); // 10s Poll
        return () => clearInterval(interval);
    }, [user]);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            refreshNotifications: fetchNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotifications must be used within NotificationProvider');
    return context;
}
