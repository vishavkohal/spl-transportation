import { useSyncExternalStore } from 'react';

export function useOnlineStatus() {
    const isOnline = useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot
    );
    return isOnline;
}

function getSnapshot() {
    return navigator.onLine;
}

function getServerSnapshot() {
    return true; // Always return true for server-side rendering to avoid hydration mismatch
}

function subscribe(callback: () => void) {
    window.addEventListener('online', callback);
    window.addEventListener('offline', callback);
    return () => {
        window.removeEventListener('online', callback);
        window.removeEventListener('offline', callback);
    };
}
