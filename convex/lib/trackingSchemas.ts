import { v } from "convex/values";

export const readerPayload = v.object({
    type: v.union(v.literal("guest"), v.literal("registered")),
    userId: v.optional(v.id("users")),
    visitorKey: v.optional(v.string()),
});

export const optionalReaderPayload = v.optional(readerPayload);

export const sessionContextPayload = v.object({
    referrer: v.optional(v.string()),
    utmSource: v.optional(v.string()),
    utmMedium: v.optional(v.string()),
    utmCampaign: v.optional(v.string()),
    deviceType: v.optional(v.string()),
});

export const optionalSessionContextPayload = v.optional(sessionContextPayload);



