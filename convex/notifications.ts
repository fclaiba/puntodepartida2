"use node";

import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { api } from "./_generated/api";
import webpush from "web-push";

// Define the shape of our keys
interface VapidKeys {
    publicKey: string;
    privateKey: string;
    subject: string;
}

// Helper to get VAPID keys from environment variables
const getVapidKeys = (): VapidKeys => {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT || "mailto:admin@puntodepartida.com";

    if (!publicKey || !privateKey) {
        console.warn("VAPID keys not configured in environment variables.");
        return { publicKey: "", privateKey: "", subject: "" };
    }

    return { publicKey, privateKey, subject };
};

// Send a push notification to all subscribers
export const broadcastNotification = action({
    args: {
        title: v.string(),
        body: v.string(),
        url: v.optional(v.string()),
        icon: v.optional(v.string())
    },
    handler: async (ctx, args): Promise<{ success: boolean; count?: number; error?: string }> => {
        const keys = getVapidKeys();

        // Si no hay keys configuradas, abortar silenciosamente o loguear
        if (!keys.publicKey || !keys.privateKey) {
            console.warn("Cannot send push notification: VAPID keys missing");
            return { success: false, error: "Missing VAPID configuration" };
        }

        webpush.setVapidDetails(
            keys.subject,
            keys.publicKey,
            keys.privateKey
        );

        // Fetch all active subscriptions from our database
        const subscriptions: any[] = await ctx.runQuery(api.push.getAll as any);

        if (subscriptions.length === 0) {
            return { success: true, count: 0 };
        }

        const payload = JSON.stringify({
            title: args.title,
            body: args.body,
            url: args.url || "/",
            icon: args.icon || "/pdp-logo.png" // Provide a default icon
        });

        const sendPromises = subscriptions.map((sub: any) => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.keys.p256dh,
                    auth: sub.keys.auth
                }
            };

            return webpush.sendNotification(pushSubscription, payload).catch((error: any) => {
                console.error("Error sending push to endpoint:", sub.endpoint, error);

                // If the subscription is no longer valid (e.g. 410 Gone), we should clean it up
                if (error.statusCode === 404 || error.statusCode === 410) {
                    console.log("Removing invalid subscription:", sub.endpoint);
                    return ctx.runMutation(api.push.unsubscribe, { endpoint: sub.endpoint });
                }
                return null;
            });
        });

        await Promise.allSettled(sendPromises);

        return {
            success: true,
            count: subscriptions.length
        };
    }
});
