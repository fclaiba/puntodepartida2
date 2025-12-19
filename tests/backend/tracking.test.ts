import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { recordShareEvent } from "../../convex/tracking";
import { ensureSession } from "../../convex/lib/tracking";
import { createMutationCtx } from "./mockConvex";

vi.mock("../../convex/_generated/server", () => ({
  mutation: (args: any) => args,
  query: (args: any) => args,
  action: (args: any) => args,
  internalMutation: (args: any) => args,
  internalQuery: (args: any) => args,
  internalAction: (args: any) => args,
}));

describe("tracking backend flows", () => {
  let consoleWarnSpy: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-20T12:00:00.000Z"));
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => { });
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => { });
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    vi.useRealTimers();
  });

  it("creates a new reading session when none exists", async () => {
    const { ctx, db } = createMutationCtx();
    const articleId = "articles_1";
    const sessionToken = "session-123";

    const result = await ensureSession(ctx, {
      articleId: articleId as any,
      sessionToken,
      eventTimestamp: new Date().toISOString(),
    });

    expect(result?.created).toBe(true);
    const sessions = db.table("reading_sessions");
    expect(sessions).toHaveLength(1);
    expect(sessions[0].sessionToken).toBe(sessionToken);
    expect(sessions[0].readerType).toBe("guest");
  });

  it("updates progress and duration only when the new values are higher", async () => {
    const { ctx, db } = createMutationCtx();
    const articleId = "articles_1";
    const sessionToken = "session-999";
    const existingId = await db.insert("reading_sessions", {
      articleId,
      sessionToken,
      readerType: "guest",
      startedAt: "2025-01-20T11:00:00.000Z",
      lastEventAt: "2025-01-20T11:00:00.000Z",
      progressPercent: 35,
      durationSeconds: 120,
    });

    await ensureSession(ctx, {
      articleId: articleId as any,
      sessionToken,
      eventTimestamp: new Date().toISOString(),
      progressPercent: 20,
      durationSeconds: 60,
    });

    let persisted = await db.get(existingId);
    expect(persisted?.progressPercent).toBe(35);
    expect(persisted?.durationSeconds).toBe(120);

    await ensureSession(ctx, {
      articleId: articleId as any,
      sessionToken,
      eventTimestamp: new Date().toISOString(),
      progressPercent: 80,
      durationSeconds: 300,
    });

    persisted = await db.get(existingId);
    expect(persisted?.progressPercent).toBe(80);
    expect(persisted?.durationSeconds).toBe(300);
  });

  it("records share events without creating a new session", async () => {
    const { ctx, db } = createMutationCtx();
    const articleId = "articles_5";

    await (recordShareEvent as any).handler(ctx, {
      articleId: articleId as any,
      channel: "copy_link",
      reader: {
        type: "guest",
        visitorKey: "anon-1",
      },
      metadataJson: JSON.stringify({ surface: "floating" }),
    });

    const shareEvents = db.table("share_events");
    expect(shareEvents).toHaveLength(1);
    expect(shareEvents[0].channel).toBe("copy_link");
    expect(shareEvents[0].readerType).toBe("guest");
    const shareMetadata = JSON.parse(shareEvents[0].metadata ?? "{}");
    expect(shareMetadata.extra?.surface).toBe("floating");

    const articleEvents = db.table("article_events");
    expect(articleEvents).toHaveLength(1);
    expect(articleEvents[0].eventType).toBe("share");
    const articleMetadata = JSON.parse(articleEvents[0].metadata ?? "{}");
    expect(articleMetadata.channel).toBe("copy_link");

    const sessions = db.table("reading_sessions");
    expect(sessions).toHaveLength(0);
  });
});

