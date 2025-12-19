import { useEffect, useMemo, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";

const ANON_USER_STORAGE_KEY = "pdp_anon_user_id";

type TrackEventInput = {
  eventType: string;
  articleId?: Id<"articles">;
  metadata?: Record<string, unknown>;
  durationMs?: number;
};

const generateId = () => {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `anon_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

const ensureAnonymousUserId = () => {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    const stored = window.localStorage.getItem(ANON_USER_STORAGE_KEY);
    if (stored) {
      return stored;
    }

    const id = generateId();
    window.localStorage.setItem(ANON_USER_STORAGE_KEY, id);
    return id;
  } catch (error) {
    console.warn("[analytics] Unable to access localStorage", error);
    return generateId();
  }
};

const safeSerialize = (value: Record<string, unknown> | undefined) => {
  if (!value) {
    return undefined;
  }

  try {
    return JSON.stringify(value);
  } catch (error) {
    console.warn("[analytics] Failed to serialize metadata", error);
    return undefined;
  }
};

type ShareTrackInput = {
  channel: string;
  surface?: string;
  action?: string;
  articleId?: Id<"articles">;
};

export const useEngagementTracker = (defaults?: { articleId?: Id<"articles"> }) => {
  const recordEvent = useMutation(api.analytics.recordEngagementEvent);
  const recordShare = useMutation(api.tracking.recordShareEvent);
  const sessionIdRef = useRef<string>();
  const sessionStartRef = useRef<number>();

  const anonymousUserId = useMemo(() => ensureAnonymousUserId(), []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!sessionIdRef.current) {
      sessionIdRef.current = generateId();
    }
    if (sessionStartRef.current === undefined) {
      sessionStartRef.current = Date.now();
    }
  }, []);

  const trackEvent = async ({
    eventType,
    articleId,
    metadata,
    durationMs,
  }: TrackEventInput) => {
    if (!eventType) {
      console.warn("[analytics] eventType is required");
      return;
    }

    try {
      const payload = {
        eventType,
        articleId: articleId ?? defaults?.articleId,
        userId: anonymousUserId,
        sessionId: sessionIdRef.current,
        durationMs:
          durationMs ??
          (sessionStartRef.current !== undefined ? Date.now() - sessionStartRef.current : undefined),
        metadata: safeSerialize(metadata),
      };

      await recordEvent(payload);
      console.info("[analytics] Event recorded", payload);
    } catch (error) {
      console.warn("[analytics] Failed to record event", { eventType, error });
    }
  };

  const trackShare = async ({
    channel,
    surface,
    action,
    articleId,
  }: ShareTrackInput) => {
    const targetArticleId = articleId ?? defaults?.articleId;
    if (!targetArticleId) {
      console.warn("[analytics] Unable to record share without articleId");
      return;
    }

    const metadata: Record<string, unknown> = {
      channel,
      ...(surface ? { surface } : {}),
      ...(action ? { action } : {}),
    };

    try {
      await recordShare({
        articleId: targetArticleId,
        channel,
        context: surface,
        metadataJson: safeSerialize(metadata),
        reader: anonymousUserId
          ? {
              type: "guest" as const,
              visitorKey: anonymousUserId,
            }
          : undefined,
      });
    } catch (error) {
      console.warn("[analytics] Failed to record share event", { channel, error });
    }
  };

  return {
    trackEvent,
    userId: anonymousUserId,
    trackShare,
  };
};

