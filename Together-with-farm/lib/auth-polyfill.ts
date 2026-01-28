import { Platform } from 'react-native';

// Hack: Polyfill/Disable navigator.locks in Web environment to fix Supabase "signal is aborted" error
// This must run BEFORE the Supabase client is imported/initialized.
if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
        console.log('Applying navigator.locks polyfill...');
        Object.defineProperty(navigator, 'locks', {
            get: () => undefined,
            configurable: true,
        });
        console.log('navigator.locks disabled successfully.');
    } catch (e) {
        console.warn('Failed to disable navigator.locks', e);
    }
}
