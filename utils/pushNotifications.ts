export const VAPID_PUBLIC_KEY = "BMNB-nuJA1tezUhnJ_heLEXoJmVTckLH9cVQ8H9x-GZlPOHgL9y0RAth1ZEe1N35DyyWWIiAr78xGSl3NXPhGYQ";

/**
 * Convierte la public key VAPID (base64) a Uint8Array
 */
export function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.warn("Este navegador no soporta notificaciones de escritorio.");
        return false;
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
    try {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            return null;
        }

        const registration = await navigator.serviceWorker.ready;
        const existingSubscription = await registration.pushManager.getSubscription();

        // We already have a subscription for this device
        if (existingSubscription) {
            return existingSubscription;
        }

        const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        const options = {
            userVisibleOnly: true,
            applicationServerKey
        };

        const subscription = await registration.pushManager.subscribe(options);
        return subscription;
    } catch (error) {
        console.error("Error al suscribirse a Push Notifications:", error);
        return null;
    }
}
