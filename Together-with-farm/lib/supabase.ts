
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ftnkpsaxxdbdnrkxtvkt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0bmtwc2F4eGRiZG5ya3h0dmt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5OTE3OTgsImV4cCI6MjA4NDU2Nzc5OH0.mCEbcvs0gucOC2IBoYxS8CLAWfwDVDRdsaiD8G4dWrs';


import { Platform } from 'react-native';

// Use localStorage for web, AsyncStorage for native
const SupabaseStorage = Platform.OS === 'web' ? {
    getItem: (key: string) => {
        if (typeof window !== 'undefined') {
            return Promise.resolve(window.localStorage.getItem(key));
        }
        return Promise.resolve(null);
    },
    setItem: (key: string, value: string) => {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, value);
        }
        return Promise.resolve();
    },
    removeItem: (key: string) => {
        if (typeof window !== 'undefined') {
            window.localStorage.removeItem(key);
        }
        return Promise.resolve();
    },
} : {
    getItem: (key: string) => AsyncStorage.getItem(key),
    setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
    removeItem: (key: string) => AsyncStorage.removeItem(key),
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: SupabaseStorage as any,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
