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

import AsyncStorage from '@react-native-async-storage/async-storage';

// ... Notification Interface ...

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    refreshNotifications: () => Promise<void>;
    markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const { user, userData } = useUser();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        if (!user) return;

        try {
            // Get local read/seen state
            const readStorage = await AsyncStorage.getItem(`read_notifications_${user.id}`);
            const readIds = readStorage ? JSON.parse(readStorage) : [];

            // Build query based on user type and ID
            let query = supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false });

            let orCondition = `target_type.eq.All`;
            if (userData?.userType === 'User') {
                orCondition += `,target_type.eq.AllUsers`;
            } else if (userData?.userType === 'Vendor') {
                orCondition += `,target_type.eq.AllVendors`;
            }
            orCondition += `,and(target_type.eq.Specific,target_id.eq.${user.id})`;

            const { data, error } = await query.or(orCondition);

            if (error) throw error;

            if (data) {
                const processed: Notification[] = data.map((n: any) => {
                    const isReadLocally = readIds.includes(n.id);
                    const isRead = n.is_read || isReadLocally || false;

                    return {
                        id: n.id,
                        title: n.title,
                        body: n.body,
                        description: n.body,
                        type: n.type,
                        createdAt: n.created_at,
                        read: isRead,
                        section: isToday(new Date(n.created_at)) ? 'Today' : 'Yesterday',
                        icon: getIconForType(n.type),
                        highlight: !isRead,
                        voucherCode: n.promo_code,
                        time: formatTimeAgo(new Date(n.created_at)) // Helper needs to be available
                    };
                });

                setNotifications(processed);
                setUnreadCount(processed.filter(n => !n.read).length);
            }
        } catch (e) {
            console.log("Failed to fetch notifications", e);
        }
    };

    const markAllAsRead = async () => {
        if (!user) return;

        // 1. Optimistic update
        const updated = notifications.map(n => ({ ...n, read: true, highlight: false }));
        setNotifications(updated);
        setUnreadCount(0);

        // 2. Persist to AsyncStorage
        try {
            const allIds = updated.map(n => n.id);
            await AsyncStorage.setItem(`read_notifications_${user.id}`, JSON.stringify(allIds));
        } catch (e) {
            console.error("Failed to save read state", e);
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
        if (user) {
            fetchNotifications();
            // Poll less frequently to avoid spamming
            const interval = setInterval(fetchNotifications, 15000);
            return () => clearInterval(interval);
        }
    }, [user]);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            refreshNotifications: fetchNotifications,
            markAllAsRead
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
