import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { useUser } from './UserContext';

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
            const debuggerHost = Constants.expoConfig?.hostUri;
            const localhost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
            const host = debuggerHost ? debuggerHost.split(':')[0] : localhost;
            const API_URL = `http://${host}:3000`;

            const res = await fetch(`${API_URL}/api/notifications?userId=${user.id}&userType=${userData.userType}`);
            if (res.ok) {
                const data = await res.json();

                // Process notifications for App UI
                const processed = data.map((n: any) => ({
                    id: n.id,
                    title: n.title,
                    description: n.body,
                    type: n.type,
                    createdAt: n.createdAt,
                    read: n.read || false,
                    // UI Helpers
                    section: isToday(new Date(n.createdAt)) ? 'Today' : 'Yesterday',
                    icon: getIconForType(n.type),
                    highlight: !n.read,
                    time: formatTimeAgo(new Date(n.createdAt)),
                    voucherCode: n.promoCode
                }));

                setNotifications(processed);
                setUnreadCount(processed.filter((n: any) => !n.read).length);
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
