import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { recordArticleView } from "../../convex/analytics";
import { getDashboardStats } from "../../convex/analytics";
import { createMutationCtx } from "./mockConvex";

vi.mock("../../convex/_generated/server", () => ({
  mutation: (args: any) => args,
  query: (args: any) => args,
  action: (args: any) => args,
  internalMutation: (args: any) => args,
  internalQuery: (args: any) => args,
  internalAction: (args: any) => args,
}));

describe("analytics flows", () => {
  let consoleWarnSpy: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-20T09:00:00.000Z"));
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => { });
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => { });
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    vi.useRealTimers();
  });

  it("increments article counters and logs events when recording a view", async () => {
    const { ctx, db } = createMutationCtx();
    const articleId = "articles_101";

    db.seed("articles", {
      _id: articleId,
      title: "Artículo demo",
      section: "politica",
      imageUrl: "https://example.com/cover.jpg",
      description: "demo",
      content: "demo",
      author: "Autor",
      date: "2025-01-19T12:00:00.000Z",
      readTime: 5,
      featured: false,
      views: 0,
    });

    await (recordArticleView as any).handler(ctx, {
      articleId: articleId as any,
      sessionToken: "session-abc",
      reader: {
        type: "guest",
        visitorKey: "visitor-123",
      },
      context: {
        referrer: "https://google.com",
        utmSource: "newsletter",
        deviceType: "desktop",
      },
    });

    const articles = db.table("articles");
    expect(articles[0].views).toBe(1);

    const viewRows = db.table("article_views");
    expect(viewRows).toHaveLength(1);
    expect(viewRows[0].articleId).toBe(articleId);

    const sessions = db.table("reading_sessions");
    expect(sessions).toHaveLength(1);
    expect(sessions[0].sessionToken).toBe("session-abc");

    const events = db.table("article_events");
    expect(events).toHaveLength(2);
    const eventTypes = events.map((event) => event.eventType).sort();
    expect(eventTypes).toEqual(["article_view", "reading_session_started"]);
  });

  it("aggregates dashboard stats using recent view events", async () => {
    const { ctx, db } = createMutationCtx();

    db.seed("users", {
      _id: "users_1",
      email: "qa@example.com",
      name: "QA User",
      password: "hash",
      role: "admin",
      createdAt: "2024-12-01T00:00:00.000Z",
      lastLogin: "2025-01-19T23:00:00.000Z",
    });

    db.seed("articles", {
      _id: "articles_1",
      title: "Nota A",
      section: "politica",
      imageUrl: "",
      description: "",
      content: "",
      author: "Reporter",
      date: "2025-01-20T08:00:00.000Z",
      readTime: 4,
      featured: false,
      views: 6,
    });

    db.seed("articles", {
      _id: "articles_2",
      title: "Nota B",
      section: "economia",
      imageUrl: "",
      description: "",
      content: "",
      author: "Reporter",
      date: "2024-12-28T08:00:00.000Z",
      readTime: 3,
      featured: false,
      views: 2,
    });

    db.seed("article_views", {
      _id: "article_views_1",
      articleId: "articles_1",
      timestamp: "2025-01-20T07:30:00.000Z",
    });
    db.seed("article_views", {
      _id: "article_views_2",
      articleId: "articles_1",
      timestamp: "2025-01-15T07:30:00.000Z",
    });
    db.seed("article_views", {
      _id: "article_views_3",
      articleId: "articles_2",
      timestamp: "2024-12-28T07:30:00.000Z",
    });

    const stats = await (getDashboardStats as any).handler(ctx, {} as any);

    expect(stats.totalArticles).toBe(2);
    expect(stats.totalUsers).toBe(1);
    expect(stats.totalViews).toBe(8);
    expect(stats.viewsToday).toBe(1);
    expect(stats.viewsThisWeek).toBe(2);
    expect(stats.viewsBySection.politica).toBe(6);
    expect(stats.topArticles[0].title).toBe("Nota A");
  });
});

